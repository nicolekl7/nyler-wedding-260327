const SHUTTLE_SHEET_URL = Deno.env.get("SHUTTLE_SHEET_URL");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!SHUTTLE_SHEET_URL) {
      return new Response(JSON.stringify({ ok: false, error: "Server misconfigured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const params = new URLSearchParams({
      timestamp: String(body.timestamp ?? ""),
      fullName: String(body.fullName ?? ""),
      partySize: String(body.partySize ?? ""),
      arrivalWave: String(body.arrivalWave ?? ""),
      departureWave: String(body.departureWave ?? ""),
      whatsappOptin: String(body.whatsappOptin ?? ""),
      travelDetails: String(body.travelDetails ?? ""),
    });

    // Fire-and-forget forward to the Apps Script sheet; failures here must
    // never surface to the guest since the DB insert already succeeded.
    fetch(`${SHUTTLE_SHEET_URL}?${params.toString()}`).catch(() => {});

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch {
    return new Response(JSON.stringify({ ok: false, error: "Bad request" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
