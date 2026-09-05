import { useState } from "react";
import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import FadeIn from "@/components/FadeIn";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { norm, namesMatch, parseGuestList } from "@/lib/guestMatching";
import { formatRoomLabel } from "@/lib/roomLabel";

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
  passportReceived: boolean;
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
        supabase.from("passport_tracker" as any).select("full_name"),
      ]);

      if (invRes.error) throw invRes.error;
      if (shuttleRes.error) throw shuttleRes.error;
      if (bookRes.error) throw bookRes.error;
      if (catRes.error) throw catRes.error;
      // room_assignments/estate_rooms/passport_tracker may not exist in every environment —
      // degrade gracefully instead of breaking the whole lookup if those tables aren't present.
      const roomAssignments = assignRes.error ? [] : ((assignRes.data || []) as { room_number: string | number; guest_id: string }[]);
      const estateRooms = estateRes.error ? [] : ((estateRes.data || []) as { room_number: string | number; room_type: string }[]);
      const roomTypeByNumber = new Map(estateRooms.map((r) => [String(r.room_number), r.room_type]));
      const passportTrackerEntries = passportRes.error ? [] : ((passportRes.data || []) as { full_name: string }[]);

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

      // Passport photos are submitted per-party rather than per-guest, so a party
      // is "received" once uploaded photos plus manually-tracked ones cover everyone.
      const partyNames = shuttle ? parseGuestList(shuttle.guest_names || matchedFullName) : [matchedFullName];
      const uploadedCount = shuttle?.passport_paths?.length ?? 0;
      const sentSeparatelyCount = partyNames.filter((n) =>
        passportTrackerEntries.some((p) => namesMatch(p.full_name, n))
      ).length;
      const passportsAccounted = uploadedCount + sentSeparatelyCount;
      const passportReceived = shuttle?.party_size
        ? passportsAccounted >= shuttle.party_size
        : passportsAccounted > 0;

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
        passportReceived,
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
              { label: "Welcome party", day: "Wed, Sept 16", rsvp: result.invited?.welcome_party_rsvp },
              { label: "Wedding day", day: "Thu, Sept 17", rsvp: result.invited?.wedding_day_rsvp },
              {
                label: "Recovery day",
                day: "Fri, Sept 18",
                rsvp: result.invited?.pool_day_rsvp,
                detail: result.invited?.friday_activity ? fridayActivityLabel[result.invited.friday_activity] : undefined,
              },
            ];

            return (
              <div>
                <div className="text-center mb-10">
                  <h2 className="heading-card text-foreground leading-[1.05]">
                    Your Details
                  </h2>
                </div>

                {/* Events */}
                <section className="pb-6">
                  <SectionTitle>Events</SectionTitle>
                  <ul className="space-y-5">
                    {eventRows.map((e) => {
                      const attending = e.rsvp === "yes" || e.rsvp === "accept";
                      const declined = e.rsvp === "no" || e.rsvp === "decline";
                      const statusLabel = attending
                        ? "Attending"
                        : declined
                        ? "Not attending"
                        : "Awaiting response";

                      return (
                        <li key={e.label} className="flex items-start justify-between gap-4">
                          <div>
                            <p className="heading-card text-foreground leading-tight">{e.label}</p>
                            <p
                              className={
                                "label-xs tracking-[0.28em] mt-1.5 " +
                                (attending ? "text-primary" : "text-muted-foreground")
                              }
                            >
                              {statusLabel}
                            </p>
                            {attending && e.detail && (
                              <p className="body-small text-muted-foreground mt-1.5">{e.detail}</p>
                            )}
                          </div>
                          <span className="label-xs tracking-[0.28em] text-muted-foreground shrink-0 pt-1">
                            {e.day}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </section>

                {/* Shuttle */}
                <section className="pt-10 border-t border-border/40">
                  {!neitherWave && <SectionTitle>Shuttle</SectionTitle>}
                  {result.shuttle ? (
                    <div className="space-y-4">
                      <ShuttleRow label="Arriving" wave={arr} />
                      <ShuttleRow label="Departing" wave={dep} />
                    </div>
                  ) : (
                    <>
                      <p className="body-editorial">
                        No shuttle reserved. Please ensure you have arranged independent transportation
                        from the train station.
                      </p>
                      <p className="body-editorial mt-3">
                        Our final passenger manifests have been submitted to our transportation vendors.
                        If you need to make an emergency change to your shuttle plans, please contact us
                        directly.
                      </p>
                    </>
                  )}
                </section>

                {/* Room */}
                <section className="pt-10 border-t border-border/40">
                  <SectionTitle>Your Room</SectionTitle>

                  <p className="label-xs tracking-[0.28em] mb-1">
                    Room
                  </p>
                  <h3 className="heading-card text-foreground leading-tight mb-5">
                    {result.room?.category_name || "Not staying onsite"}
                  </h3>

                  {roomGuests.length > 0 && (
                    <div className="mb-5">
                      <p className="label-xs tracking-[0.28em] mb-1.5">
                        Guests
                      </p>
                      <p className="body-small text-foreground leading-relaxed">
                        {roomGuests.join(" · ")}
                      </p>
                    </div>
                  )}

                  <div className="mb-5">
                    <p
                      className={
                        "label-xs tracking-[0.28em] " +
                        (result.passportReceived ? "text-primary" : "text-muted-foreground")
                      }
                    >
                      Passport photo: {result.passportReceived ? "Received" : "Not submitted"}
                    </p>
                  </div>

                  {result.invited?.dietary_restrictions && (
                    <div className="mb-5">
                      <p className="label-xs tracking-[0.28em] mb-1">
                        Dietary notes
                      </p>
                      <p className="body-small text-foreground">
                        {result.invited.dietary_restrictions}
                      </p>
                    </div>
                  )}

                  {result.shuttle?.submitted_by && (
                    <p className="label-xs normal-case tracking-normal leading-relaxed text-muted-foreground">
                      Submitted by {result.shuttle.submitted_by}. Something look wrong? Reply to your
                      confirmation email and we'll fix it.
                    </p>
                  )}
                </section>

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

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <>
    <h3 className="heading-section italic mb-2">{children}</h3>
    <div className="w-12 h-px bg-primary/40 mb-6" />
  </>
);

const ShuttleRow = ({
  label,
  wave,
}: {
  label: string;
  wave: WaveDetail | undefined;
}) => (
  <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
    <span className="label-xs tracking-[0.28em] w-28 shrink-0">{label}</span>
    {wave ? (
      <>
        <span className="heading-card text-foreground">{wave.time}</span>
        <span className="body-small text-muted-foreground">
          {wave.from} to {wave.to}
        </span>
        <span className="label-xs tracking-[0.22em] text-muted-foreground">{wave.badge}</span>
      </>
    ) : (
      <span className="heading-card text-foreground">No shuttle</span>
    )}
  </div>
);

export default Shuttle;
