import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import FadeIn from "@/components/FadeIn";
import EventRsvpButton from "@/components/EventRsvpButton";
import { toast } from "sonner";
import { Search } from "lucide-react";
import { loadPartyRsvpState, savePartyRsvpState, fetchPartyMembers, normalizeStr, type GuestRecord } from "@/lib/rsvp";

const events = [
  { key: "welcome_party_rsvp" as const, label: "Welcome Pizza Party", sub: "Wednesday, Sept 16 · 6:30 PM" },
  { key: "wedding_day_rsvp" as const, label: "The Wedding Day", sub: "Thursday, Sept 17 · 4:30 PM" },
  { key: "pool_day_rsvp" as const, label: "Recovery Pool Day", sub: "Friday, Sept 18 · 12:00 PM" },
];

const accommodationOptions = [
  "Solo Guest Estate Pass",
  "Classic Estate Room",
  "Superior Room",
  "Garden Suite",
  "Luxury Suite",
  "Junior Suite",
  "Not Staying Onsite",
  "Joining a Reserved Room",
];

const NO_PAYMENT_ACCOMMODATIONS = ["Not Staying Onsite", "Joining a Reserved Room"];

interface RsvpFormEmbedProps {
  accommodation?: string;
  onAccommodationChange?: (val: string) => void;
  onSubmitSuccess?: (allDeclined: boolean, accommodation: string) => void;
}

const RsvpFormEmbed = ({ accommodation: externalAccommodation, onAccommodationChange, onSubmitSuccess }: RsvpFormEmbedProps = {}) => {
  const [searchName, setSearchName] = useState("");
  const [guest, setGuest] = useState<GuestRecord | null>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [allDeclined, setAllDeclined] = useState(false);
  const [attendingCount, setAttendingCount] = useState(1);
  const [guestNames, setGuestNames] = useState<string[]>([""]);
  const [eventRsvps, setEventRsvps] = useState<Record<string, string>>({});
  const [perPersonOverrides, setPerPersonOverrides] = useState<Record<number, Record<string, string>>>({});
  const [showOverrides, setShowOverrides] = useState(false);
  const [dietary, setDietary] = useState("");
  const [notes, setNotes] = useState("");
  const [email, setEmail] = useState("");
  const [internalAccommodation, setInternalAccommodation] = useState("");
  const [groupTransfer, setGroupTransfer] = useState("");
  const [ownTransport, setOwnTransport] = useState("");
  const [previouslyResponded, setPreviouslyResponded] = useState(false);
  const [previousAccommodation, setPreviousAccommodation] = useState("");
  const [alreadyRsvpd, setAlreadyRsvpd] = useState(false);

  const accommodation = externalAccommodation !== undefined ? externalAccommodation : internalAccommodation;
  const setAccommodation = (val: string) => {
    if (onAccommodationChange) onAccommodationChange(val);
    else setInternalAccommodation(val);
  };

  // Returns the effective RSVP for person i and event key:
  // per-person override takes priority, falls back to the group selection.
  const getEffectiveRsvp = (i: number, key: string): string =>
    perPersonOverrides[i]?.[key] ?? eventRsvps[key] ?? "";

  useEffect(() => {
    if (localStorage.getItem("hasRSVPd") === "true") {
      setAlreadyRsvpd(true);
    }
  }, []);

  // Accent-insensitive guest lookup: try exact ilike first, fall back to
  // fetching all guests and comparing normalized strings client-side.
  const findGuest = async (firstName: string, lastName: string): Promise<GuestRecord | null> => {
    const { data: match } = await supabase
      .from("guests")
      .select("*")
      .ilike("first_name", firstName)
      .ilike("last_name", lastName)
      .limit(1);

    if (match && match.length > 0) return match[0] as GuestRecord;

    const { data: all } = await supabase.from("guests").select("*");
    const found = all?.find(
      (g) =>
        normalizeStr(g.first_name) === normalizeStr(firstName) &&
        normalizeStr(g.last_name) === normalizeStr(lastName)
    );
    return (found as GuestRecord) ?? null;
  };

  const loadStateForGuest = async (found: GuestRecord) => {
    const loadedState = await loadPartyRsvpState(found, found.first_name, found.last_name);
    const count = Math.min(found.max_guests, loadedState.attendingCount);
    setPreviouslyResponded(loadedState.previouslyResponded);
    setPreviousAccommodation(loadedState.accommodation || "");
    setEventRsvps(loadedState.eventRsvps);
    setPerPersonOverrides({});
    setShowOverrides(false);
    setDietary(loadedState.dietary);
    setNotes(loadedState.notes);
    setEmail((loadedState as any).email ?? "");
    if (!externalAccommodation && loadedState.accommodation) {
      setAccommodation(loadedState.accommodation);
    } else if (!externalAccommodation && !loadedState.accommodation) {
      // no prior selection, leave empty
    }
    setGuestNames(loadedState.guestNames);
    setAttendingCount(count);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const parts = searchName.trim().split(/\s+/);
    if (parts.length < 2) {
      toast.error("Please enter your first and last name");
      return;
    }

    setLoading(true);
    setSearched(true);

    const firstName = parts[0];
    const lastName = parts.slice(1).join(" ");

    const found = await findGuest(firstName, lastName);

    if (!found) {
      setGuest(null);
      setLoading(false);
      return;
    }

    setGuest(found);
    await loadStateForGuest(found);
    setLoading(false);
  };

  const handleCountChange = async (count: number) => {
    setAttendingCount(count);

    if (guest && count === guest.max_guests) {
      const members = await fetchPartyMembers(guest.party_name);
      if (members.length > 0) {
        const searchedName = `${guest.first_name} ${guest.last_name}`.trim().toLowerCase();
        const sorted = [
          ...members.filter(m => `${m.first_name} ${m.last_name}`.trim().toLowerCase() === searchedName),
          ...members.filter(m => `${m.first_name} ${m.last_name}`.trim().toLowerCase() !== searchedName),
        ];
        const names = sorted.slice(0, count).map(m => `${m.first_name} ${m.last_name}`.trim());
        while (names.length < count) names.push("");
        setGuestNames(names);
        return;
      }
    }

    setGuestNames((prev) => {
      const updated = [...prev];
      while (updated.length < count) updated.push("");
      return updated.slice(0, count);
    });
  };

  const handleSubmit = async () => {
    setLoading(true);
    for (const ev of events) {
      if (!eventRsvps[ev.key]) {
        toast.error(`Please select Accept or Decline for ${ev.label}`);
        setLoading(false);
        return;
      }
    }
    for (let i = 0; i < attendingCount; i++) {
      if (!guestNames[i]?.trim()) {
        toast.error(`Please enter the name for guest ${i + 1}`);
        setLoading(false);
        return;
      }
    }
    if (!accommodation) {
      toast.error("Please select your accommodation preference");
      setLoading(false);
      return;
    }
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      toast.error("Please enter a valid email address so we can send your receipt");
      setLoading(false);
      return;
    }
    if (!groupTransfer) {
      toast.error("Please select your transport option");
      setLoading(false);
      return;
    }
    if (groupTransfer === "no" && !ownTransport) {
      toast.error("Please select how you're arranging your own transport");
      setLoading(false);
      return;
    }

    const combinedTransferValue =
      groupTransfer === "yes"
        ? "Group transfer from Siena"
        : groupTransfer === "not_sure"
        ? "Not sure yet"
        : ownTransport === "rent_a_car"
        ? "Own transport — Renting a car"
        : ownTransport === "private_transfer"
        ? "Own transport — Private transfer"
        : ownTransport === "joining_car"
        ? "Own transport — Joining someone's car"
        : "Own transport — Not sure yet";

    const declined = guestNames
      .slice(0, attendingCount)
      .every((_, i) => events.every(ev => getEffectiveRsvp(i, ev.key) === "decline"));

    const cleanedNames = guestNames.slice(0, attendingCount).map(n => n.trim()).filter(Boolean);

    try {
      for (let idx = 0; idx < cleanedNames.length; idx++) {
        const fullName = cleanedNames[idx];
        const nameParts = fullName.split(/\s+/);
        const firstName = nameParts[0] || "";
        const lastName = nameParts.slice(1).join(" ") || "";

        const formData = new URLSearchParams();
        formData.append("First Name", firstName);
        formData.append("Last Name", lastName);
        formData.append("Email", trimmedEmail);
        formData.append("Wednesday Welcome Party", getEffectiveRsvp(idx, "welcome_party_rsvp") === "accept" ? "Accept" : "Decline");
        formData.append("Thursday Wedding", getEffectiveRsvp(idx, "wedding_day_rsvp") === "accept" ? "Accept" : "Decline");
        formData.append("Friday Recovery Day", getEffectiveRsvp(idx, "pool_day_rsvp") === "accept" ? "Accept" : "Decline");
        formData.append("Room Preference", accommodation || "");
        formData.append("Dietary Restrictions", dietary.trim() || "None");
        formData.append("Notes", notes.trim() || "");
        formData.append("Transportation", combinedTransferValue);

        await fetch(
          "https://script.google.com/macros/s/AKfycbzySKusxkZbLJ1GqBWn9wmloYSN7aAT_O7qx-Qy2qEY3zHRDc8FMCJzBQAaA7Naf33a/exec",
          {
            method: "POST",
            mode: "no-cors",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: formData.toString(),
          }
        );
      }

      const notesWithTransfer = [notes.trim(), `Transport: ${combinedTransferValue}`]
        .filter(Boolean)
        .join(" | ");

      const effectivePerPersonRsvps: Record<number, Record<string, string>> = {};
      for (let i = 0; i < attendingCount; i++) {
        effectivePerPersonRsvps[i] = {
          welcome_party_rsvp: getEffectiveRsvp(i, "welcome_party_rsvp"),
          wedding_day_rsvp: getEffectiveRsvp(i, "wedding_day_rsvp"),
          pool_day_rsvp: getEffectiveRsvp(i, "pool_day_rsvp"),
        };
      }

      await savePartyRsvpState({
        guestNames: guestNames.slice(0, attendingCount),
        perPersonRsvps: effectivePerPersonRsvps,
        dietary,
        notes: notesWithTransfer,
        accommodation,
        email: trimmedEmail,
      });

      // Look up the authoritative room price from the database (do NOT trust client state)
      let roomPrice = 0;
      let roomCategoryId: string | null = null;
      let roomInventory = 0;
      if (accommodation && !NO_PAYMENT_ACCOMMODATIONS.includes(accommodation)) {
        const { data: roomRow } = await supabase
          .from("room_categories")
          .select("id, price, inventory_count")
          .eq("name", accommodation)
          .maybeSingle();
        roomPrice = Number(roomRow?.price ?? 0);
        roomCategoryId = (roomRow?.id as string) ?? null;
        roomInventory = Number(roomRow?.inventory_count ?? 0);
      }
      const roomPriceFormatted = roomPrice
        ? `$${roomPrice.toLocaleString("en-US")} USD`
        : "";

      // Create the booking + decrement live inventory.
      // Source of truth: check the DB for an existing active booking for this email + room.
      // This prevents double-booking on re-submit AND ensures a booking row is always created
      // when a guest selects a paid room for the first time (even if their RSVP was pre-filled
      // with that selection from a prior session).
      const isPaidRoom = accommodation && !NO_PAYMENT_ACCOMMODATIONS.includes(accommodation);
      if (isPaidRoom && roomCategoryId) {
        const { data: existingBookings } = await supabase
          .from("room_bookings")
          .select("id")
          .eq("email", trimmedEmail)
          .eq("room_category_id", roomCategoryId)
          .eq("is_released", false)
          .limit(1);

        const alreadyBooked = (existingBookings?.length ?? 0) > 0;

        if (!alreadyBooked) {
          if (roomInventory <= 0) {
            toast.error(`${accommodation} just sold out. Please pick another room.`);
            setLoading(false);
            return;
          }
          await supabase
            .from("room_categories")
            .update({ inventory_count: roomInventory - 1 })
            .eq("id", roomCategoryId);

          await supabase.from("room_bookings").insert({
            room_category_id: roomCategoryId,
            guest_names: cleanedNames.join(", "),
            email: trimmedEmail,
            has_children: false,
            payment_status: "unpaid",
            reserved_at: new Date().toISOString(),
          });

          setPreviousAccommodation(accommodation);
        }
      }

      // Send receipt email via Apps Script (fire-and-forget; no-cors so we can't read the response)
      const RECEIPT_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyNmaFh0PpuYkB2nxshXCuFv2Vxvnv_QFxSl67g1qdE8--Sd2r_l0rhbiW0NprZJqsR/exec";
      const receiptForm = new URLSearchParams();
      receiptForm.append("email", trimmedEmail);
      receiptForm.append("guestNames", cleanedNames.join("|"));
      receiptForm.append("welcome_party_rsvp", getEffectiveRsvp(0, "welcome_party_rsvp"));
      receiptForm.append("wedding_day_rsvp", getEffectiveRsvp(0, "wedding_day_rsvp"));
      receiptForm.append("pool_day_rsvp", getEffectiveRsvp(0, "pool_day_rsvp"));
      receiptForm.append("accommodation", accommodation);
      receiptForm.append("roomPrice", String(roomPrice));
      receiptForm.append("roomPriceFormatted", roomPriceFormatted);
      receiptForm.append("dietary", dietary.trim());
      receiptForm.append("notes", notes.trim());
      receiptForm.append("allDeclined", declined ? "true" : "false");

      fetch(RECEIPT_SCRIPT_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: receiptForm.toString(),
      }).catch((err) => console.error("Receipt email failed:", err));

      // Also send a copy to Nyler so they're notified of every RSVP
      const notifyForm = new URLSearchParams(receiptForm);
      notifyForm.set("email", "nylermagee@gmail.com");
      fetch(RECEIPT_SCRIPT_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: notifyForm.toString(),
      }).catch((err) => console.error("Owner notification email failed:", err));

      localStorage.setItem("hasRSVPd", "true");
      localStorage.setItem("rsvpName", `${guest?.first_name} ${guest?.last_name}`);
      setAllDeclined(declined);
      setSubmitted(true);
      onSubmitSuccess?.(declined, accommodation);
    } catch {
      toast.error("Something went wrong. Please try again.");
    }

    setLoading(false);
  };

  const handleEditRsvp = async () => {
    localStorage.removeItem("hasRSVPd");
    setAlreadyRsvpd(false);

    const savedName = localStorage.getItem("rsvpName") || searchName;
    if (!savedName) return;

    setSearchName(savedName);
    const parts = savedName.trim().split(/\s+/);
    if (parts.length < 2) return;

    setLoading(true);
    setSearched(true);

    const firstName = parts[0];
    const lastName = parts.slice(1).join(" ");

    const found = await findGuest(firstName, lastName);

    if (!found) {
      setGuest(null);
      setLoading(false);
      return;
    }

    setGuest(found);
    await loadStateForGuest(found);
    setLoading(false);
  };

  if (alreadyRsvpd && !submitted) {
    return (
      <div className="text-center">
        <FadeIn>
          <h2 className="heading-section mb-4">RSVP</h2>
          <div className="w-12 h-px bg-primary mx-auto mb-8" />
          <p className="body-editorial mx-auto mb-10">
            We have received your RSVP. Thank you!
          </p>
          <button
            type="button"
            onClick={handleEditRsvp}
            className="font-body text-xs uppercase tracking-[0.25em] text-primary underline underline-offset-4 hover:opacity-70 transition-opacity"
          >
            Need to edit your RSVP?
          </button>
          <div className="mt-4">
            <button
              type="button"
              onClick={() => {
                localStorage.removeItem("hasRSVPd");
                localStorage.removeItem("rsvpName");
                setAlreadyRsvpd(false);
                setGuest(null);
                setSearchName("");
                setSearched(false);
                setGuestNames([""]);
                setEventRsvps({});
                setPerPersonOverrides({});
                setShowOverrides(false);
                setDietary("");
                setNotes("");
                setEmail("");
                setAccommodation("");
                setGroupTransfer("");
                setOwnTransport("");
                setAttendingCount(1);
              }}
              className="font-body text-xs uppercase tracking-[0.25em] text-muted-foreground underline underline-offset-4 hover:opacity-70 transition-opacity"
            >
              Not you?
            </button>
          </div>
        </FadeIn>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="text-center">
        <FadeIn>
          <h2 className="heading-section mb-4">Thank You</h2>
          <div className="w-12 h-px bg-primary mx-auto mb-8" />
          <p className="body-editorial mx-auto">
            Your RSVP has been recorded.
            <br />
            {allDeclined
              ? "We're sorry we'll miss you!"
              : "We can't wait to celebrate with you!"}
          </p>
          {!allDeclined && !NO_PAYMENT_ACCOMMODATIONS.includes(accommodation) && (
            <>
              <p className="font-body text-sm text-muted-foreground mt-6">
                Please note: your room is not reserved until payment is received.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
                <a
                  href="https://paypal.me/nylerwedding"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block px-8 py-4 bg-primary text-primary-foreground font-body text-xs uppercase tracking-[0.25em] hover:opacity-90 transition-opacity"
                >
                  Pay with PayPal
                </a>
                <a
                  href="https://venmo.com/u/tylermagee"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block px-8 py-4 border border-primary text-primary font-body text-xs uppercase tracking-[0.25em] hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  Pay with Venmo
                </a>
              </div>
            </>
          )}
        </FadeIn>
      </div>
    );
  }

  return (
    <div>

      <FadeIn>
        <h2 className="heading-section text-center mb-4">RSVP</h2>
        <div className="w-12 h-px bg-primary mx-auto mb-12" />
      </FadeIn>

      {!guest && (
        <FadeIn delay={150}>
          <p className="body-editorial text-center mx-auto mb-10">
            Please enter your first and last name to find your invitation.
          </p>
          <form onSubmit={handleSearch} className="space-y-6">
            <div className="relative">
              <Search size={16} className="absolute left-0 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                placeholder="First & Last Name"
                className="w-full bg-transparent border-b border-border py-3 pl-7 font-body text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary transition-colors"
                maxLength={200}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-primary text-primary-foreground font-body text-xs uppercase tracking-[0.25em] hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading ? "Searching..." : "Find My Invitation"}
            </button>
          </form>

          {searched && !loading && !guest && (
            <p className="body-editorial text-center mt-8 mx-auto">
              We couldn't find that name. Please try again or contact us at{" "}
              <a href="mailto:nicoleandtylersitalianwedding@gmail.com" className="text-primary underline">
                nicoleandtylersitalianwedding@gmail.com
              </a>
            </p>
          )}
        </FadeIn>
      )}

      {guest && (
        <FadeIn delay={100}>
          <div className="space-y-12">
            <div className="text-center">
              <p className="body-editorial mx-auto mb-2">
                Welcome, <span className="font-medium text-foreground">{guest.first_name}</span>!
              </p>
              <p className="font-body text-sm text-muted-foreground">
                You may RSVP for up to {guest.max_guests} guest{guest.max_guests > 1 ? "s" : ""}.
              </p>
              {previouslyResponded && (
                <p className="font-body text-xs text-primary mt-2 italic">
                  Your party has already RSVPd — your previous selections are loaded below. You are able to update your RSVP until June 16, 2026.
                </p>
              )}
            </div>

            {guest.max_guests > 1 && (
              <div className="space-y-3">
                <label className="heading-sub block">Number of Guests</label>
                <div className="flex gap-3">
                  {Array.from({ length: guest.max_guests }, (_, i) => i + 1).map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => handleCountChange(num)}
                      className={`flex-1 py-3 border text-sm font-body transition-all duration-200 ${
                        attendingCount === num
                          ? "border-primary bg-primary/5 text-foreground"
                          : "border-border text-muted-foreground hover:border-primary/40"
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-4">
              <label className="heading-sub block">Guest Name{attendingCount > 1 ? "s" : ""}</label>
              {guestNames.slice(0, attendingCount).map((name, i) => (
                <input
                  key={i}
                  type="text"
                  value={name}
                  onChange={(e) => {
                    const updated = [...guestNames];
                    updated[i] = e.target.value;
                    setGuestNames(updated);
                  }}
                  placeholder={`Guest ${i + 1} — First & Last Name`}
                  className="w-full bg-transparent border-b border-border py-3 font-body text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary transition-colors"
                  maxLength={200}
                />
              ))}
            </div>

            {events.map((ev) => (
              <div key={ev.key} className="space-y-3">
                <div>
                  <p className="heading-sub mb-1">{ev.label}</p>
                  <p className="font-body text-xs text-muted-foreground">{ev.sub}</p>
                </div>
                <div className="flex gap-3">
                  {["accept", "decline"].map((val) => (
                    <EventRsvpButton
                      key={val}
                      eventKey={ev.key}
                      value={val}
                      isSelected={eventRsvps[ev.key] === val}
                      onSelect={() => setEventRsvps((prev) => ({ ...prev, [ev.key]: val }))}
                    />
                  ))}
                </div>
              </div>
            ))}

            {/* Per-person overrides — only relevant when multiple guests */}
            {attendingCount > 1 && (
              <div className="space-y-4">
                <button
                  type="button"
                  onClick={() => setShowOverrides(v => !v)}
                  className="font-body text-xs text-primary underline underline-offset-4 hover:opacity-70 transition-opacity"
                >
                  Someone in your party has different plans?
                </button>

                {showOverrides && (
                  <div className="space-y-8 pt-4 border-t border-border">
                    {guestNames.slice(0, attendingCount).map((name, i) => (
                      <div key={i} className="space-y-3">
                        <p className="heading-sub">{name || `Guest ${i + 1}`}</p>
                        {events.map(ev => (
                          <div key={ev.key} className="flex items-center gap-4">
                            <span className="font-body text-xs text-muted-foreground flex-1">{ev.label}</span>
                            <div className="flex gap-2">
                              {(["accept", "decline"] as const).map(val => (
                                <button
                                  key={val}
                                  type="button"
                                  onClick={() => setPerPersonOverrides(prev => ({
                                    ...prev,
                                    [i]: { ...(prev[i] ?? {}), [ev.key]: val },
                                  }))}
                                  className={`px-3 py-1 text-xs font-body border transition-all ${
                                    getEffectiveRsvp(i, ev.key) === val
                                      ? "border-primary bg-primary/5 text-foreground"
                                      : "border-border text-muted-foreground hover:border-primary/40"
                                  }`}
                                >
                                  {val === "accept" ? "Accept" : "Decline"}
                                </button>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Accommodation dropdown */}
            <div className="space-y-3">
              <label className="heading-sub block">On-Site Accommodations</label>
              <select
                value={accommodation}
                onChange={(e) => setAccommodation(e.target.value)}
                className="w-full bg-transparent border-b border-border py-3 font-body text-foreground focus:outline-none focus:border-primary transition-colors appearance-none cursor-pointer"
              >
                <option value="" className="bg-background">Select an option...</option>
                {accommodationOptions.map((opt) => (
                  <option key={opt} value={opt} className="bg-background">
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            {/* Transport question */}
            <div className="space-y-3">
              <label className="heading-sub block">Transportation</label>
              <p className="font-body text-xs text-muted-foreground">
                We're arranging a group transfer from the Siena train station on Wednesday, September 16th. Let us know if you'll need a spot.
              </p>
              <div className="space-y-2">
                {[
                  { value: "yes", label: "Yes, I'll take the group transfer" },
                  { value: "not_sure", label: "Not sure yet" },
                  { value: "no", label: "No, I'm arranging my own transport" },
                ].map(({ value, label }) => (
                  <label key={value} className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="radio"
                      name="groupTransfer"
                      value={value}
                      checked={groupTransfer === value}
                      onChange={() => {
                        setGroupTransfer(value);
                        if (value !== "no") setOwnTransport("");
                      }}
                      className="accent-primary"
                    />
                    <span className="font-body text-sm text-foreground group-hover:text-primary transition-colors">
                      {label}
                    </span>
                  </label>
                ))}
              </div>

              {groupTransfer === "no" && (
                <div className="pl-5 space-y-2 mt-2">
                  {[
                    { value: "rent_a_car", label: "Renting a car" },
                    { value: "joining_car", label: "Joining someone's car" },
                    { value: "private_transfer", label: "Private transfer" },
                    { value: "not_sure", label: "Not sure yet" },
                  ].map(({ value, label }) => (
                    <label key={value} className="flex items-center gap-3 cursor-pointer group">
                      <input
                        type="radio"
                        name="ownTransport"
                        value={value}
                        checked={ownTransport === value}
                        onChange={() => setOwnTransport(value)}
                        className="accent-primary"
                      />
                      <span className="font-body text-sm text-foreground group-hover:text-primary transition-colors">
                        {label}
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="heading-sub block mb-2">Dietary Restrictions</label>
              <input
                type="text"
                value={dietary}
                onChange={(e) => setDietary(e.target.value)}
                placeholder="Allergies, vegetarian, etc."
                className="w-full bg-transparent border-b border-border py-3 font-body text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary transition-colors"
                maxLength={500}
              />
            </div>

            <div>
              <label className="heading-sub block mb-2">Comments</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Anything else we should know?"
                rows={1}
                className="w-full bg-transparent border-b border-border py-3 font-body text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary transition-colors resize-none"
                maxLength={1000}
              />
            </div>

            <div>
              <label className="heading-sub block mb-2">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="So we can send your RSVP receipt"
                autoComplete="email"
                className="w-full bg-transparent border-b border-border py-3 font-body text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary transition-colors"
                maxLength={255}
              />
            </div>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="relative w-full py-4 font-body text-xs uppercase tracking-[0.25em] transition-opacity disabled:pointer-events-none overflow-hidden border border-primary"
            >
              {loading && (
                <div
                  className="absolute inset-0 bg-primary animate-[progress_4s_ease-in-out_forwards]"
                  style={{ transformOrigin: 'left' }}
                />
              )}
              <span className={`relative z-10 ${loading ? 'text-white' : 'text-primary-foreground'}`}>
                {loading ? "Submitting..." : previouslyResponded ? "Update RSVP" : "Submit RSVP"}
              </span>
              {!loading && <div className="absolute inset-0 bg-primary -z-0" />}
            </button>
          </div>
        </FadeIn>
      )}
    </div>
  );
};

export default RsvpFormEmbed;
