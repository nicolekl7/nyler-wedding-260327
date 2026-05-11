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
  "Choosing Room Later",
  "Joining a Reserved Room",
];

const ACCOMMODATION_LABELS: Record<string, string> = {
  "Choosing Room Later": "Not Ready to Pick a Room Yet",
};

const NO_PAYMENT_ACCOMMODATIONS = ["Not Staying Onsite", "Joining a Reserved Room", "Choosing Room Later"];

const EVENT_LABELS: Record<string, string> = {
  welcome_party_rsvp: "Welcome Party",
  wedding_day_rsvp: "Wedding Day",
  pool_day_rsvp: "Pool Day",
};

const describeAttendance = (firstName: string, rsvps: Record<string, string>): string => {
  const attending = Object.keys(EVENT_LABELS).filter(k => rsvps[k] === "accept").map(k => EVENT_LABELS[k]);
  if (attending.length === 3) return `${firstName} is attending all three events.`;
  if (attending.length === 2) return `${firstName} is attending the ${attending[0]} and ${attending[1]}.`;
  if (attending.length === 1) return `${firstName} is attending the ${attending[0]} only.`;
  return `${firstName} is not attending.`;
};

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
  const [dietary, setDietary] = useState("");
  const [notes, setNotes] = useState("");
  const [email, setEmail] = useState("");
  const [internalAccommodation, setInternalAccommodation] = useState("");
  const [groupTransfer, setGroupTransfer] = useState("");
  const [ownTransport, setOwnTransport] = useState("");
  const [matchOptions, setMatchOptions] = useState<GuestRecord[]>([]);
  const [previouslyResponded, setPreviouslyResponded] = useState(false);
  const [previousAccommodation, setPreviousAccommodation] = useState("");
  const [alreadyRsvpd, setAlreadyRsvpd] = useState(false);
  const [respondedPartyMembers, setRespondedPartyMembers] = useState<Array<{ name: string; fullName: string; rsvps: Record<string, string> }>>([]);
  const [unrespondedCount, setUnrespondedCount] = useState(0);
  const [soldOutRooms, setSoldOutRooms] = useState<Set<string>>(new Set());
  const [inviteNames, setInviteNames] = useState<string[]>([]);
  const [showNameConfirmModal, setShowNameConfirmModal] = useState(false);
  const [nameConfirmChecked, setNameConfirmChecked] = useState(false);

  const accommodation = externalAccommodation !== undefined ? externalAccommodation : internalAccommodation;
  const setAccommodation = (val: string) => {
    if (onAccommodationChange) onAccommodationChange(val);
    else setInternalAccommodation(val);
  };

  const allEventsDeclined = events.length > 0 && events.every((ev) => eventRsvps[ev.key] === "decline");

  useEffect(() => {
    if (localStorage.getItem("hasRSVPd") === "true") {
      setAlreadyRsvpd(true);
    }
    supabase
      .from("room_categories")
      .select("name, inventory_count")
      .then(({ data }) => {
        if (data) {
          setSoldOutRooms(
            new Set(data.filter((r) => Number(r.inventory_count) <= 0).map((r) => r.name))
          );
        }
      });
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

  const loadPartyContext = async (found: GuestRecord) => {
    const { data: allMembers } = await supabase
      .from("guests")
      .select("first_name, last_name")
      .eq("party_name", found.party_name);

    if (!allMembers || allMembers.length <= 1) {
      setRespondedPartyMembers([]);
      setUnrespondedCount(allMembers?.length === 1 ? 1 : 0);
      return;
    }

    const results = await Promise.all(
      allMembers.map(m =>
        supabase
          .from("invited_guests")
          .select("first_name, welcome_party_rsvp, wedding_day_rsvp, pool_day_rsvp")
          .ilike("first_name", m.first_name)
          .ilike("last_name", m.last_name)
          .eq("has_responded", true)
          .limit(1)
          .then(r => ({ member: m, row: r.data?.[0] ?? null }))
      )
    );

    const others: Array<{ name: string; fullName: string; rsvps: Record<string, string> }> = [];
    let unresponded = 0;

    for (const { member, row } of results) {
      const isCurrent =
        normalizeStr(member.first_name) === normalizeStr(found.first_name) &&
        normalizeStr(member.last_name) === normalizeStr(found.last_name);

      if (row) {
        if (!isCurrent) {
          others.push({
            name: member.first_name,
            fullName: `${member.first_name} ${member.last_name}`.trim(),
            rsvps: {
              welcome_party_rsvp: row.welcome_party_rsvp ?? "decline",
              wedding_day_rsvp: row.wedding_day_rsvp ?? "decline",
              pool_day_rsvp: row.pool_day_rsvp ?? "decline",
            },
          });
        }
      } else {
        unresponded++;
      }
    }

    setRespondedPartyMembers(others);
    setUnrespondedCount(unresponded);
  };

  const loadGuest = async (found: GuestRecord) => {
    setLoading(true);
    setMatchOptions([]);
    setGuest(found);
    await Promise.all([loadStateForGuest(found), loadPartyContext(found)]);

    const members = await fetchPartyMembers(found.party_name);
    if (members.length > 0) {
      const searchedNorm = normalizeStr(`${found.first_name} ${found.last_name}`);
      const sorted = [
        ...members.filter(m => normalizeStr(`${m.first_name} ${m.last_name}`) === searchedNorm),
        ...members.filter(m => normalizeStr(`${m.first_name} ${m.last_name}`) !== searchedNorm),
      ];
      setInviteNames(sorted.map(m => `${m.first_name} ${m.last_name}`.trim()));
    } else {
      setInviteNames([`${found.first_name} ${found.last_name}`]);
    }

    setLoading(false);
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
    setMatchOptions([]);

    const firstName = parts[0];
    const lastName = parts.slice(1).join(" ");

    const { data: match } = await supabase
      .from("guests")
      .select("*")
      .ilike("first_name", firstName)
      .ilike("last_name", lastName);

    if (!match || match.length === 0) {
      // Accent-insensitive fallback: fetch all and compare normalized
      const { data: all } = await supabase.from("guests").select("*");
      const found = all?.find(
        (g) =>
          normalizeStr(g.first_name) === normalizeStr(firstName) &&
          normalizeStr(g.last_name) === normalizeStr(lastName)
      );
      if (found) {
        await loadGuest(found as GuestRecord);
      } else {
        setGuest(null);
        setLoading(false);
      }
      return;
    }

    if (match.length > 1) {
      setMatchOptions(match as GuestRecord[]);
      setGuest(null);
      setLoading(false);
      return;
    }

    await loadGuest(match[0] as GuestRecord);
  };

  const handleCountChange = async (count: number) => {
    setAttendingCount(count);

    if (guest) {
      const members = await fetchPartyMembers(guest.party_name);
      if (members.length > 0) {
        const searchedNorm = normalizeStr(`${guest.first_name} ${guest.last_name}`);
        const respondedNorms = new Set(respondedPartyMembers.map(r => normalizeStr(r.fullName)));
        const current = members.filter(m => normalizeStr(`${m.first_name} ${m.last_name}`) === searchedNorm);
        const unresponded = members.filter(m => {
          const norm = normalizeStr(`${m.first_name} ${m.last_name}`);
          return norm !== searchedNorm && !respondedNorms.has(norm);
        });
        const responded = members.filter(m => {
          const norm = normalizeStr(`${m.first_name} ${m.last_name}`);
          return norm !== searchedNorm && respondedNorms.has(norm);
        });
        const sorted = [...current, ...unresponded, ...responded];
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

  const handleSubmit = async (skipNameCheck = false) => {
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
    const declined = events.every((ev) => eventRsvps[ev.key] === "decline");

    if (!declined && !accommodation) {
      toast.error("Please select your accommodation preference");
      setLoading(false);
      return;
    }
    const trimmedEmail = email.trim();
    if (trimmedEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      toast.error("Please enter a valid email address");
      setLoading(false);
      return;
    }
    if (!declined && !groupTransfer) {
      toast.error("Please select your transport option");
      setLoading(false);
      return;
    }
    if (!declined && groupTransfer === "no" && !ownTransport) {
      toast.error("Please select how you're arranging your own transport");
      setLoading(false);
      return;
    }

    if (!skipNameCheck && inviteNames.length > 0) {
      const anyMismatch = guestNames.slice(0, attendingCount).some((name, i) => {
        const invite = inviteNames[i];
        if (!invite) return false;
        return name.trim().toLowerCase() !== invite.toLowerCase();
      });
      if (anyMismatch) {
        setLoading(false);
        setNameConfirmChecked(false);
        setShowNameConfirmModal(true);
        return;
      }
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
        formData.append("Wednesday Welcome Party", eventRsvps.welcome_party_rsvp === "accept" ? "Accept" : "Decline");
        formData.append("Thursday Wedding", eventRsvps.wedding_day_rsvp === "accept" ? "Accept" : "Decline");
        formData.append("Friday Recovery Day", eventRsvps.pool_day_rsvp === "accept" ? "Accept" : "Decline");
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

      await savePartyRsvpState({
        guestNames: guestNames.slice(0, attendingCount),
        eventRsvps,
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
        let alreadyBooked = false;
        if (trimmedEmail) {
          const { data: existingBookings } = await supabase
            .from("room_bookings")
            .select("id")
            .eq("email", trimmedEmail)
            .eq("room_category_id", roomCategoryId)
            .eq("is_released", false)
            .limit(1);
          alreadyBooked = (existingBookings?.length ?? 0) > 0;
        }

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
          if (roomInventory - 1 <= 0) {
            setSoldOutRooms((prev) => new Set([...prev, accommodation]));
          }

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
      receiptForm.append("welcome_party_rsvp", eventRsvps.welcome_party_rsvp || "");
      receiptForm.append("wedding_day_rsvp", eventRsvps.wedding_day_rsvp || "");
      receiptForm.append("pool_day_rsvp", eventRsvps.pool_day_rsvp || "");
      receiptForm.append("accommodation", accommodation);
      receiptForm.append("roomPrice", String(roomPrice));
      receiptForm.append("roomPriceFormatted", roomPriceFormatted);
      receiptForm.append("dietary", dietary.trim());
      receiptForm.append("notes", notes.trim());
      receiptForm.append("allDeclined", declined ? "true" : "false");
      receiptForm.append("roomReminder", accommodation === "Choosing Room Later" ? "true" : "");

      if (trimmedEmail) {
        fetch(RECEIPT_SCRIPT_URL, {
          method: "POST",
          mode: "no-cors",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: receiptForm.toString(),
        }).catch((err) => console.error("Receipt email failed:", err));
      }

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
    await Promise.all([loadStateForGuest(found), loadPartyContext(found)]);
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
                setRespondedPartyMembers([]);
                setUnrespondedCount(0);
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

          {searched && !loading && !guest && matchOptions.length === 0 && (
            <p className="body-editorial text-center mt-8 mx-auto">
              We couldn't find that name. Please try again or contact us at{" "}
              <a href="mailto:nicoleandtylersitalianwedding@gmail.com" className="text-primary underline">
                nicoleandtylersitalianwedding@gmail.com
              </a>
            </p>
          )}

          {matchOptions.length > 1 && (
            <div className="mt-10 space-y-4">
              <p className="body-editorial text-center mx-auto">
                We found a few guests with that name. Which party are you in?
              </p>
              <div className="flex flex-col gap-3">
                {matchOptions.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => loadGuest(opt)}
                    className="w-full px-5 py-4 border border-border text-left font-body text-sm text-foreground hover:border-primary hover:bg-primary/5 transition-colors"
                  >
                    <span className="font-serif text-lg block">
                      {opt.first_name} {opt.last_name}
                    </span>
                    <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground mt-1 block">
                      {opt.party_name}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </FadeIn>
      )}

      {showNameConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="bg-background w-full max-w-md shadow-xl p-6 space-y-5 max-h-[90vh] overflow-y-auto">
            <div>
              <h3 className="font-serif text-xl font-light text-foreground">Please confirm guest names</h3>
              <p className="font-body text-sm text-muted-foreground mt-2">
                Some names don't exactly match what we have on the invitation. Please review before submitting.
              </p>
            </div>
            <div className="space-y-4">
              {guestNames.slice(0, attendingCount).map((name, i) => {
                const invite = inviteNames[i] ?? "";
                const matches = !invite || name.trim().toLowerCase() === invite.toLowerCase();
                return (
                  <div
                    key={i}
                    className={`space-y-1 px-3 py-3 ${matches ? "bg-muted/30" : "bg-amber-50/60 border border-amber-200"}`}
                  >
                    <p className="font-body text-xs uppercase tracking-[0.15em] text-muted-foreground">
                      Guest {i + 1}
                    </p>
                    <p className="font-body text-xs text-muted-foreground">
                      Invitation:{" "}
                      <span className="text-foreground">{invite || "—"}</span>
                    </p>
                    <p className="font-body text-xs text-muted-foreground">
                      You entered:{" "}
                      <span className={`${matches ? "text-foreground" : "text-foreground font-medium"}`}>
                        {name.trim() || "—"}{" "}
                        {matches ? (
                          <span className="text-green-600">✓</span>
                        ) : (
                          <span>⚠️</span>
                        )}
                      </span>
                    </p>
                  </div>
                );
              })}
            </div>
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={nameConfirmChecked}
                onChange={(e) => setNameConfirmChecked(e.target.checked)}
                className="mt-0.5 accent-primary shrink-0"
              />
              <span className="font-body text-sm text-foreground">
                I confirm these are the correct guests for this invitation.
              </span>
            </label>
            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={() => setShowNameConfirmModal(false)}
                className="flex-1 py-3 border border-border font-body text-xs uppercase tracking-[0.25em] text-foreground hover:border-primary/40 transition-colors"
              >
                Go back and edit
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowNameConfirmModal(false);
                  handleSubmit(true);
                }}
                disabled={!nameConfirmChecked}
                className="flex-1 py-3 bg-primary text-primary-foreground font-body text-xs uppercase tracking-[0.25em] hover:opacity-90 transition-opacity disabled:opacity-40 disabled:pointer-events-none"
              >
                Confirm and submit
              </button>
            </div>
          </div>
        </div>
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

            {/* Summary card: other party members who have already responded */}
            {respondedPartyMembers.length > 0 && (
              <div className="bg-muted/40 rounded-md px-5 py-4 space-y-2">
                <p className="font-body text-xs uppercase tracking-[0.15em] text-muted-foreground mb-3">
                  Others in your party have already responded:
                </p>
                {respondedPartyMembers.map(({ name, rsvps }) => (
                  <p key={name} className="font-body text-sm text-foreground">
                    {describeAttendance(name, rsvps)}
                  </p>
                ))}
              </div>
            )}

            {/* Note: shown when more than one party member has not yet responded */}
            {unrespondedCount > 1 && (
              <p className="font-body text-sm text-muted-foreground">
                Plans differ within your party? Just RSVP for yourself or whoever you're going with.
              </p>
            )}

            {guest.max_guests > 1 && (
              <div className="space-y-3">
                <label className="font-serif text-lg md:text-xl font-light text-foreground block">Number of Guests</label>
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
              <label className="font-serif text-lg md:text-xl font-light text-foreground block">Guest Name{attendingCount > 1 ? "s" : ""}</label>
              {guestNames.slice(0, attendingCount).map((name, i) => (
                <div key={i} className="flex items-center gap-2 border-b border-border">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => {
                      const updated = [...guestNames];
                      updated[i] = e.target.value;
                      setGuestNames(updated);
                    }}
                    placeholder={`Guest ${i + 1} — First & Last Name`}
                    autoComplete="off"
                    className="flex-1 bg-transparent py-3 font-body text-foreground placeholder:text-muted-foreground/50 focus:outline-none"
                    maxLength={200}
                  />
                  {i > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        const updated = [...guestNames];
                        updated.splice(i, 1);
                        setGuestNames(updated);
                        setAttendingCount((c) => c - 1);
                      }}
                      className="text-muted-foreground/40 hover:text-muted-foreground transition-colors px-1 py-3 font-body text-sm leading-none"
                      aria-label="Remove guest"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>

            {events.map((ev) => (
              <div key={ev.key} className="space-y-3">
                <div>
                  <p className="font-serif text-lg md:text-xl font-light text-foreground mb-1">{ev.label}</p>
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

            {/* Accommodation dropdown */}
            {!allEventsDeclined && <div className="space-y-3">
              <label className="font-serif text-lg md:text-xl font-light text-foreground block">On-Site Accommodations</label>
              <select
                value={accommodation}
                onChange={(e) => setAccommodation(e.target.value)}
                className="w-full bg-transparent border-b border-border py-3 font-body text-foreground focus:outline-none focus:border-primary transition-colors appearance-none cursor-pointer"
              >
                <option value="" className="bg-background">Select an option...</option>
                {accommodationOptions.map((opt) => {
                  const isSoldOut = soldOutRooms.has(opt);
                  const label = ACCOMMODATION_LABELS[opt] ?? opt;
                  return (
                    <option
                      key={opt}
                      value={opt}
                      disabled={isSoldOut}
                      className="bg-background"
                      style={isSoldOut ? { fontStyle: "italic" } : undefined}
                    >
                      {isSoldOut ? `${label} (Sold Out)` : label}
                    </option>
                  );
                })}
              </select>
            </div>}

            {/* Transport question */}
            {!allEventsDeclined && <div className="space-y-3">
              <label className="font-serif text-lg md:text-xl font-light text-foreground block">Transportation</label>
              <p className="font-body text-xs text-muted-foreground">
                We're arranging a group transfer from the Siena train station on Wednesday, September 16th. Let us know if you'll need a spot.
              </p>
              <div className="space-y-2">
                {[
                  { value: "yes", label: "Yes, I'll take the group transfer" },
                  { value: "not_sure", label: "Not sure yet" },
                  { value: "no", label: "No, I'm arranging my own transport" },
                ].map(({ value, label }) => (
                  <label key={value} className={`flex items-center gap-3 py-3 px-4 border cursor-pointer transition-all duration-200 ${
                    groupTransfer === value
                      ? "border-primary bg-primary/5 text-foreground"
                      : "border-border text-muted-foreground hover:border-primary/40"
                  }`}>
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
                    <span className="font-body text-sm">
                      {label}
                    </span>
                  </label>
                ))}
              </div>

              {groupTransfer === "no" && (
                <div className="pl-4 border-l border-border space-y-2 mt-2">
                  {[
                    { value: "rent_a_car", label: "Renting a car" },
                    { value: "joining_car", label: "Joining someone's car" },
                    { value: "private_transfer", label: "Private transfer" },
                    { value: "not_sure", label: "Not sure yet" },
                  ].map(({ value, label }) => (
                    <label key={value} className={`flex items-center gap-3 py-3 px-4 border cursor-pointer transition-all duration-200 ${
                      ownTransport === value
                        ? "border-primary bg-primary/5 text-foreground"
                        : "border-border text-muted-foreground hover:border-primary/40"
                    }`}>
                      <input
                        type="radio"
                        name="ownTransport"
                        value={value}
                        checked={ownTransport === value}
                        onChange={() => setOwnTransport(value)}
                        className="accent-primary"
                      />
                      <span className="font-body text-sm">
                        {label}
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </div>}

            <div>
              <label className="font-serif text-lg md:text-xl font-light text-foreground block mb-2">Dietary Restrictions</label>
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
              <label className="font-serif text-lg md:text-xl font-light text-foreground block mb-2">Comments</label>
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
              <label className="font-serif text-lg md:text-xl font-light text-foreground block mb-2">Email Address</label>
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
              onClick={() => handleSubmit()}
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
