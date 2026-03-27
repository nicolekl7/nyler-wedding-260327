import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import FadeIn from "@/components/FadeIn";
import EventRsvpButton from "@/components/EventRsvpButton";
import { toast } from "sonner";
import { Search } from "lucide-react";
import { loadPartyRsvpState, savePartyRsvpState, type GuestRecord } from "@/lib/rsvp";

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
];

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
  const [internalAccommodation, setInternalAccommodation] = useState("");
  const [previouslyResponded, setPreviouslyResponded] = useState(false);
  const [alreadyRsvpd, setAlreadyRsvpd] = useState(false);

  const accommodation = externalAccommodation !== undefined ? externalAccommodation : internalAccommodation;
  const setAccommodation = (val: string) => {
    if (onAccommodationChange) onAccommodationChange(val);
    else setInternalAccommodation(val);
  };

  useEffect(() => {
    if (localStorage.getItem("hasRSVPd") === "true") {
      setAlreadyRsvpd(true);
    }
  }, []);

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

    const { data: match } = await supabase
      .from("guests")
      .select("*")
      .ilike("first_name", firstName)
      .ilike("last_name", lastName)
      .limit(1);

    if (!match || match.length === 0) {
      setGuest(null);
      setLoading(false);
      return;
    }

    const found = match[0] as GuestRecord;
    setGuest(found);

    const loadedState = await loadPartyRsvpState(found, firstName, lastName);
    setPreviouslyResponded(loadedState.previouslyResponded);
    setEventRsvps(loadedState.eventRsvps);
    setDietary(loadedState.dietary);
    setNotes(loadedState.notes);
    setAccommodation(loadedState.accommodation);
    setGuestNames(loadedState.guestNames);
    setAttendingCount(Math.min(found.max_guests, loadedState.attendingCount));

    setLoading(false);
  };

  const handleCountChange = (count: number) => {
    setAttendingCount(count);
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

    const declined = events.every((ev) => eventRsvps[ev.key] === "decline");

    const cleanedNames = guestNames.slice(0, attendingCount).map(n => n.trim()).filter(Boolean);

    try {
      for (const fullName of cleanedNames) {
        const nameParts = fullName.split(/\s+/);
        const firstName = nameParts[0] || "";
        const lastName = nameParts.slice(1).join(" ") || "";

        const formData = new URLSearchParams();
        formData.append("First Name", firstName);
        formData.append("Last Name", lastName);
        formData.append("Wednesday Welcome Party", eventRsvps.welcome_party_rsvp === "accept" ? "Accept" : "Decline");
        formData.append("Thursday Wedding", eventRsvps.wedding_day_rsvp === "accept" ? "Accept" : "Decline");
        formData.append("Friday Recovery Day", eventRsvps.pool_day_rsvp === "accept" ? "Accept" : "Decline");
        formData.append("Room Preference", accommodation || "");
        formData.append("Dietary Restrictions", dietary.trim() || "None");
        formData.append("Notes", notes.trim() || "");

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

      await savePartyRsvpState({
        guestNames: guestNames.slice(0, attendingCount),
        eventRsvps,
        dietary,
        notes,
        accommodation,
      });

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

    const { data: match } = await supabase
      .from("guests")
      .select("*")
      .ilike("first_name", firstName)
      .ilike("last_name", lastName)
      .limit(1);

    if (!match || match.length === 0) {
      setGuest(null);
      setLoading(false);
      return;
    }

    const found = match[0] as GuestRecord;
    setGuest(found);

    const loadedState = await loadPartyRsvpState(found, firstName, lastName);
    setPreviouslyResponded(loadedState.previouslyResponded);
    setEventRsvps(loadedState.eventRsvps);
    setDietary(loadedState.dietary);
    setNotes(loadedState.notes);
    setAccommodation(loadedState.accommodation);
    setGuestNames(loadedState.guestNames);
    setAttendingCount(Math.min(found.max_guests, loadedState.attendingCount));

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
          {!allDeclined && accommodation !== "Not Staying Onsite" && (
            <>
              <p className="font-body text-sm text-muted-foreground mt-6">
                Please note: your room is not reserved until payment is received.
              </p>
              <a
                href="https://paypal.me/nylerwedding"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-6 px-8 py-4 bg-primary text-primary-foreground font-body text-xs uppercase tracking-[0.25em] hover:opacity-90 transition-opacity"
              >
                Pay Here
              </a>
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
                Welcome, <span className="font-medium text-foreground">{guest.party_name}</span>!
              </p>
              <p className="font-body text-sm text-muted-foreground">
                You may RSVP for up to {guest.max_guests} guest{guest.max_guests > 1 ? "s" : ""}.
              </p>
              {previouslyResponded && (
                <p className="font-body text-xs text-primary mt-2 italic">
                  Your party has already been RSVPd — your previous selections are loaded below. Feel free to update them.
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
