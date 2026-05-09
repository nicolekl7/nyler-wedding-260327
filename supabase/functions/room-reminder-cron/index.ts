import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const RECEIPT_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbyNmaFh0PpuYkB2nxshXCuFv2Vxvnv_QFxSl67g1qdE8--Sd2r_l0rhbiW0NprZJqsR/exec";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS_HEADERS });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, serviceRoleKey);

  const sixDaysAgo = new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString();

  const { data: candidates, error } = await supabase
    .from("invited_guests")
    .select("id, first_name, last_name, email, notes")
    .eq("room_preference", "Choosing Room Later")
    .lte("submitted_at", sixDaysAgo)
    .not("email", "is", null);

  if (error) {
    return new Response(JSON.stringify({ ok: false, error: error.message }), {
      status: 500,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }

  const eligible = (candidates ?? []).filter(
    (g) => !String(g.notes ?? "").includes("[reminder-sent]")
  );

  let sent = 0;

  for (const guest of eligible) {
    const guestName = `${guest.first_name ?? ""} ${guest.last_name ?? ""}`.trim();

    const form = new URLSearchParams();
    form.append("email", guest.email);
    form.append("guestNames", guestName);
    form.append("accommodation", "Choosing Room Later");
    form.append("reminderOnly", "true");
    form.append("roomReminder", "true");

    try {
      await fetch(RECEIPT_SCRIPT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: form.toString(),
      });
    } catch {
      // fire-and-forget; log and continue
      console.error(`Failed to send reminder for guest ${guest.id}`);
    }

    const updatedNotes = [String(guest.notes ?? "").trim(), "[reminder-sent]"]
      .filter(Boolean)
      .join(" ");

    await supabase
      .from("invited_guests")
      .update({ notes: updatedNotes })
      .eq("id", guest.id);

    sent++;
  }

  return new Response(
    JSON.stringify({ ok: true, candidates: eligible.length, sent }),
    { headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
  );
});
