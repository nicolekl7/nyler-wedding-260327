import { useState } from "react";
import { Link } from "react-router-dom";
import { Check, X } from "lucide-react";
import Layout from "@/components/Layout";
import FadeIn from "@/components/FadeIn";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// ---------- name normalization + nickname matching ----------
const NICKNAMES: Record<string, string[]> = {
  ala: ["alicja"], alicja: ["ala"],
  bri: ["brianna"], brianna: ["bri"],
  nick: ["nicholas"], nicholas: ["nick"],
  ray: ["raymond"], raymond: ["ray"],
  mike: ["michael"], michael: ["mike"],
  tom: ["thomas"], thomas: ["tom"],
  cathy: ["catherine"], catherine: ["cathy"],
  fil: ["filip"], filip: ["fil"],
};

const norm = (s: string) =>
  (s || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const firstLast = (full: string) => {
  const parts = norm(full).split(" ").filter(Boolean);
  if (parts.length === 0) return { first: "", last: "" };
  return { first: parts[0], last: parts[parts.length - 1] };
};

const firstMatches = (a: string, b: string) => {
  if (!a || !b) return false;
  if (a === b) return true;
  if (a.length >= 3 && b.length >= 3 && (a.startsWith(b) || b.startsWith(a))) return true;
  if ((NICKNAMES[a] || []).includes(b)) return true;
  if ((NICKNAMES[b] || []).includes(a)) return true;
  return false;
};

const namesMatch = (a: string, b: string) => {
  const A = firstLast(a);
  const B = firstLast(b);
  if (!A.last || !B.last) return false;
  return A.last === B.last && firstMatches(A.first, B.first);
};

// Parse guest_names (JSON array string or comma/plus separated)
const parseGuestList = (raw: string | null | undefined): string[] => {
  if (!raw) return [];
  const s = raw.trim();
  if (s.startsWith("[")) {
    try {
      const arr = JSON.parse(s);
      if (Array.isArray(arr)) return arr.map((x) => String(x).trim()).filter(Boolean);
    } catch { /* fall through */ }
  }
  return s.split(/[,;+&]|\band\b/i).map((x) => x.trim()).filter(Boolean);
};

// ---------- display helpers ----------
type WaveDetail = { time: string; from: string; to: string; badge: string };
const ARRIVAL_WAVES: Record<string, WaveDetail> = {
  wave_1: { time: "2:00 pm", from: "Siena train station", to: "Laticastelli", badge: "Wave 1" },
  wave_2: { time: "3:00 pm", from: "Siena train station", to: "Laticastelli", badge: "Wave 2" },
};
const DEPARTURE_WAVES: Record<string, WaveDetail> = {
  wave_1: { time: "10:00 am", from: "Laticastelli", to: "Siena train station", badge: "Wave 1" },
  wave_2: { time: "11:15 am", from: "Laticastelli", to: "Siena train station", badge: "Wave 2" },
  wave_3: { time: "12:30 pm", from: "Laticastelli", to: "Siena train station", badge: "Wave 3" },
};

interface LookupResult {
  matchedName: string;
  invited: {
    welcome_party_rsvp: string | null;
    pool_day_rsvp: string | null;
    wedding_day_rsvp: string | null;
    email: string | null;
    dietary_restrictions: string | null;
  } | null;
  shuttle: {
    arrival_wave: string;
    departure_wave: string;
    departure_plan: string | null;
    submitted_by: string;
  } | null;
  room: {
    category_name: string | null;
    guest_names: string;
    payment_status: string;
  } | null;
}

const Shuttle = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<LookupResult | null>(null);
  const [notFound, setNotFound] = useState(false);

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      toast.error("Please enter your name and email.");
      return;
    }
    setLoading(true);
    setResult(null);
    setNotFound(false);

    try {
      const [invRes, shuttleRes, bookRes, catRes] = await Promise.all([
        supabase.from("invited_guests").select("first_name,last_name,email,welcome_party_rsvp,pool_day_rsvp,wedding_day_rsvp,dietary_restrictions"),
        supabase.from("shuttle_signups").select("full_name,email,arrival_wave,departure_wave,departure_plan,party_size,guest_names"),
        supabase.from("room_bookings").select("email,guest_names,room_category_id,payment_status,is_released"),
        supabase.from("room_categories").select("id,name"),
      ]);

      if (invRes.error) throw invRes.error;
      if (shuttleRes.error) throw shuttleRes.error;
      if (bookRes.error) throw bookRes.error;
      if (catRes.error) throw catRes.error;

      const invited = (invRes.data || []).find((g) => {
        const full = `${g.first_name} ${g.last_name}`;
        return namesMatch(full, name);
      });

      if (!invited) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      const matchedFullName = `${invited.first_name} ${invited.last_name}`;

      const shuttle = (shuttleRes.data || []).find((s) => {
        if (namesMatch(s.full_name, matchedFullName)) return true;
        const guests = parseGuestList(s.guest_names);
        return guests.some((g) => namesMatch(g, matchedFullName));
      });

      const catMap = new Map((catRes.data || []).map((c) => [c.id, c.name]));
      const room = (bookRes.data || []).find((b) => {
        if (b.is_released) return false;
        const guests = parseGuestList(b.guest_names);
        return guests.some((g) => namesMatch(g, matchedFullName));
      });

      setResult({
        matchedName: matchedFullName,
        invited: {
          welcome_party_rsvp: invited.welcome_party_rsvp,
          pool_day_rsvp: invited.pool_day_rsvp,
          wedding_day_rsvp: invited.wedding_day_rsvp,
          email: invited.email,
          dietary_restrictions: invited.dietary_restrictions,
        },
        shuttle: shuttle
          ? {
              arrival_wave: shuttle.arrival_wave,
              departure_wave: shuttle.departure_wave,
              departure_plan: shuttle.departure_plan,
              submitted_by: shuttle.full_name,
            }
          : null,
        room: room
          ? {
              category_name: catMap.get(room.room_category_id) || null,
              guest_names: room.guest_names,
              payment_status: room.payment_status,
            }
          : null,
      });
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setResult(null);
    setNotFound(false);
    setName("");
    setEmail("");
  };

  return (
    <Layout>
      <section
        className={`page-section w-[90%] mx-auto ${
          result ? "max-w-[720px] !py-8 sm:!py-10 md:!py-12 lg:!py-14" : "max-w-[560px]"
        }`}
      >
        <FadeIn>
          {!result && (
            <>
              <h1 className="heading-section mb-4 text-center">Check Your Submission</h1>
              <div className="w-12 h-px bg-primary mx-auto mb-10" />
              <p className="body-editorial mx-auto text-balance mb-10 text-center">
                Enter your name and email to review your RSVP, shuttle times, and room reservation.
              </p>
            </>
          )}

          {!result && (
            <form onSubmit={handleLookup} className="space-y-8 max-w-md mx-auto">
              <div>
                <label className="block font-body text-xs uppercase tracking-[0.25em] text-muted-foreground mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="First and last name"
                  className="w-full bg-transparent border-b border-border py-2 font-body text-foreground focus:outline-none focus:border-primary transition-colors"
                />
              </div>

              <div>
                <label className="block font-body text-xs uppercase tracking-[0.25em] text-muted-foreground mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                  className="w-full bg-transparent border-b border-border py-2 font-body text-foreground focus:outline-none focus:border-primary transition-colors"
                />
              </div>

              {notFound && (
                <p className="font-body text-sm text-destructive text-center">
                  We couldn't find a matching invitation. Double-check your name and email, or reach out to Nicole & Tyler.
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-primary-foreground py-3 font-body text-sm uppercase tracking-[0.25em] hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {loading ? "Looking up…" : "Check My Submission"}
              </button>
            </form>
          )}

          {result && (() => {
            const arr = ARRIVAL_WAVES[result.shuttle?.arrival_wave ?? ""];
            const dep = DEPARTURE_WAVES[result.shuttle?.departure_wave ?? ""];

            const seen = new Set<string>();
            const roomGuests = parseGuestList(result.room?.guest_names).filter((g) => {
              const key = norm(g);
              if (!key || seen.has(key)) return false;
              seen.add(key);
              return true;
            });

            const eventRows: Array<{ label: string; day: string; rsvp: string | null | undefined }> = [
              { label: "Welcome party", day: "Wed, Sept 16", rsvp: result.invited?.welcome_party_rsvp },
              { label: "Pool day", day: "Thu, Sept 17", rsvp: result.invited?.pool_day_rsvp },
              { label: "Wedding day", day: "Fri, Sept 18", rsvp: result.invited?.wedding_day_rsvp },
            ];

            return (
              <div className="space-y-3">
                <div className="text-center">
                  <h2 className="font-serif text-xl sm:text-2xl text-foreground leading-[1.05] tracking-tight">
                    Your Details
                  </h2>
                </div>

                {/* Events */}
                <Card>
                  <CardTitle>Events</CardTitle>
                  <ul className="space-y-1.5">
                    {eventRows.map((e) => {
                      const attending = e.rsvp === "yes" || e.rsvp === "accept";
                      const declined = e.rsvp === "no" || e.rsvp === "decline";

                      return (
                        <li key={e.label} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span
                              className={
                                "flex items-center justify-center w-5 h-5 rounded-full border " +
                                (attending
                                  ? "bg-primary border-primary text-primary-foreground"
                                  : declined
                                  ? "border-border text-muted-foreground"
                                  : "border-border text-transparent")
                              }
                              aria-label={attending ? "attending" : declined ? "not attending" : "no response"}
                            >
                              {attending && <Check size={12} strokeWidth={2.5} />}
                              {declined && <X size={12} strokeWidth={2.5} />}
                            </span>
                            <span className="font-serif text-base text-foreground">{e.label}</span>
                          </div>
                          <span className="font-body text-[11px] uppercase tracking-[0.28em] text-muted-foreground">
                            {e.day}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </Card>

                {/* Shuttle */}
                <Card>
                  <CardTitle>Shuttle</CardTitle>
                  {result.shuttle ? (
                    <div className="grid grid-cols-2 gap-4">
                      <WaveBlock label="Arriving" wave={arr} />
                      <WaveBlock label="Departing" wave={dep} />
                    </div>
                  ) : (
                    <p className="font-body text-sm text-muted-foreground">
                      No shuttle submission on file. If someone in your party filled it out for you,
                      ask them to confirm your name is included.
                    </p>
                  )}
                </Card>

                {/* Room */}
                <Card>
                  <p className="font-body text-[11px] uppercase tracking-[0.28em] text-muted-foreground mb-1">
                    Your room
                  </p>
                  <h3 className="font-serif text-lg text-foreground leading-tight mb-2">
                    {result.room?.category_name || "Not staying onsite"}
                  </h3>

                  {roomGuests.length > 0 && (
                    <>
                      <div className="h-px bg-border/70 mb-3" />
                      <GuestChips names={roomGuests} />
                    </>
                  )}

                  {result.invited?.dietary_restrictions && (
                    <>
                      <div className="h-px bg-border/70 my-1.5" />
                      <p className="font-body text-[11px] uppercase tracking-[0.28em] text-muted-foreground mb-1">
                        Dietary notes
                      </p>
                      <p className="font-body text-sm text-foreground">
                        {result.invited.dietary_restrictions}
                      </p>
                    </>
                  )}

                  {result.shuttle?.submitted_by && (
                    <p className="font-body text-xs text-muted-foreground mt-2 leading-relaxed">
                      Submitted by {result.shuttle.submitted_by}. Something look wrong? Reply to your
                      confirmation email and we'll fix it.
                    </p>
                  )}
                </Card>

                <div className="flex items-center justify-center gap-8">
                  <button
                    type="button"
                    onClick={reset}
                    className="font-body text-[11px] uppercase tracking-[0.28em] text-foreground hover:text-muted-foreground transition-colors underline underline-offset-[6px]"
                  >
                    Look up another name
                  </button>
                  <Link
                    to="/the-weekend"
                    className="font-body text-[11px] uppercase tracking-[0.28em] text-foreground hover:text-muted-foreground transition-colors underline underline-offset-[6px]"
                  >
                    Full schedule
                  </Link>
                </div>
              </div>
            );
          })()}
        </FadeIn>
      </section>
    </Layout>
  );
};

const Card = ({ children }: { children: React.ReactNode }) => (
  <div className="border border-border/70 bg-card p-3 sm:p-4">{children}</div>
);

const CardTitle = ({ children }: { children: React.ReactNode }) => (
  <h3 className="font-serif text-lg text-foreground mb-1.5">{children}</h3>
);

const WaveBlock = ({
  label,
  wave,
}: {
  label: string;
  wave: WaveDetail | undefined;
}) => (
  <div>
    <p className="font-body text-[11px] uppercase tracking-[0.28em] text-muted-foreground mb-1">
      {label}
    </p>
    {wave ? (
      <>
        <p className="font-serif text-xl text-foreground leading-none mb-1">{wave.time}</p>
        <p className="font-body text-sm text-muted-foreground leading-snug">
          {wave.from}
          <br />
          to {wave.to}
        </p>
        <span className="inline-block mt-1.5 font-body text-[10px] uppercase tracking-[0.22em] text-foreground bg-secondary px-3 py-1">
          {wave.badge}
        </span>
      </>
    ) : (
      <p className="font-serif text-base text-foreground leading-tight">
        Not taking the shuttle
      </p>
    )}
  </div>
);

const GuestChips = ({ names }: { names: string[] }) => (
  <div className="grid grid-cols-2 gap-1.5">
    {names.map((n) => (
      <span
        key={n}
        className="font-body text-sm text-foreground border border-border/80 px-3 py-1.5 text-center truncate"
      >
        {n}
      </span>
    ))}
  </div>
);

export default Shuttle;
