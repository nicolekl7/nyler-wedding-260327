import { serve } from "https://deno.land/std@0.208.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const FROM_EMAIL = Deno.env.get("RESEND_FROM_EMAIL") ?? "rsvp@yourdomain.com";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const EVENT_LABELS: Record<string, string> = {
  welcome_party_rsvp: "Welcome Pizza Party — Wednesday, Sept 16 · 6:30 PM",
  wedding_day_rsvp: "The Wedding Day — Thursday, Sept 17 · 4:30 PM",
  pool_day_rsvp: "Recovery Pool Day — Friday, Sept 18 · 12:00 PM",
};

function buildEmailHtml(params: {
  guestNames: string[];
  eventRsvps: Record<string, string>;
  accommodation: string;
  dietary: string;
  notes: string;
}): string {
  const { guestNames, eventRsvps, accommodation, dietary, notes } = params;

  const guestList = guestNames.filter(Boolean).join(", ");

  const eventRows = Object.entries(EVENT_LABELS)
    .map(([key, label]) => {
      const rsvp = eventRsvps[key];
      const status = rsvp === "accept" ? "Attending" : "Declining";
      const color = rsvp === "accept" ? "#4a7c59" : "#999999";
      return `
        <tr>
          <td style="padding:10px 0;font-family:Georgia,serif;font-size:14px;color:#333;border-bottom:1px solid #f0ece8;">${label}</td>
          <td style="padding:10px 0;font-family:'Helvetica Neue',Arial,sans-serif;font-size:12px;letter-spacing:0.1em;text-transform:uppercase;color:${color};text-align:right;border-bottom:1px solid #f0ece8;white-space:nowrap;">${status}</td>
        </tr>`;
    })
    .join("");

  const detailRows = [
    ["Accommodation", accommodation || "—"],
    dietary ? ["Dietary Restrictions", dietary] : null,
    notes ? ["Notes", notes] : null,
  ]
    .filter(Boolean)
    .map(
      ([label, value]) => `
        <tr>
          <td style="padding:6px 0;font-family:'Helvetica Neue',Arial,sans-serif;font-size:11px;letter-spacing:0.15em;text-transform:uppercase;color:#999;vertical-align:top;width:40%;padding-right:16px;">${label}</td>
          <td style="padding:6px 0;font-family:Georgia,serif;font-size:14px;color:#333;">${value}</td>
        </tr>`
    )
    .join("");

  const paymentReminder =
    accommodation && accommodation !== "Not Staying Onsite"
      ? `
        <div style="background:#f9f7f4;padding:20px 24px;margin-bottom:36px;border-left:3px solid #c9a96e;">
          <p style="font-family:'Helvetica Neue',Arial,sans-serif;font-size:11px;letter-spacing:0.15em;text-transform:uppercase;color:#999;margin:0 0 8px;">Payment Reminder</p>
          <p style="font-family:Georgia,serif;font-size:14px;color:#555;margin:0;line-height:1.7;">
            Your room preference is noted, but your room is not reserved until payment is received.
            Please complete your payment at
            <a href="https://paypal.me/nylerwedding" style="color:#c9a96e;text-decoration:none;">paypal.me/nylerwedding</a>.
          </p>
        </div>`
      : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>RSVP Confirmed — Nicole &amp; Tyler</title>
</head>
<body style="margin:0;padding:0;background:#f4f1ed;">
  <div style="max-width:580px;margin:48px auto;background:#ffffff;padding:56px 48px;">

    <div style="text-align:center;margin-bottom:44px;">
      <p style="font-family:'Helvetica Neue',Arial,sans-serif;font-size:10px;letter-spacing:0.35em;text-transform:uppercase;color:#b0a898;margin:0 0 14px;">September 17, 2026 · Tuscany, Italy</p>
      <h1 style="font-family:Georgia,serif;font-size:30px;font-weight:normal;color:#1a1a1a;margin:0 0 16px;">Nicole &amp; Tyler</h1>
      <div style="width:40px;height:1px;background:#c9a96e;margin:0 auto 16px;"></div>
      <p style="font-family:'Helvetica Neue',Arial,sans-serif;font-size:11px;letter-spacing:0.25em;text-transform:uppercase;color:#999;margin:0;">RSVP Confirmed</p>
    </div>

    <p style="font-family:Georgia,serif;font-size:15px;color:#555;line-height:1.75;margin:0 0 36px;">
      ${guestList ? `Thank you, <strong style="color:#1a1a1a;">${guestList}</strong> — we've received your RSVP.` : "Thank you — we've received your RSVP."} Here's a summary of your selections.
    </p>

    <table style="width:100%;border-collapse:collapse;margin-bottom:36px;">
      ${eventRows}
    </table>

    <table style="width:100%;border-collapse:collapse;margin-bottom:36px;">
      ${detailRows}
    </table>

    ${paymentReminder}

    <div style="text-align:center;padding-top:36px;border-top:1px solid #f0ece8;">
      <p style="font-family:Georgia,serif;font-size:14px;color:#777;margin:0 0 10px;">Questions? We'd love to hear from you.</p>
      <a href="mailto:nicoleandtylersitalianwedding@gmail.com" style="font-family:'Helvetica Neue',Arial,sans-serif;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:#c9a96e;text-decoration:none;">nicoleandtylersitalianwedding@gmail.com</a>
    </div>

  </div>
</body>
</html>`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { email, guestNames, eventRsvps, accommodation, dietary, notes } =
      await req.json();

    if (!email) {
      return new Response(JSON.stringify({ error: "email is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const html = buildEmailHtml({ guestNames, eventRsvps, accommodation, dietary, notes });

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: `Nicole & Tyler <${FROM_EMAIL}>`,
        to: [email],
        subject: "Your RSVP is confirmed — Nicole & Tyler's Wedding",
        html,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("Resend error:", errText);
      return new Response(JSON.stringify({ error: errText }), {
        status: res.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Edge function error:", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
