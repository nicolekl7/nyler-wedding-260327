import { useEffect, useRef, useState } from "react";
import Layout from "@/components/Layout";
import FadeIn from "@/components/FadeIn";
import { supabase } from "@/integrations/supabase/client";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const WAVE_CAPACITY: Record<"arrival" | "departure", Record<"wave_1" | "wave_2", number>> = {
  arrival: { wave_1: 26, wave_2: 26 },
  departure: { wave_1: 22, wave_2: 22 },
};
const MAX_PARTY_SIZE = 4;
const MAX_PASSPORT_BYTES = 10 * 1024 * 1024;
const ALLOWED_PASSPORT_TYPES = ["image/jpeg", "image/png", "image/heic", "image/heif", "application/pdf"];
const WHATSAPP_GROUP_URL = "https://chat.whatsapp.com/JxILxYsQ4cHEiOPRRsvXbL";

const slugify = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "guest";

type Wave = "wave_1" | "wave_2" | "none";

const ARRIVAL_WAVES: { value: Wave; label: string; detail: string | null }[] = [
  { value: "wave_1", label: "Wave 1", detail: "Depart Siena Train Station 2:00 PM" },
  { value: "wave_2", label: "Wave 2", detail: "Depart Siena Train Station 3:00 PM" },
  { value: "none", label: "Not taking the arrival shuttle", detail: null },
];

const DEPARTURE_WAVES: { value: Wave; label: string; detail: string | null }[] = [
  { value: "wave_1", label: "Wave 1", detail: "Depart Borgo 11:00 AM" },
  { value: "wave_2", label: "Wave 2", detail: "Depart Borgo 12:00 PM" },
  { value: "none", label: "Not taking the departure shuttle", detail: null },
];

const ARRIVAL_PLANS: { value: "rental_car" | "private_transfer" | "not_sure"; label: string }[] = [
  { value: "rental_car", label: "Renting a car" },
  { value: "private_transfer", label: "Arranging a private transfer or taxi" },
  { value: "not_sure", label: "Not sure yet" },
];

const DEPARTURE_PLANS: { value: "rental_car" | "private_transfer" | "not_sure"; label: string }[] = [
  { value: "rental_car", label: "Renting a car" },
  { value: "private_transfer", label: "Arranging a private transfer or taxi" },
  { value: "not_sure", label: "Not sure yet" },
];

const FLORENCE_OPTIONS: { value: "Yes, count me in" | "No" | "Maybe" }[] = [
  { value: "Yes, count me in" },
  { value: "No" },
  { value: "Maybe" },
];

const NOT_ENOUGH_SPOTS_ERROR = "Please select an option that has enough spots for your party.";

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-sm text-destructive font-medium mt-1.5">{message}</p>;
}

function ShuttleOptionCard({
  label,
  detail,
  spotsLeft,
  disabled,
  selected,
  onSelect,
}: {
  label: string;
  detail: string | null;
  spotsLeft: number | null;
  disabled: boolean;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={disabled}
      className={`flex items-center justify-between w-full p-4 border rounded-md text-left transition-all ${
        selected
          ? "border-sage bg-sage text-white"
          : "border-input bg-background hover:bg-muted/50"
      } ${disabled ? "opacity-40 cursor-not-allowed hover:bg-background" : "cursor-pointer"}`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
            selected ? "border-white" : "border-border"
          }`}
        >
          {selected && <div className="w-2.5 h-2.5 rounded-full bg-white" />}
        </div>
        <span className="font-body text-sm font-medium">
          {detail ? `${label} — ${detail}` : label}
        </span>
      </div>
      {spotsLeft !== null && (
        <span
          className={`text-xs uppercase tracking-wider shrink-0 ml-3 ${
            disabled ? "text-destructive font-semibold" : selected ? "text-white" : "text-muted-foreground"
          }`}
        >
          {disabled ? "Full" : `${spotsLeft} spots left`}
        </span>
      )}
    </button>
  );
}

function PillOption({
  label,
  selected,
  onSelect,
}: {
  label: string;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`px-4 py-2.5 border rounded-md font-body text-sm transition-all ${
        selected
          ? "border-sage bg-sage text-white font-medium"
          : "border-input bg-background hover:bg-muted/50"
      }`}
    >
      {label}
    </button>
  );
}

const Shuttle = () => {
  const [email, setEmail] = useState("");
  const [partySize, setPartySize] = useState(1);
  const [names, setNames] = useState<string[]>([""]);
  const [arrivalWave, setArrivalWave] = useState<Wave | "">("");
  const [arrivalPlan, setArrivalPlan] = useState<"rental_car" | "private_transfer" | "not_sure" | "">("");
  const [departureWave, setDepartureWave] = useState<Wave | "">("");
  const [departurePlan, setDeparturePlan] = useState<"rental_car" | "private_transfer" | "not_sure" | "">("");
  const [passportFiles, setPassportFiles] = useState<(File | null)[]>([null]);
  const [florenceRsvp, setFlorenceRsvp] = useState<"Yes, count me in" | "No" | "Maybe" | "">("");
  const [travelPlans, setTravelPlans] = useState("");

  const [seatsUsed, setSeatsUsed] = useState<Record<string, number>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const fileRefs = useRef<(HTMLInputElement | null)[]>([]);

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

  const remaining = (direction: "arrival" | "departure", wave: "wave_1" | "wave_2") =>
    Math.max(0, WAVE_CAPACITY[direction][wave] - (seatsUsed[`${direction}_${wave}`] ?? 0));

  const handlePartySizeChange = (size: number) => {
    setPartySize(size);
    setNames((prev) => {
      const updated = [...prev];
      while (updated.length < size) updated.push("");
      return updated.slice(0, size);
    });
    setPassportFiles((prev) => {
      const updated = [...prev];
      while (updated.length < size) updated.push(null);
      return updated.slice(0, size);
    });
  };

  const handleNameChange = (index: number, value: string) => {
    setNames((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  const handlePassportFileChange = (index: number, file: File | null) => {
    if (file) {
      if (!ALLOWED_PASSPORT_TYPES.includes(file.type)) {
        toast.error("Please upload a JPG, PNG, HEIC, or PDF file.");
        return;
      }
      if (file.size > MAX_PASSPORT_BYTES) {
        toast.error("File is too large. Max size is 10MB.");
        return;
      }
    }
    setPassportFiles((prev) => {
      const next = [...prev];
      next[index] = file;
      return next;
    });
  };

  const handleRemovePassportFile = (index: number) => {
    setPassportFiles((prev) => {
      const next = [...prev];
      next[index] = null;
      return next;
    });
    const input = fileRefs.current[index];
    if (input) input.value = "";
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!email.trim()) errs.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(email)) errs.email = "Enter a valid email";
    names.forEach((n, i) => {
      if (!n.trim()) errs[`name_${i}`] = "Name is required";
    });
    if (!arrivalWave) errs.arrival = "Select an arrival option";
    if (arrivalWave === "none" && !arrivalPlan) errs.arrivalPlan = "Let us know your plan";
    if (!departureWave) errs.departure = "Select a departure option";
    if (departureWave === "none" && !departurePlan) errs.departurePlan = "Let us know your plan";

    if (arrivalWave === "wave_1" || arrivalWave === "wave_2") {
      if (partySize > remaining("arrival", arrivalWave)) errs.arrival = NOT_ENOUGH_SPOTS_ERROR;
    }
    if (departureWave === "wave_1" || departureWave === "wave_2") {
      if (partySize > remaining("departure", departureWave)) errs.departure = NOT_ENOUGH_SPOTS_ERROR;
    }

    setErrors(errs);

    if (Object.keys(errs).length > 0) {
      const order = ["email", ...names.map((_, i) => `name_${i}`), "arrival", "arrivalPlan", "departure", "departurePlan"];
      const firstKey = order.find((k) => errs[k]);
      if (firstKey) {
        document.getElementById(`field-${firstKey}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }

    return Object.keys(errs).length === 0;
  };

  const PASSPORT_URL_TTL_SECONDS = 60 * 60 * 24 * 7;

  const syncToAppsScript = async (payload: {
    email: string;
    partySize: number;
    names: string[];
    arrivalShuttle: string;
    arrivalPlan: string | null;
    departureShuttle: string;
    departurePlan: string | null;
    passportUploaded: boolean;
    passportFiles: { fileName: string; path: string; url: string | null }[];
    florenceRsvp: string | null;
    travelPlans: string;
  }) => {
    try {
      const { error } = await supabase.functions.invoke("shuttle-sheet", { body: payload });
      if (error) console.error("shuttle-sheet sync failed:", error);
    } catch (err) {
      console.error("shuttle-sheet sync failed:", err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);

    const trimmedNames = names.map((n) => n.trim());

    const bookingId = crypto.randomUUID();
    const passportPaths: string[] = [];
    const uploadedPassportFiles: { fileName: string; path: string }[] = [];

    for (let i = 0; i < passportFiles.length; i++) {
      const file = passportFiles[i];
      if (!file) continue;
      const ext = file.name.includes(".") ? file.name.split(".").pop() : "";
      const path = `${bookingId}/${slugify(trimmedNames[i] ?? `guest-${i + 1}`)}${ext ? `.${ext}` : ""}`;
      const { error: uploadError } = await supabase.storage.from("passports").upload(path, file);
      if (uploadError) {
        toast.error("Could not upload passport file. Please try again.");
        setSubmitting(false);
        return;
      }
      passportPaths.push(path);
      uploadedPassportFiles.push({ fileName: file.name, path });
    }

    const { data, error } = await supabase.rpc("book_shuttle", {
      _full_name: trimmedNames[0],
      _party_size: partySize,
      _arrival_wave: arrivalWave,
      _departure_wave: departureWave,
      _whatsapp_optin: false,
      _travel_details: travelPlans.trim() || null,
      _email: email.trim(),
      _passport_paths: passportPaths,
      _departure_plan: departurePlan || null,
      _florence_rsvp: florenceRsvp || null,
      _arrival_plan: arrivalPlan || null,
      _guest_names: trimmedNames,
    });

    if (error) {
      toast.error(error.message.toLowerCase().includes("full") ? error.message : NOT_ENOUGH_SPOTS_ERROR);
      setSubmitting(false);
      loadSeatsUsed();
      return;
    }

    const passportFilesForSync: { fileName: string; path: string; url: string | null }[] = await Promise.all(
      uploadedPassportFiles.map(async ({ fileName, path }) => {
        const { data: signedData } = await supabase.storage
          .from("passports")
          .createSignedUrl(path, PASSPORT_URL_TTL_SECONDS);
        return { fileName, path, url: signedData?.signedUrl ?? null };
      })
    );

    await syncToAppsScript({
      email: email.trim(),
      partySize,
      names: trimmedNames,
      arrivalShuttle: arrivalWave === "wave_1" ? "arr1" : arrivalWave === "wave_2" ? "arr2" : "arr_none",
      arrivalPlan: arrivalPlan || null,
      departureShuttle: departureWave === "wave_1" ? "dep1" : departureWave === "wave_2" ? "dep2" : "dep_none",
      departurePlan: departurePlan || null,
      passportUploaded: passportPaths.length > 0,
      passportFiles: passportFilesForSync,
      florenceRsvp: florenceRsvp || null,
      travelPlans: travelPlans.trim(),
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
            <h1 className="heading-section mb-4">Travel Confirmed</h1>
            <div className="w-12 h-px bg-primary mx-auto mb-8" />
            <p className="body-editorial mx-auto text-balance max-w-none">
              We've got your details. If anything changes, fill out the form again or email us at{" "}
              <a href="mailto:nicoleandtylersitalianwedding@gmail.com" className="underline text-primary">
                nicoleandtylersitalianwedding@gmail.com
              </a>
              .
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
          <h1 className="heading-section text-center mb-4">Confirm Your Travel</h1>
          <div className="w-12 h-px bg-primary mx-auto mb-12" />
        </FadeIn>

        <FadeIn delay={100}>
          <form onSubmit={handleSubmit} className="space-y-10">
            {/* Guest Info */}
            <div className="space-y-6">
              <div id="field-email" className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@email.com"
                />
                <FieldError message={errors.email} />
              </div>

              <div className="space-y-2">
                <Label>Party Size</Label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => handlePartySizeChange(n)}
                      className={`w-11 h-11 flex items-center justify-center rounded-md border font-body text-base transition-all ${
                        partySize === n
                          ? "border-sage bg-sage text-white font-medium"
                          : "border-input bg-background hover:bg-muted/50"
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              {names.map((name, index) => (
                <div key={index} id={`field-name_${index}`} className="space-y-2 animate-in fade-in slide-in-from-top-1 duration-200">
                  <Label htmlFor={`name-${index}`}>{names.length === 1 ? "Full Name" : `Guest ${index + 1} Full Name`}</Label>
                  <Input
                    id={`name-${index}`}
                    value={name}
                    onChange={(e) => handleNameChange(index, e.target.value)}
                    placeholder="First and last name"
                  />
                  <FieldError message={errors[`name_${index}`]} />
                </div>
              ))}
            </div>

            <div className="w-full h-px bg-border" />

            {/* Transportation Details */}
            <div className="space-y-6">
              <h2 className="font-serif text-xl text-foreground">Transportation Details</h2>
              <div className="space-y-4">
                <p className="body-editorial mx-auto text-balance max-w-none">
                  We have arranged a complimentary shuttle service between the Siena train station and Borgo
                  Laticastelli on September 16th and September 19th. The trip takes approximately 25 to 35 minutes.
                </p>
                <p className="body-editorial mx-auto text-balance max-w-none">
                  Check local train schedules and purchase your tickets before reserving a shuttle spot below. Each
                  time slot is capped by vehicle size and cannot accommodate additional guests once it is filled.
                </p>
                <p className="body-editorial mx-auto text-balance max-w-none font-semibold text-foreground">
                  Timing in Italy tends to run loose so pickups and drop-offs may shift by 15 to 30 minutes. We
                  can't guarantee exact timing so give yourself a generous buffer when booking a return shuttle for
                  a departing train.
                </p>
                <p className="body-editorial mx-auto text-balance max-w-none">
                  Public transit and taxis are hard to come by in the Tuscan countryside. If your travel window
                  doesn't line up with our shuttle times, we recommend renting a car or booking a private transfer
                  in advance.
                </p>
                <p className="font-body text-sm text-muted-foreground">
                  You can email{" "}
                  <a href="mailto:nicoleandtylersitalianwedding@gmail.com" className="text-primary underline">
                    nicoleandtylersitalianwedding@gmail.com
                  </a>{" "}
                  to be connected with our wedding coordinator, who can share local resources or book a private
                  transfer on your behalf.
                </p>
              </div>

              <div id="field-arrival" className="space-y-3">
                <h3 className="font-body text-sm font-semibold text-foreground">
                  Arrival Shuttle <span className="text-destructive">*</span>
                </h3>
                <p className="font-body text-xs text-muted-foreground">September 16 · Siena → Borgo Laticastelli</p>
                <div className="flex flex-col gap-3">
                  {ARRIVAL_WAVES.map((w) => {
                    const isWave = w.value === "wave_1" || w.value === "wave_2";
                    const spotsLeft = isWave ? remaining("arrival", w.value) : null;
                    return (
                      <ShuttleOptionCard
                        key={w.value}
                        label={w.label}
                        detail={w.detail}
                        spotsLeft={spotsLeft}
                        disabled={isWave && spotsLeft === 0}
                        selected={arrivalWave === w.value}
                        onSelect={() => {
                          setArrivalWave(w.value);
                          if (w.value !== "none") setArrivalPlan("");
                        }}
                      />
                    );
                  })}
                </div>
                <FieldError message={errors.arrival} />
              </div>

              {arrivalWave === "none" && (
                <div id="field-arrivalPlan" className="p-5 border border-border rounded-md bg-muted/30 space-y-3">
                  <Label>
                    What's your plan for getting there? <span className="text-destructive">*</span>
                  </Label>
                  <div className="flex flex-wrap gap-2.5">
                    {ARRIVAL_PLANS.map((p) => (
                      <PillOption
                        key={p.value}
                        label={p.label}
                        selected={arrivalPlan === p.value}
                        onSelect={() => setArrivalPlan(p.value)}
                      />
                    ))}
                  </div>
                  <FieldError message={errors.arrivalPlan} />
                </div>
              )}

              <div id="field-departure" className="space-y-3">
                <h3 className="font-body text-sm font-semibold text-foreground">
                  Departure Shuttle (Check-out is 12 PM) <span className="text-destructive">*</span>
                </h3>
                <p className="font-body text-xs text-muted-foreground">September 19 · Borgo Laticastelli → Siena</p>
                <div className="flex flex-col gap-3">
                  {DEPARTURE_WAVES.map((w) => {
                    const isWave = w.value === "wave_1" || w.value === "wave_2";
                    const spotsLeft = isWave ? remaining("departure", w.value) : null;
                    return (
                      <ShuttleOptionCard
                        key={w.value}
                        label={w.label}
                        detail={w.detail}
                        spotsLeft={spotsLeft}
                        disabled={isWave && spotsLeft === 0}
                        selected={departureWave === w.value}
                        onSelect={() => {
                          setDepartureWave(w.value);
                          if (w.value !== "none") setDeparturePlan("");
                        }}
                      />
                    );
                  })}
                </div>
                <FieldError message={errors.departure} />
              </div>

              {departureWave === "none" && (
                <div id="field-departurePlan" className="p-5 border border-border rounded-md bg-muted/30 space-y-3">
                  <Label>
                    What's your plan for getting back? <span className="text-destructive">*</span>
                  </Label>
                  <div className="flex flex-wrap gap-2.5">
                    {DEPARTURE_PLANS.map((p) => (
                      <PillOption
                        key={p.value}
                        label={p.label}
                        selected={departurePlan === p.value}
                        onSelect={() => setDeparturePlan(p.value)}
                      />
                    ))}
                  </div>
                  <FieldError message={errors.departurePlan} />
                </div>
              )}
            </div>

            <div className="w-full h-px bg-border" />

            {/* Passport */}
            <div className="space-y-3">
              <div className="flex items-baseline gap-2">
                <h2 className="font-serif text-xl text-foreground">Passport</h2>
                <span className="font-body text-xs italic text-muted-foreground">Optional</span>
              </div>
              <p className="font-body text-sm text-muted-foreground">
                Properties in Italy require passport copies for all guests prior to arrival. Upload a photo or scan
                for each guest to expedite check-in, or send them directly to Nicole or Tyler.
              </p>
              <div className="space-y-2">
                {passportFiles.map((file, index) => (
                  <div key={index} className="space-y-1">
                    {names.length > 1 && (
                      <Label className="text-xs text-muted-foreground">
                        {names[index]?.trim() || `Guest ${index + 1}`}
                      </Label>
                    )}
                    <div className="flex items-center gap-2">
                      <input
                        ref={(el) => (fileRefs.current[index] = el)}
                        type="file"
                        accept="image/*,.pdf"
                        className="hidden"
                        onChange={(e) => handlePassportFileChange(index, e.target.files?.[0] ?? null)}
                      />
                      <button
                        type="button"
                        onClick={() => fileRefs.current[index]?.click()}
                        className="inline-flex items-center gap-2 px-4 py-2.5 border border-border rounded-md font-body text-sm text-foreground hover:bg-muted/50 transition-colors"
                      >
                        {file ? file.name : "Upload passport photo or scan"}
                      </button>
                      {file && (
                        <button
                          type="button"
                          onClick={() => handleRemovePassportFile(index)}
                          aria-label="Remove uploaded passport file"
                          className="inline-flex items-center justify-center w-8 h-8 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="w-full h-px bg-border" />

            {/* Pre-Event Activities */}
            <div className="space-y-3">
              <div className="flex items-baseline gap-2">
                <h2 className="font-serif text-xl text-foreground">Pre-Event Activities</h2>
                <span className="font-body text-xs italic text-muted-foreground">Optional</span>
              </div>
              <p className="body-editorial mx-auto text-balance max-w-none">
                Arriving early? We're planning an informal gathering in Florence on Tuesday night, September 15th.
                Details are coming, but let us know if you'll be around and want to join.
              </p>
              <p className="font-body text-sm text-muted-foreground">
                To stay in the loop and connected before and during the Italy trip, join our travel WhatsApp group.
              </p>
              <a
                href={WHATSAPP_GROUP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-3 bg-sage text-white font-body text-sm font-semibold rounded-md hover:opacity-90 transition-opacity"
              >
                Join the WhatsApp Group
              </a>
              <div className="space-y-2 pt-1">
                <Label>Will you be in Florence on September 15th?</Label>
                <div className="flex flex-wrap gap-2.5">
                  {FLORENCE_OPTIONS.map((opt) => (
                    <PillOption
                      key={opt.value}
                      label={opt.value}
                      selected={florenceRsvp === opt.value}
                      onSelect={() => setFlorenceRsvp(opt.value)}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Travel Coordination */}
            <div className="space-y-2">
              <Label htmlFor="travelPlans">Your travel plans (dates, cities, rental car interest, etc.)</Label>
              <Textarea
                id="travelPlans"
                value={travelPlans}
                onChange={(e) => setTravelPlans(e.target.value)}
                placeholder="Share your rough plans to help coordinate with other guests"
                rows={4}
              />
            </div>

            <div className="flex justify-center">
              <button
                type="submit"
                disabled={submitting}
                className="relative inline-block w-full max-w-xs py-4 font-body text-xs uppercase tracking-[0.25em] transition-opacity disabled:pointer-events-none overflow-hidden border border-primary"
              >
                {submitting && (
                  <div
                    className="absolute inset-0 bg-primary animate-[progress_4s_ease-in-out_forwards]"
                    style={{ transformOrigin: "left" }}
                  />
                )}
                <span className={`relative z-10 ${submitting ? "text-white" : "text-primary-foreground"}`}>
                  {submitting ? "Submitting..." : "Submit"}
                </span>
                {!submitting && <div className="absolute inset-0 bg-primary -z-0" />}
              </button>
            </div>
          </form>
        </FadeIn>
      </section>
    </Layout>
  );
};

export default Shuttle;
