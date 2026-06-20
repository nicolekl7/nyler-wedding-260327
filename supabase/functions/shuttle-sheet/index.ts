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
    const form = new URLSearchParams();
    form.append("timestamp", new Date().toISOString());
    form.append("fullName", body.fullName ?? "");
    form.append("email", body.email ?? "");
    form.append("partySize", String(body.partySize ?? ""));
    form.append("arrivalWave", body.arrivalWave ?? "");
    form.append("departureWave", body.departureWave ?? "");
    form.append("whatsappOptin", body.whatsappOptin ? "Yes" : "No");
    form.append("travelDetails", body.travelDetails ?? "");
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
