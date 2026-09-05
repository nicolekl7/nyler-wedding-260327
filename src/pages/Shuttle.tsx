import { useState } from "react";
import { Link } from "react-router-dom";
import { Check, X } from "lucide-react";
import Layout from "@/components/Layout";
import FadeIn from "@/components/FadeIn";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { norm, namesMatch, parseGuestList } from "@/lib/guestMatching";
import { formatRoomLabel } from "@/lib/roomLabel";

// ---------- display helpers ----------
type WaveDetail = { time: string; from: string; to: string };
const ARRIVAL_WAVES: Record<string, WaveDetail> = {
  wave_1: { time: "2:00 pm", from: "Siena train station", to: "Laticastelli" },
  wave_2: { time: "3:00 pm", from: "Siena train station", to: "Laticastelli" },
};
const DEPARTURE_WAVES: Record<string, WaveDetail> = {
  wave_1: { time: "10:00 am", from: "Laticastelli", to: "Siena train station" },
  wave_2: { time: "11:15 am", from: "Laticastelli", to: "Siena train station" },
  wave_3: { time: "12:30 pm", from: "Laticastelli", to: "Siena train station" },
};

// ---------- authoritative roommate groupings (names only; room type/# untouched) ----------
const ROOM_GROUPS: string[][] = [
  ["Nicole Landmesser", "Tyler Magee"],
  ["Charlene Atkinson", "Kaitlyn Istona"],
  ["Phoebe Murray", "Naima Zen"],
  ["Sabrina Hiller", "Daniel Chenery"],
  ["Lexie Haubner", "Victor Haubner"],
  ["Ben Kroll"],
  ["Raymond Featherson", "Alex Telo"],
  ["Nick Haubner", "Bri Pizzuto"],
  ["Gary Bettello", "Valerie Stahli"],
  ["Grazyna Landmesser", "Waldemar Landmesser"],
  ["Arthur Landmesser", "Lara Landmesser", "Reid Landmesser", "Sloane Landmesser"],
  ["Kevin Joslyn", "Michał Kuczma", "Kevin Smith", "Raymond Neenan"],
  ["Meghan Shiels", "Clare Ryan", "Erika Rosendahl"],
  ["Karen Olechnowicz", "Tom Olechnowicz"],
  ["Brendon Bengel", "Gillian Muñoz"],
  ["Wesley Baranowski", "Fletcher Huntley"],
  ["Tyler Hiller", "Lydia Krenicki"],
  ["Joy Hiller", "Paul Hiller"],
  ["Ala Behnke", "Marek Behnke"],
  ["Grazyna Maciejewski", "Jerzy Maciejewski"],
  ["Everett Harris", "Mark Harris"],
  ["Bob Stahli"],
  ["Cathy Peluso", "Hailey Mancuso"],
  ["Filip Trzeciak", "Kamila Potrapeluk"],
  ["Patrick Magee", "Taylor Lukasik"],
  ["Alana Bettello", "Gina Bettello"],
  ["Casey Magee", "Kyle Shifflett"],
  ["Anthony Granchelli", "Isabel Surapine"],
  ["Hal Mutlu", "Jane Percival"],
  ["Pat Landmesser", "Jess Landmesser", "Luna Landmesser", "Harper Landmesser"],
  ["Jose Muñoz", "Nancy Muñoz"],
  ["Anthony Giannico"],
  ["Keishara Colby", "Tate Illers"],
];

const roomGroupFor = (fullName: string): string[] | null =>
  ROOM_GROUPS.find((group) => group.some((member) => namesMatch(member, fullName))) || null;

interface LookupResult {
  matchedName: string;
  invited: {
    welcome_party_rsvp: string | null;
    pool_day_rsvp: string | null;
    wedding_day_rsvp: string | null;
    friday_activity: string | null;
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
  passportSubmitted: boolean;
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
      const [invRes, shuttleRes, bookRes, catRes, assignRes, estateRes, passportRes] = await Promise.all([
        supabase.from("invited_guests").select("id,first_name,last_name,email,welcome_party_rsvp,pool_day_rsvp,wedding_day_rsvp,friday_activity,dietary_restrictions"),
        supabase.from("shuttle_signups").select("full_name,email,arrival_wave,departure_wave,departure_plan,party_size,guest_names,passport_paths"),
        supabase.from("room_bookings").select("email,guest_names,room_category_id,payment_status,is_released"),
        supabase.from("room_categories").select("id,name"),
        supabase.from("room_assignments" as any).select("room_number,guest_id"),
        supabase.from("estate_rooms" as any).select("room_number,room_type"),
        supabase.from("passport_tracker" as any).select("full_name,received"),
      ]);

      if (invRes.error) throw invRes.error;
      if (shuttleRes.error) throw shuttleRes.error;
      if (bookRes.error) throw bookRes.error;
      if (catRes.error) throw catRes.error;
      // passport_tracker may not exist in every environment — degrade gracefully.
      const passportTracker = passportRes.error
        ? []
        : ((passportRes.data ?? []) as { full_name: string; received: boolean }[]);
      // room_assignments/estate_rooms may not exist in every environment — degrade
      // gracefully instead of breaking the whole lookup if those tables aren't present.
      const roomAssignments = assignRes.error ? [] : ((assignRes.data || []) as { room_number: string | number; guest_id: string }[]);
      const estateRooms = estateRes.error ? [] : ((estateRes.data || []) as { room_number: string | number; room_type: string }[]);
      const roomTypeByNumber = new Map(estateRooms.map((r) => [String(r.room_number), r.room_type]));

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

      const passportSubmitted =
        ((shuttle?.passport_paths as string[] | null)?.length ?? 0) > 0 ||
        passportTracker.some((p) => p.received && namesMatch(p.full_name, matchedFullName));

      const catMap = new Map((catRes.data || []).map((c) => [c.id, c.name]));
      const room = (bookRes.data || []).find((b) => {
        if (b.is_released) return false;
        const guests = parseGuestList(b.guest_names);
        return guests.some((g) => namesMatch(g, matchedFullName));
      });

      // Fallback: manually-assigned room (no self-serve booking on file).
      let assignedRoom: { category_name: string | null; guest_names: string; payment_status: string } | null = null;
      if (!room) {
        const myAssignment = roomAssignments.find((a) => a.guest_id === invited.id);
        if (myAssignment) {
          const guestById = new Map((invRes.data || []).map((g) => [g.id, `${g.first_name} ${g.last_name}`]));
          const roommates = roomAssignments
            .filter((a) => a.room_number === myAssignment.room_number)
            .map((a) => guestById.get(a.guest_id))
            .filter((n): n is string => !!n);
          assignedRoom = {
            category_name: formatRoomLabel(roomTypeByNumber.get(String(myAssignment.room_number)), myAssignment.room_number),
            guest_names: roommates.join(", "),
            payment_status: "paid",
          };
        }
      }

      const groupNames = roomGroupFor(matchedFullName);

      // "Solo Guest Estate Pass" bookings don't reflect the guest's actual assigned
      // room; look that up from room_assignments/estate_rooms to display instead.
      const myAssignmentGlobal = roomAssignments.find((a) => a.guest_id === invited.id);
      const assignedRoomType = myAssignmentGlobal
        ? formatRoomLabel(roomTypeByNumber.get(String(myAssignmentGlobal.room_number)), myAssignmentGlobal.room_number)
        : null;

      setResult({
        matchedName: matchedFullName,
        invited: {
          welcome_party_rsvp: invited.welcome_party_rsvp,
          pool_day_rsvp: invited.pool_day_rsvp,
          wedding_day_rsvp: invited.wedding_day_rsvp,
          friday_activity: invited.friday_activity,
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
              category_name: (() => {
                const cat = catMap.get(room.room_category_id) || null;
                if (cat === "Solo Guest Estate Pass" && assignedRoomType) return assignedRoomType;
                return cat;
              })(),
              guest_names: groupNames ? groupNames.join(", ") : room.guest_names,
              payment_status: room.payment_status,
            }
          : assignedRoom
          ? {
              ...assignedRoom,
              guest_names: groupNames ? groupNames.join(", ") : assignedRoom.guest_names,
            }
          : null,
        passportSubmitted,
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
              <h1 className="heading-section mb-4 text-center">Guest Portal</h1>
              <div className="w-12 h-px bg-primary mx-auto mb-10" />
              <p className="body-editorial mx-auto text-balance mb-10 text-center">
                Enter your name and email to review your RSVP, shuttle times, and room reservation.
              </p>
            </>
          )}

          {!result && (
            <form onSubmit={handleLookup} className="space-y-8 max-w-md mx-auto">
              <div>
                <label className="block label-xs mb-2">
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
                <label className="block label-xs mb-2">
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
                <p className="body-small text-destructive text-center">
                  We couldn't find a matching invitation. Double-check your name and email, or reach out to Nicole & Tyler.
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-primary-foreground py-3 body-small uppercase tracking-[0.25em] hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {loading ? "Looking up…" : "Check My Submission"}
              </button>
            </form>
          )}

          {result && (() => {
            const arr = ARRIVAL_WAVES[result.shuttle?.arrival_wave ?? ""];
            const dep = DEPARTURE_WAVES[result.shuttle?.departure_wave ?? ""];
            const neitherWave = !!result.shuttle && !arr && !dep;

            const seen = new Set<string>();
            const roomGuests = parseGuestList(result.room?.guest_names).filter((g) => {
              const key = norm(g);
              if (!key || seen.has(key)) return false;
              seen.add(key);
              return true;
            });

            const fridayActivityLabel: Record<string, string> = {
              "Recovery Day": "Il Dolce Far Niente Pool Party & Dinner",
              "Wine Tour": "The Best of Tuscany Field Trip",
            };

            const eventRows: Array<{ label: string; day: string; rsvp: string | null | undefined; detail?: string }> = [
              { label: "Welcome Party", day: "Wed, Sept 16", rsvp: result.invited?.welcome_party_rsvp },
              { label: "Ceremony & Reception", day: "Thu, Sept 17", rsvp: result.invited?.wedding_day_rsvp },
              {
                label: "Recovery Day",
                day: "Fri, Sept 18",
                rsvp: result.invited?.pool_day_rsvp,
                detail: result.invited?.friday_activity ? fridayActivityLabel[result.invited.friday_activity] : undefined,
              },
            ];

            return (
              <div className="space-y-3">
                <div className="text-center">
                  <h2 className="heading-section italic text-foreground mb-4 opacity-95">
                    RSVP Details: {result.matchedName}
                  </h2>
                </div>

                {/* Events */}
                <Card>
                  <ul className="space-y-1.5">
                    {eventRows.map((e) => {
                      const attending = e.rsvp === "yes" || e.rsvp === "accept";
                      const declined = e.rsvp === "no" || e.rsvp === "decline";

                      return (
                        <li key={e.label} className="space-y-1">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <span
                                className={
                                  "flex items-center justify-center w-5 h-5 rounded-full border " +
                                  (attending
                                    ? "bg-sage border-sage text-[#fdfbf7]"
                                    : declined
                                    ? "border-border text-muted-foreground"
                                    : "border-border text-transparent")
                                }
                                aria-label={attending ? "attending" : declined ? "not attending" : "no response"}
                              >
                                {attending && <Check size={12} strokeWidth={2.5} />}
                                {declined && <X size={12} strokeWidth={2.5} />}
                              </span>
                              <span className="font-serif text-base sm:text-lg md:text-xl font-light tracking-tight text-foreground">{e.label}</span>
                            </div>
                            <span className="label-xs tracking-[0.28em]">
                              {e.day}
                            </span>
                          </div>
                          {attending && e.detail && (
                            <p className="body-small italic text-muted-foreground pl-8">{e.detail}</p>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </Card>

                {/* Shuttle */}
                <Card className="border border-sage bg-sage p-3 sm:p-4">
                  {result.shuttle && !neitherWave ? (
                    <div className="grid grid-cols-2 gap-4">
                      <WaveBlock label="Arrival Shuttle" wave={arr} />
                      <WaveBlock label="Departure Shuttle" wave={dep} />
                    </div>
                  ) : (
                    <p className="heading-card text-[#fdfbf7]">Shuttle N/A</p>
                  )}
                </Card>

                {/* Room */}
                <Card>
                  {result.invited?.dietary_restrictions && (
                    <>
                      <p className="label-xs tracking-[0.28em] mb-1">
                        Dietary notes
                      </p>
                      <p className="body-small text-foreground mb-3">
                        {result.invited.dietary_restrictions}
                      </p>
                      <div className="h-px bg-border/70 mb-3" />
                    </>
                  )}

                  <h3 className="font-serif text-base sm:text-lg md:text-xl font-light tracking-tight text-foreground leading-tight mb-2">
                    {result.room?.category_name || "Not staying onsite"}
                  </h3>

                  {roomGuests.length > 0 && (
                    <>
                      <div className="h-px bg-border/70 mb-3" />
                      <GuestChips names={roomGuests} />
                    </>
                  )}

                  <div className="h-px bg-border/70 my-3" />
                  <p className="label-xs tracking-[0.28em] mb-1">
                    Passport photo
                  </p>
                  <p className={`body-small ${result.passportSubmitted ? "text-sage" : "text-destructive font-medium"}`}>
                    {result.passportSubmitted ? "Submitted" : "Not yet submitted"}
                  </p>
                </Card>

                <div className="flex items-center justify-center gap-8">
                  <button
                    type="button"
                    onClick={reset}
                    className="label-xs tracking-[0.28em] text-foreground hover:text-muted-foreground transition-colors underline underline-offset-4 leading-6 max-w-[7.5rem] sm:max-w-none text-center"
                  >
                    Look up another name
                  </button>
                  <Link
                    to="/#itinerary"
                    className="label-xs tracking-[0.28em] text-foreground hover:text-muted-foreground transition-colors underline underline-offset-4 leading-6 max-w-[7.5rem] sm:max-w-none text-center"
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

const Card = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={className ?? "border border-border/70 bg-card p-3 sm:p-4"}>{children}</div>
);

const WaveBlock = ({
  label,
  wave,
}: {
  label: string;
  wave: WaveDetail | undefined;
}) => (
  <div>
    <p className="font-body text-xs uppercase tracking-[0.224em] text-[#fdfbf7]/70 mb-1">
      {label}
    </p>
    {wave ? (
      <>
        <p className="heading-card text-[#fdfbf7] leading-none mb-1">{wave.time}</p>
        <p className="body-small text-[#fdfbf7]/80 leading-snug">
          {wave.from}
          <br />
          to {wave.to}
        </p>
      </>
    ) : (
      <p className="heading-card text-[#fdfbf7] leading-tight">
        N/A
      </p>
    )}
  </div>
);

const GuestChips = ({ names }: { names: string[] }) => (
  <div className="grid grid-cols-2 gap-1.5">
    {names.map((n) => (
      <span
        key={n}
        className="body-small text-foreground border border-border/80 px-3 py-1.5 text-center truncate"
      >
        {n}
      </span>
    ))}
  </div>
);

export default Shuttle;
