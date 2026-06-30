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

    const names: string[] = Array.isArray(body.names) ? body.names : [];
    const passportFiles: { base64: string; mimeType: string; fileName: string }[] = Array.isArray(body.passportFiles)
      ? body.passportFiles
      : [];

    const payload = {
      timestamp: new Date().toISOString(),
      email: body.email ?? "",
      partySize: body.partySize ?? null,
      names,
      arrivalShuttle: body.arrivalShuttle ?? "",
      arrivalPlan: body.arrivalPlan ?? null,
      departureShuttle: body.departureShuttle ?? "",
      departurePlan: body.departurePlan ?? null,
      passportUploaded: Boolean(body.passportUploaded),
      passportFiles,
      florenceRsvp: body.florenceRsvp ?? null,
      travelPlans: body.travelPlans ?? "",
    };

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
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
