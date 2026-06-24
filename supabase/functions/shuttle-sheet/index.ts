import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const url = Deno.env.get("SHUTTLE_SHEET_URL");
    if (!url) throw new Error("SHUTTLE_SHEET_URL not set");
    const body = await req.json();

    const passportPaths: string[] = Array.isArray(body.passportPaths) ? body.passportPaths : [];
    let passportLinks = "";
    if (passportPaths.length > 0) {
      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      const supabase = createClient(supabaseUrl, serviceRoleKey);
      const links: string[] = [];
      for (const path of passportPaths) {
        const { data } = await supabase.storage.from("passports").createSignedUrl(path, 60 * 60 * 24 * 7);
        if (data?.signedUrl) links.push(data.signedUrl);
      }
      passportLinks = links.join(", ");
    }

    const additionalNames: string[] = Array.isArray(body.guestNames) ? body.guestNames : [];

    const form = new URLSearchParams();
    form.append("timestamp", new Date().toISOString());
    form.append("fullName", body.fullName ?? "");
    form.append("email", body.email ?? "");
    form.append("partySize", String(body.partySize ?? ""));
    form.append("arrivalWave", body.arrivalWave ?? "");
    form.append("departureWave", body.departureWave ?? "");
    form.append("whatsappOptin", body.whatsappOptin ? "Yes" : "No");
    form.append("travelDetails", body.travelDetails ?? "");
    form.append("passportLinks", passportLinks);
    form.append("additionalNames", additionalNames.join(", "));
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: form.toString(),
    });
    const text = await res.text();
    return new Response(JSON.stringify({ ok: res.ok, status: res.status, body: text }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200,
    });
  } catch (err) {
    console.error("shuttle-sheet error", err);
    return new Response(JSON.stringify({ ok: false, error: String(err) }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500,
    });
  }
});
