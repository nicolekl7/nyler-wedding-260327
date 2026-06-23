import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import FadeIn from "@/components/FadeIn";
import { supabase } from "@/integrations/supabase/client";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";

const CAPACITY = 28;
const MAX_PARTY_SIZE = 6;

type Wave = "wave_1" | "wave_2" | "none";

const ARRIVAL_OPTIONS: { value: Wave; label: string }[] = [
  { value: "wave_1", label: "Wave 1 — depart Siena Train Station 2:00 PM" },
  { value: "wave_2", label: "Wave 2 — depart Siena Train Station 3:00 PM" },
  { value: "none", label: "Not taking the arrival shuttle" },
];

const DEPARTURE_OPTIONS: { value: Wave; label: string }[] = [
  { value: "wave_1", label: "Wave 1 — depart Borgo 11:00 AM" },
  { value: "wave_2", label: "Wave 2 — depart Borgo 12:00 PM" },
  { value: "none", label: "Not taking the departure shuttle" },
];

const FULL_SHUTTLE_ERROR = "This shuttle is full, please choose another time.";
const ALL_FULL_ERROR = "The shuttles are full, please reach out to Nicole and Tyler.";
const NOT_ENOUGH_SPOTS_ERROR = "Please select an option that has enough spots for your party.";

const Shuttle = () => {
  const [partySize, setPartySize] = useState("1");
  const [fullName, setFullName] = useState("");
  const [guestNames, setGuestNames] = useState<string[]>([]);
  const [email, setEmail] = useState("");
  const [arrivalWave, setArrivalWave] = useState<Wave | "">("");
  const [departureWave, setDepartureWave] = useState<Wave | "">("");
  const [whatsappOptin, setWhatsappOptin] = useState<"yes" | "no" | "">("");
  const [travelDetails, setTravelDetails] = useState("");

  const [seatsUsed, setSeatsUsed] = useState<Record<string, number>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const loadSeatsUsed = async () => {
    const { data } = await supabase.from("shuttle_signups").select("party_size, arrival_wave, departure_wave");
    const used: Record<string, number> = {
      arrival_wave_1: 0,
      arrival_wave_2: 0,
      departure_wave_1: 0,
      departure_wave_2: 0,
    };
    (data ?? []).forEach((row) => {
      if (row.arrival_wave === "wave_1") used.arrival_wave_1 += row.party_size;
      if (row.arrival_wave === "wave_2") used.arrival_wave_2 += row.party_size;
      if (row.departure_wave === "wave_1") used.departure_wave_1 += row.party_size;
      if (row.departure_wave === "wave_2") used.departure_wave_2 += row.party_size;
    });
    setSeatsUsed(used);
  };

  useEffect(() => {
    loadSeatsUsed();

    const channel = supabase
      .channel("shuttle-signups-changes")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "shuttle_signups" }, () => {
        loadSeatsUsed();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handlePartySizeChange = (value: string) => {
    setPartySize(value);
    const size = parseInt(value, 10);
    
    if (!isNaN(size) && size >= 1 && size <= MAX_PARTY_SIZE) {
      setGuestNames((prev) => {
        const currentGuests = [...prev];
        if (currentGuests.length < size - 1) {
          return [...currentGuests, ...Array(size - 1 - currentGuests.length).fill("")];
        } else {
          return currentGuests.slice(0, size - 1);
        }
      });
    } else if (value === "") {
      setGuestNames([]);
    }
  };

  const handleGuestNameChange = (index: number, value: string) => {
    setGuestNames((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  const remaining = (direction: "arrival" | "departure", wave: "wave_1" | "wave_2") =>
    Math.max(0, CAPACITY - (seatsUsed[`${direction}_${wave}`] ?? 0));

  const arrivalFull = remaining("arrival", "wave_1") === 0 && remaining("arrival", "wave_2") === 0;
  const departureFull = remaining("departure", "wave_1") === 0 && remaining("departure", "wave_2") === 0;

  const syncToSheet = (payload: {
    fullName: string;
    email: string;
    partySize: number;
    arrivalWave: Wave;
    departureWave: Wave;
    whatsappOptin: boolean;
    travelDetails: string;
  }) => {
    supabase.functions
      .invoke("shuttle-sheet", {
        body: {
          timestamp: new Date().toISOString(),
          fullName: payload.fullName,
          email: payload.email,
          partySize: payload.partySize,
          arrivalWave: payload.arrivalWave,
          departureWave: payload.departureWave,
          whatsappOptin: payload.whatsappOptin,
          travelDetails: payload.travelDetails,
        },
      })
      .catch(() => {});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const size = Number(partySize);
    if (!Number.isFinite(size) || size < 1 || size > MAX_PARTY_SIZE) {
      toast.error(`Party size must be between 1 and ${MAX_PARTY_SIZE}.`);
      return;
    }

    const hasEmptyGuestNames = guestNames.some((name) => !name.trim());
    if (!fullName.trim() || !email.trim() || !arrivalWave || !departureWave || !whatsappOptin || hasEmptyGuestNames) {
      toast.error("Please fill out all required fields.");
      return;
    }

    const arrivalShort = (arrivalWave === "wave_1" || arrivalWave === "wave_2") && size > remaining("arrival", arrivalWave);
    const departureShort = (departureWave === "wave_1" || departureWave === "wave_2") && size > remaining("departure", departureWave);
    if (arrivalShort || departureShort) {
      toast.error(NOT_ENOUGH_SPOTS_ERROR);
      return;
    }

    setSubmitting(true);

    const guestListText = guestNames.length > 0 
      ? `[Additional Guests: ${guestNames.map(n => n.trim()).join(", ")}]` 
      : "";
    const combinedTravelDetails = `${guestListText} ${travelDetails.trim()}`.trim();

    // 1. Save to Supabase (keeps group reservation atomic for seat counts)
    const { data, error } = await supabase.rpc("book_shuttle", {
      _full_name: fullName.trim(),
      _party_size: size,
      _arrival_wave: arrivalWave,
      _departure_wave: departureWave,
      _whatsapp_optin: whatsappOptin === "yes",
      _travel_details: combinedTravelDetails || null,
      _email: email.trim(),
    });

    if (error) {
      toast.error(error.message.toLowerCase().includes("full") ? error.message : NOT_ENOUGH_SPOTS_ERROR);
      setSubmitting(false);
      loadSeatsUsed();
      return;
    }

    // 2. Sync Primary Guest as an individual line to Google Sheets
    syncToSheet({
      fullName: fullName.trim(),
      email: email.trim(),
      partySize: 1,
      arrivalWave: arrivalWave as Wave,
      departureWave: departureWave as Wave,
      whatsappOptin: whatsappOptin === "yes",
      travelDetails: travelDetails.trim(),
    });

    // 3. Sync each Additional Guest as their own separate line to Google Sheets
    guestNames.forEach((name) => {
      if (name.trim()) {
        syncToSheet({
          fullName: name.trim(),
          email: email.trim(),
          partySize: 1,
          arrivalWave: arrivalWave as Wave,
          departureWave: departureWave as Wave,
          whatsappOptin: whatsappOptin === "yes",
          travelDetails: `[Primary Guest: ${fullName.trim()}] ${travelDetails.trim()}`.trim(),
        });
      }
    });

    setSubmitting(false);
    setSubmitted(true);
    void data;
  };

  if (submitted) {
    return (
      <Layout>
        <section className="page-section w-[90%] max-w-[900px] mx-auto text-center">
          <FadeIn>
            <h1 className="heading-section mb-4">Thank You</h1>
            <div className="w-12 h-px bg-primary mx-auto mb-8" />
            <p className="body-editorial mx-auto text-balance max-w-none">
              Your shuttle sign-up is confirmed. We can't wait to see you in Tuscany!
            </p>
            <p className="font-display italic text-lg text-foreground mt-8">Ci vediamo in Italia!</p>
          </FadeIn>
        </section>
      </Layout>
    );
  }

  return (
    <Layout>
      <section className="page-section w-[90%] max-w-[900px] mx-auto">
        <FadeIn>
          <h1 className="heading-section text-center mb-4">Shuttle Sign-Ups</h1>
          <div className="w-12 h-px bg-primary mx-auto mb-12" />
        </FadeIn>

        <FadeIn delay={100}>
          <div className="space-y-6 mb-16 text-center">
            <p className="body-editorial mx-auto text-balance max-w-none text-foreground font-normal">
              Shuttle Service (Siena Train Station ↔ Laticastelli)
            </p>
            <p className="body-editorial mx-auto text-balance max-w-none">
              We have arranged a complimentary shuttle service between the Siena train station and our venue on
              September 16th and September 18th. It is a 25-35 minute trip.
            </p>
            <p className="body-editorial mx-auto text-balance max-w-none">
              Please reserve your preferred times below. There is plenty of room for everyone across the schedule but
              once a specific time slot fills up, we unfortunately cannot add additional seats. We highly recommend
              checking train schedules and ticket availability before booking your shuttle.
            </p>
            <p className="body-editorial mx-auto text-balance max-w-none">
              Public transit and taxis can be tough to come by in Tuscany. If your schedule doesn't align with our
              shuttle times, we highly recommend renting a car or booking a private transfer in advance.
            </p>
            <p className="body-editorial mx-auto text-balance max-w-none text-foreground font-normal">
              Before Laticastelli
            </p>
            <p className="body-editorial mx-auto text-balance max-w-none">
              We are putting something together for anyone that will be in Florence on Tuesday night (9/15). More
              information to come but please let us know if you'll be around or are interested. Also, if you'd
              like to coordinate travel or meet up with other please opt into the WhatsApp group below.
            </p>
          </div>
        </FadeIn>

        <FadeIn delay={150}>
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-2">
              <Label htmlFor="partySize">Party Size</Label>
              <Input
                id="partySize"
                type="number"
                min={1}
                max={MAX_PARTY_SIZE}
                value={partySize}
                onChange={(e) => handlePartySizeChange(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(
