import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/Layout";
import FadeIn from "@/components/FadeIn";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useLanguage } from "@/contexts/LanguageContext";

interface RoomCategory {
  id: string;
  name: string;
  description: string | null;
  capacity: number;
  price: number;
  inventory_count: number;
}

const strings = {
  en: {
    heading: "The Borgo Laticastelli Experience",
    intro1: "We have reserved the entire Borgo Laticastelli estate exclusively for our guests. If you are staying on site with us, we are covering all your meals and drinks for all 3 days—don't worry about spending any additional money once you arrive.",
    intro2: "Please review the available rooms below and claim your space. Rooms are available on a first-come, first-served basis. Please note that a room is not reserved until the payment is received.",
    loading: "Loading rooms...",
    soldOut: "Sold Out",
    left: (n: number) => `${n} left`,
    selectRoom: "Select This Room",
    reserveTitle: (name: string) => `Reserve ${name}`,
    guestNamesLabel: "Names of All Guests in This Room",
    guestNamesPlaceholder: "First & Last Name of each guest, one per line",
    emailLabel: "Email Address",
    emailPlaceholder: "your@email.com",
    reserving: "Reserving...",
    claimRoom: "Claim This Room",
    capacity1: "1 Guest (Individual Bed)",
    capacity2: "Sleeps 2 Guests",
    capacity3: "Sleeps up to 3 Guests",
    capacityN: (n: number) => `Sleeps up to ${n} Guests`,
    errorFillAll: "Please fill in all fields",
    errorSoldOut: "This room type just sold out. Please select another.",
    errorGeneric: "Something went wrong. Please try again.",
  },
  pl: {
    heading: "Doświadczenie Borgo Laticastelli",
    intro1: "Zarezerwowaliśmy całą posiadłość Borgo Laticastelli wyłącznie dla naszych gości. Jeśli będziesz mieszkać z nami na miejscu, pokrywamy wszystkie Twoje posiłki i napoje przez całe 3 dni — nie martw się o dodatkowe wydatki po przyjeździe.",
    intro2: "Zapoznaj się z dostępnymi pokojami poniżej i zarezerwuj swoje miejsce. Pokoje są dostępne na zasadzie pierwszeństwa zgłoszeń. Pamiętaj, że pokój jest zarezerwowany dopiero po otrzymaniu płatności.",
    loading: "Ładowanie pokoi...",
    soldOut: "Wyprzedane",
    left: (n: number) => `pozostało ${n}`,
    selectRoom: "Wybierz ten pokój",
    reserveTitle: (name: string) => `Zarezerwuj ${name}`,
    guestNamesLabel: "Imiona wszystkich gości w pokoju",
    guestNamesPlaceholder: "Imię i Nazwisko każdego gościa, jedno na linię",
    emailLabel: "Adres e-mail",
    emailPlaceholder: "twoj@email.com",
    reserving: "Rezerwowanie...",
    claimRoom: "Zarezerwuj ten pokój",
    capacity1: "1 gość (osobne łóżko)",
    capacity2: "Dla 2 gości",
    capacity3: "Dla maksymalnie 3 gości",
    capacityN: (n: number) => `Dla maksymalnie ${n} gości`,
    errorFillAll: "Proszę wypełnić wszystkie pola",
    errorSoldOut: "Ten typ pokoju właśnie się wyprzedał. Wybierz inny.",
    errorGeneric: "Coś poszło nie tak. Spróbuj ponownie.",
  },
};

const AccommodationsV2 = () => {
  const [categories, setCategories] = useState<RoomCategory[]>([]);
  const [soloCategory, setSoloCategory] = useState<RoomCategory | null>(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<RoomCategory | null>(null);
  const [guestNames, setGuestNames] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const submittingRef = useRef(false);
  const navigate = useNavigate();
  const { language } = useLanguage();
  const t = strings[language];

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    const channel = supabase
      .channel("room-categories-realtime")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "room_categories" },
        () => { fetchCategories(); }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from("room_categories")
      .select("*")
      .order("price", { ascending: true });
    if (!error && data) {
      const solo = data.find((c) => c.name === "Solo Guest Estate Pass");
      const rest = data.filter((c) => c.name !== "Solo Guest Estate Pass");
      setSoloCategory(solo || null);
      setCategories(rest);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected || !guestNames.trim() || !email.trim()) {
      toast.error(t.errorFillAll);
      return;
    }

    if (submittingRef.current) return;
    submittingRef.current = true;
    setSubmitting(true);

    const { data: check } = await supabase
      .from("room_categories")
      .select("inventory_count")
      .eq("id", selected.id)
      .single();

    if (!check || check.inventory_count <= 0) {
      toast.error(t.errorSoldOut);
      await fetchCategories();
      setSelected(null);
      submittingRef.current = false;
      setSubmitting(false);
      return;
    }

    const { error: updateError } = await supabase
      .from("room_categories")
      .update({ inventory_count: check.inventory_count - 1 })
      .eq("id", selected.id);

    if (updateError) {
      toast.error(t.errorGeneric);
      submittingRef.current = false;
      setSubmitting(false);
      return;
    }

    const { error: bookingError } = await supabase
      .from("room_bookings")
      .insert({
        room_category_id: selected.id,
        guest_names: guestNames.trim(),
        email: email.trim(),
        has_children: false,
      });

    submittingRef.current = false;
    setSubmitting(false);

    if (bookingError) {
      toast.error(t.errorGeneric);
      return;
    }

    navigate("/booking-success", {
      state: {
        roomName: selected.name,
        price: selected.price,
      },
    });
  };

  const capacityLabel = (cat: RoomCategory) => {
    if (cat.capacity === 1) return t.capacity1;
    if (cat.capacity === 2) return t.capacity2;
    if (cat.capacity === 3) return t.capacity3;
    return t.capacityN(cat.capacity);
  };

  const renderCard = (cat: RoomCategory, featured = false, delay = 0) => {
    const soldOut = cat.inventory_count <= 0;
    return (
      <FadeIn key={cat.id} delay={delay}>
        <div
          className={`border p-6 flex flex-col justify-between h-full transition-all duration-300 ${
            featured ? "md:col-span-2 border-primary/30 bg-primary/[0.02]" : ""
          } ${
            soldOut
              ? "opacity-40 border-border bg-muted"
              : "border-border hover:border-primary/50 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/5"
          }`}
        >
          <div>
            <div className="flex items-start justify-between mb-1">
              <h3 className="font-serif text-lg text-foreground">{cat.name}</h3>
              {cat.name !== "Solo Guest Estate Pass" && (
                soldOut ? (
                  <span className="text-xs uppercase tracking-widest font-body whitespace-nowrap ml-4 text-muted-foreground">
                    {t.soldOut}
                  </span>
                ) : cat.inventory_count <= 3 ? (
                  <span className="text-xs uppercase tracking-widest font-body whitespace-nowrap ml-4 text-amber-600">
                    ! Only {cat.inventory_count} Left
                  </span>
                ) : (
                  <span className="text-xs uppercase tracking-widest font-body whitespace-nowrap ml-4 text-primary">
                    {t.left(cat.inventory_count)}
                  </span>
                )
              )}
            </div>
            {cat.description && (
              <p className="font-body text-sm text-muted-foreground font-light mb-2">
                {cat.description}
              </p>
            )}
            <p className="font-body text-sm text-muted-foreground">{capacityLabel(cat)}</p>
            <p className="font-serif text-lg text-foreground mt-3">
              ${cat.price.toLocaleString()} USD
            </p>
          </div>

          <button
            disabled={soldOut}
            onClick={() => {
              setSelected(cat);
              setGuestNames("");
              setEmail("");
            }}
            className="mt-5 w-full py-3 bg-primary text-primary-foreground font-body text-xs uppercase tracking-[0.25em] hover:opacity-90 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {soldOut ? t.soldOut : t.selectRoom}
          </button>
        </div>
      </FadeIn>
    );
  };

  return (
    <Layout>
      <section className="page-section w-[90%] max-w-[1400px] mx-auto">
        <FadeIn>
          <h1 className="heading-section text-center mb-4">
            {t.heading}
          </h1>
          <div className="w-12 h-px bg-primary mx-auto mb-12" />
        </FadeIn>

        <FadeIn delay={100}>
          <div className="max-w-2xl mx-auto mb-16">
            <p className="body-editorial mx-auto text-center text-balance">
              {t.intro1}
            </p>
            <p className="body-editorial mx-auto text-center mt-4 text-foreground font-normal">
              {t.intro2}
            </p>
          </div>
        </FadeIn>

        {loading ? (
          <div className="text-center">
            <p className="body-editorial">{t.loading}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {soloCategory && renderCard(soloCategory, true, 150)}
            {categories.map((cat, i) => renderCard(cat, false, 200 + i * 60))}
          </div>
        )}
      </section>

      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl">
              {selected && t.reserveTitle(selected.name)}
            </DialogTitle>
            <DialogDescription className="font-body text-muted-foreground">
              ${selected?.price.toLocaleString()} USD · {selected && capacityLabel(selected)}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-5 mt-2">
            <div>
              <label className="font-serif text-lg text-foreground block mb-1">
                {t.guestNamesLabel}
              </label>
              <textarea
                value={guestNames}
                onChange={(e) => setGuestNames(e.target.value)}
                placeholder={t.guestNamesPlaceholder}
                rows={1}
                className="w-full bg-transparent border-b border-border py-2 font-body text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary transition-colors resize-none"
                maxLength={500}
              />
            </div>

            <div>
              <label className="font-serif text-lg text-foreground block mb-1">{t.emailLabel}</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t.emailPlaceholder}
                className="w-full bg-transparent border-b border-border py-2 font-body text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary transition-colors"
                maxLength={255}
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 bg-primary text-primary-foreground font-body text-xs uppercase tracking-[0.25em] hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {submitting ? t.reserving : t.claimRoom}
            </button>
          </form>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default AccommodationsV2;
