import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import FadeIn from "@/components/FadeIn";
import EventRsvpButton from "@/components/EventRsvpButton";
import { toast } from "sonner";
import { Search } from "lucide-react";
import { loadPartyRsvpState, savePartyRsvpState, type GuestRecord } from "@/lib/rsvp";
import { useLanguage } from "@/contexts/LanguageContext";

const eventsContent = {
  en: [
    { key: "welcome_party_rsvp" as const, label: "Welcome Pizza Party", sub: "Wednesday, Sept 16 · 6:30 PM" },
    { key: "wedding_day_rsvp" as const, label: "The Wedding Day", sub: "Thursday, Sept 17 · 4:30 PM" },
    { key: "pool_day_rsvp" as const, label: "Recovery Pool Day", sub: "Friday, Sept 18 · 12:00 PM" },
  ],
  pl: [
    { key: "welcome_party_rsvp" as const, label: "Przyjęcie powitalne", sub: "Środa, 16 września · 18:30" },
    { key: "wedding_day_rsvp" as const, label: "Dzień ślubu", sub: "Czwartek, 17 września · 16:30" },
    { key: "pool_day_rsvp" as const, label: "Relaks przy basenie", sub: "Piątek, 18 września · 12:00" },
  ],
};

const accommodationOptions = [
  "Solo Guest Estate Pass",
  "Classic Estate Room",
  "Superior Room",
  "Deluxe Garden Suite",
  "Luxury Suite",
  "Junior Suite",
  "Not Staying Onsite",
  "Joining a Reserved Room",
];

const NO_PAYMENT_ACCOMMODATIONS = ["Not Staying Onsite", "Joining a Reserved Room"];

const strings = {
  en: {
    heading: "RSVP",
    alreadyRsvpdMsg: (name: string) => `We have received your RSVP${name ? `, ${name}` : ""}. Thank you!`,
    stayingOnsite: "Staying onsite? Complete your room payment below.",
    payPaypal: "Pay with PayPal",
    payVenmo: "Pay with Venmo",
    editRsvp: "Need to edit your RSVP?",
    notYou: "Not you?",
    thankYou: "Thank You",
    recorded: "Your RSVP has been recorded.",
    sorryMiss: "We're sorry we'll miss you!",
    cantWait: "We can't wait to celebrate with you!",
    roomNotReserved: "Please note: your room is not reserved until payment is received.",
    findInvite: "Please enter your first and last name to find your invitation.",
    namePlaceholder: "First & Last Name",
    searching: "Searching...",
    findBtn: "Find My Invitation",
    notFound: (email: string) => <>We couldn't find that name. Please try again or contact us at{" "}<a href={`mailto:${email}`} className="text-primary underline">{email}</a></>,
    welcome: (name: string) => <>Welcome, <span className="font-medium text-foreground">{name}</span>!</>,
    maxGuests: (n: number) => `You may RSVP for up to ${n} guest${n > 1 ? "s" : ""}.`,
    previouslyRsvpd: "Your party has already been RSVPd — your previous selections are loaded below. Feel free to update them.",
    numGuests: "Number of Guests",
    guestNames: (plural: boolean) => `Guest Name${plural ? "s" : ""}`,
    guestPlaceholder: (i: number) => `Guest ${i + 1} — First & Last Name`,
    accommodations: "On-Site Accommodations",
    selectOption: "Select an option...",
    dietary: "Dietary Restrictions",
    dietaryPlaceholder: "Allergies, vegetarian, etc.",
    comments: "Comments",
    commentsPlaceholder: "Anything else we should know?",
    email: "Email Address",
    emailPlaceholder: "So we can send your RSVP receipt",
    submitting: "Submitting...",
    updateRsvp: "Update RSVP",
    submitRsvp: "Submit RSVP",
    errFirstLast: "Please enter your first and last name",
    errEvent: (label: string) => `Please select Accept or Decline for ${label}`,
    errGuestName: (i: number) => `Please enter the name for guest ${i + 1}`,
    errAccommodation: "Please select your accommodation preference",
    errEmail: "Please enter a valid email address so we can send your receipt",
    errGeneric: "Something went wrong. Please try again.",
  },
  pl: {
    heading: "RSVP",
    alreadyRsvpdMsg: (name: string) => `Otrzymaliśmy Twoje RSVP${name ? `, ${name}` : ""}. Dziękujemy!`,
    stayingOnsite: "Nocujesz na miejscu? Dokonaj płatności za pokój poniżej.",
    payPaypal: "Zapłać przez PayPal",
    payVenmo: "Zapłać przez Venmo",
    editRsvp: "Chcesz edytować swoje RSVP?",
    notYou: "To nie Ty?",
    thankYou: "Dziękujemy",
    recorded: "Twoje RSVP zostało zarejestrowane.",
    sorryMiss: "Szkoda, że Cię nie będzie!",
    cantWait: "Nie możemy się doczekać świętowania razem z Wami!",
    roomNotReserved: "Uwaga: pokój jest zarezerwowany dopiero po otrzymaniu płatności.",
    findInvite: "Wpisz swoje imię i nazwisko, aby znaleźć zaproszenie.",
    namePlaceholder: "Imię i Nazwisko",
    searching: "Szukam...",
    findBtn: "Znajdź moje zaproszenie",
    notFound: (email: string) => <>Nie znaleźliśmy tego imienia. Spróbuj ponownie lub skontaktuj się z nami pod adresem{" "}<a href={`mailto:${email}`} className="text-primary underline">{email}</a></>,
    welcome: (name: string) => <>Witaj, <span className="font-medium text-foreground">{name}</span>!</>,
    maxGuests: (n: number) => `Możesz potwierdzić RSVP dla maksymalnie ${n} gościa${n > 1 ? "/gości" : ""}.`,
    previouslyRsvpd: "Twoja rezerwacja została już wcześniej przesłana — poprzednie wybory są załadowane poniżej. Możesz je zaktualizować.",
    numGuests: "Liczba gości",
    guestNames: (plural: boolean) => `Imię${plural ? "/imiona" : ""} gości`,
    guestPlaceholder: (i: number) => `Gość ${i + 1} — Imię i Nazwisko`,
    accommodations: "Zakwaterowanie na miejscu",
    selectOption: "Wybierz opcję...",
    dietary: "Ograniczenia dietetyczne",
    dietaryPlaceholder: "Alergie, wegetarianin, itp.",
    comments: "Uwagi",
    commentsPlaceholder: "Coś jeszcze, co powinniśmy wiedzieć?",
    email: "Adres e-mail",
    emailPlaceholder: "Abyśmy mogli przesłać potwierdzenie RSVP",
    submitting: "Przesyłam...",
    updateRsvp: "Zaktualizuj RSVP",
    submitRsvp: "Wyślij RSVP",
    errFirstLast: "Proszę podać imię i nazwisko",
    errEvent: (label: string) => `Proszę wybrać Akceptuję lub Odrzucam dla: ${label}`,
    errGuestName: (i: number) => `Proszę podać imię gościa ${i + 1}`,
    errAccommodation: "Proszę wybrać preferencje zakwaterowania",
    errEmail: "Proszę podać prawidłowy adres e-mail, abyśmy mogli przesłać potwierdzenie",
    errGeneric: "Coś poszło nie tak. Spróbuj ponownie.",
  },
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
  const [previouslyResponded, setPreviouslyResponded] = useState(false);
  const [alreadyRsvpd, setAlreadyRsvpd] = useState(false);
  const [rsvpFirstName, setRsvpFirstName] = useState("");

  const { language } = useLanguage();
  const t = strings[language];
  const events = eventsContent[language];

  const accommodation = externalAccommodation !== undefined ? externalAccommodation : internalAccommodation;
  const setAccommodation = (val: string) => {
    if (onAccommodationChange) onAccommodationChange(val);
    else setInternalAccommodation(val);
  };

  useEffect(() => {
    if (localStorage.getItem("hasRSVPd") === "true") {
      setAlreadyRsvpd(true);
      const savedName = localStorage.getItem("rsvpName") || "";
      setRsvpFirstName(savedName.split(" ")[0] || "");
    }
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const parts = searchName.trim().split(/\s+/);
    if (parts.length < 2) {
      toast.error(t.errFirstLast);
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
    if (!externalAccommodation && loadedState.accommodation) {
      setAccommodation(loadedState.accommodation);
    } else if (!externalAccommodation && !loadedState.accommodation) {
      // no prior selection, leave empty
    }
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
        toast.error(t.errEvent(ev.label));
        setLoading(false);
        return;
      }
    }
    for (let i = 0; i < attendingCount; i++) {
      if (!guestNames[i]?.trim()) {
        toast.error(t.errGuestName(i));
        setLoading(false);
        return;
      }
    }
    if (!accommodation) {
      toast.error(t.errAccommodation);
      setLoading(false);
      return;
    }
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      toast.error(t.errEmail);
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
        formData.append("Email", trimmedEmail);
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
        email: trimmedEmail,
      });

      // Send receipt email via separate Apps Script (fire-and-forget)
      const RECEIPT_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyNmaFh0PpuYkB2nxshXCuFv2Vxvnv_QFxSl67g1qdE8--Sd2r_l0rhbiW0NprZJqsR/exec";
      const receiptForm = new URLSearchParams();
      receiptForm.append("email", trimmedEmail);
      receiptForm.append("guestNames", cleanedNames.join("|"));
      receiptForm.append("welcome_party_rsvp", eventRsvps.welcome_party_rsvp || "");
      receiptForm.append("wedding_day_rsvp", eventRsvps.wedding_day_rsvp || "");
      receiptForm.append("pool_day_rsvp", eventRsvps.pool_day_rsvp || "");
      receiptForm.append("accommodation", accommodation);
      receiptForm.append("dietary", dietary.trim());
      receiptForm.append("notes", notes.trim());
      receiptForm.append("allDeclined", declined ? "true" : "false");

      fetch(RECEIPT_SCRIPT_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: receiptForm.toString(),
      }).catch((err) => console.error("Receipt email failed:", err));

      localStorage.setItem("hasRSVPd", "true");
      localStorage.setItem("rsvpName", `${guest?.first_name} ${guest?.last_name}`);
      localStorage.setItem("rsvpEmail", trimmedEmail);
      setAllDeclined(declined);
      setSubmitted(true);
      onSubmitSuccess?.(declined, accommodation);
    } catch {
      toast.error(t.errGeneric);
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
    if (!externalAccommodation && loadedState.accommodation) {
      setAccommodation(loadedState.accommodation);
    }
    setGuestNames(loadedState.guestNames);
    setAttendingCount(Math.min(found.max_guests, loadedState.attendingCount));
    setEmail(localStorage.getItem("rsvpEmail") || "");

    setLoading(false);
  };

  if (alreadyRsvpd && !submitted) {
    return (
      <div className="text-center">
        <FadeIn>
          <h2 className="heading-section mb-4">{t.heading}</h2>
          <div className="w-12 h-px bg-primary mx-auto mb-8" />
          <p className="body-editorial mx-auto mb-10">
            {t.alreadyRsvpdMsg(rsvpFirstName)}
          </p>

          <div className="mb-8">
            <p className="font-body text-sm text-muted-foreground mb-4">
              {t.stayingOnsite}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href="https://paypal.me/nylerwedding"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-8 py-4 bg-primary text-primary-foreground font-body text-xs uppercase tracking-[0.25em] hover:opacity-90 transition-opacity"
              >
                {t.payPaypal}
              </a>
              <a
                href={`https://venmo.com/tylermagee?txn=pay&note=${encodeURIComponent("Wedding accommodation")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-8 py-4 border border-primary text-primary font-body text-xs uppercase tracking-[0.25em] hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                {t.payVenmo}
              </a>
            </div>
          </div>

          <button
            type="button"
            onClick={handleEditRsvp}
            className="font-body text-xs uppercase tracking-[0.25em] text-primary underline underline-offset-4 hover:opacity-70 transition-opacity"
          >
            {t.editRsvp}
          </button>
          <div className="mt-4">
            <button
              type="button"
              onClick={() => {
                localStorage.removeItem("hasRSVPd");
                localStorage.removeItem("rsvpName");
                localStorage.removeItem("rsvpEmail");
                setAlreadyRsvpd(false);
                setRsvpFirstName("");
                setGuest(null);
                setSearchName("");
                setSearched(false);
                setGuestNames([""]);
                setEventRsvps({});
                setDietary("");
                setNotes("");
                setEmail("");
                setAccommodation("");
                setAttendingCount(1);
              }}
              className="font-body text-xs uppercase tracking-[0.25em] text-muted-foreground underline underline-offset-4 hover:opacity-70 transition-opacity"
            >
              {t.notYou}
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
          <h2 className="heading-section mb-4">{t.thankYou}</h2>
          <div className="w-12 h-px bg-primary mx-auto mb-8" />
          <p className="body-editorial mx-auto">
            {t.recorded}
            <br />
            {allDeclined ? t.sorryMiss : t.cantWait}
          </p>
          {!allDeclined && !NO_PAYMENT_ACCOMMODATIONS.includes(accommodation) && (
            <>
              <p className="font-body text-sm text-muted-foreground mt-6">
                {t.roomNotReserved}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
                <a
                  href="https://paypal.me/nylerwedding"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block px-8 py-4 bg-primary text-primary-foreground font-body text-xs uppercase tracking-[0.25em] hover:opacity-90 transition-opacity"
                >
                  {t.payPaypal}
                </a>
                <a
                  href={`https://venmo.com/tylermagee?txn=pay&note=${encodeURIComponent("Wedding accommodation")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block px-8 py-4 border border-primary text-primary font-body text-xs uppercase tracking-[0.25em] hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  {t.payVenmo}
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
        <h2 className="heading-section text-center mb-4">{t.heading}</h2>
        <div className="w-12 h-px bg-primary mx-auto mb-12" />
      </FadeIn>

      {!guest && (
        <FadeIn delay={150}>
          <p className="body-editorial text-center mx-auto mb-10">
            {t.findInvite}
          </p>
          <form onSubmit={handleSearch} className="space-y-6">
            <div className="relative">
              <Search size={16} className="absolute left-0 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                placeholder={t.namePlaceholder}
                className="w-full bg-transparent border-b border-border py-3 pl-7 font-body text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary transition-colors"
                maxLength={200}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-primary text-primary-foreground font-body text-xs uppercase tracking-[0.25em] hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading ? t.searching : t.findBtn}
            </button>
          </form>

          {searched && !loading && !guest && (
            <p className="body-editorial text-center mt-8 mx-auto">
              {t.notFound("nicoleandtylersitalianwedding@gmail.com")}
            </p>
          )}
        </FadeIn>
      )}

      {guest && (
        <FadeIn delay={100}>
          <div className="space-y-12">
            <div className="text-center">
              <p className="body-editorial mx-auto mb-2">
                {t.welcome(guest.first_name)}
              </p>
              <p className="font-body text-sm text-muted-foreground">
                {t.maxGuests(guest.max_guests)}
              </p>
              {previouslyResponded && (
                <p className="font-body text-xs text-primary mt-2 italic">
                  {t.previouslyRsvpd}
                </p>
              )}
            </div>

            {guest.max_guests > 1 && (
              <div className="space-y-3">
                <label className="heading-sub block">{t.numGuests}</label>
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
              <label className="heading-sub block">{t.guestNames(attendingCount > 1)}</label>
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
                  placeholder={t.guestPlaceholder(i)}
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
              <label className="heading-sub block">{t.accommodations}</label>
              <select
                value={accommodation}
                onChange={(e) => setAccommodation(e.target.value)}
                className="w-full bg-transparent border-b border-border py-3 font-body text-foreground focus:outline-none focus:border-primary transition-colors appearance-none cursor-pointer"
              >
                <option value="" className="bg-background">{t.selectOption}</option>
                {accommodationOptions.map((opt) => (
                  <option key={opt} value={opt} className="bg-background">
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="heading-sub block mb-2">{t.dietary}</label>
              <input
                type="text"
                value={dietary}
                onChange={(e) => setDietary(e.target.value)}
                placeholder={t.dietaryPlaceholder}
                className="w-full bg-transparent border-b border-border py-3 font-body text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary transition-colors"
                maxLength={500}
              />
            </div>

            <div>
              <label className="heading-sub block mb-2">{t.comments}</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={t.commentsPlaceholder}
                rows={1}
                className="w-full bg-transparent border-b border-border py-3 font-body text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary transition-colors resize-none"
                maxLength={1000}
              />
            </div>

            <div>
              <label className="heading-sub block mb-2">{t.email}</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t.emailPlaceholder}
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
                {loading ? t.submitting : previouslyResponded ? t.updateRsvp : t.submitRsvp}
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
