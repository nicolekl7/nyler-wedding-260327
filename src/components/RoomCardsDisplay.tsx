import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import FadeIn from "@/components/FadeIn";

interface RoomCategory {
  id: string;
  name: string;
  description: string | null;
  capacity: number;
  price: number;
  inventory_count: number;
}

interface Props {
  selectedAccommodation: string;
  onSelectAccommodation: (name: string) => void;
  formRef?: React.RefObject<HTMLDivElement | null>;
}

const RoomCardsDisplay = ({ selectedAccommodation, onSelectAccommodation, formRef }: Props) => {
  const [categories, setCategories] = useState<RoomCategory[]>([]);
  const [soloCategory, setSoloCategory] = useState<RoomCategory | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
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
    fetchData();
  }, []);

  const capacityLabel = (cat: RoomCategory) => {
    if (cat.capacity === 1) return "1 Guest (Individual Bed)";
    if (cat.capacity === 2) return "Sleeps 2 Guests";
    if (cat.capacity === 3) return "Sleeps up to 3 Guests";
    return `Sleeps up to ${cat.capacity} Guests`;
  };

  const capacityNote = (cat: RoomCategory) => {
    if (cat.capacity === 3) {
      return "An additional bed may be available upon request, accommodating up to 3 guests. Please reach out to confirm availability for your specific room.";
    }
    if (cat.name === "Luxury Suite") {
      return "Includes a sofa bed accommodating up to 2 additional guests.";
    }
    if (cat.name === "Junior Suite") {
      return "Includes a sofa bed or two additional single beds accommodating up to 2 additional guests.";
    }
    return null;
  };

  const handleSelect = (name: string) => {
    onSelectAccommodation(name);
    if (formRef?.current) {
      setTimeout(() => {
        formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    }
  };

  const renderCard = (cat: RoomCategory, featured = false, delay = 0) => {
    const isSolo = cat.name === "Solo Guest Estate Pass";
    const soldOut = !isSolo && cat.inventory_count <= 0;
    const isSelected = selectedAccommodation === cat.name;

    return (
      <FadeIn key={cat.id} delay={delay}>
        <button
          type="button"
          disabled={soldOut}
          onClick={() => !soldOut && handleSelect(cat.name)}
          className={`border p-6 flex flex-col justify-between h-full w-full text-left transition-all duration-300 ${
            featured ? "md:col-span-2" : ""
          } ${
            isSelected
              ? "border-2 border-primary bg-primary/[0.04] shadow-lg shadow-primary/10"
              : soldOut
              ? "opacity-50 grayscale border-border bg-muted cursor-not-allowed"
              : "border-border hover:border-primary/50 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/5 cursor-pointer"
          }`}
        >
          <div>
            <div className="flex items-start justify-between mb-1">
              <h3 className="font-serif text-lg text-foreground">{cat.name}</h3>
              {!isSolo && (
                soldOut ? (
                  <span className="text-xs uppercase tracking-widest font-body whitespace-nowrap ml-4 text-muted-foreground">
                    Sold Out
                  </span>
                ) : cat.inventory_count <= 3 ? (
                  <span className="text-xs uppercase tracking-widest font-body whitespace-nowrap ml-4 px-2 py-0.5 bg-amber-100 text-amber-800 border border-amber-300">
                    Only {cat.inventory_count} Left
                  </span>
                ) : (
                  <span className="text-xs uppercase tracking-widest font-body whitespace-nowrap ml-4 text-primary">
                    {cat.inventory_count} left
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
            {capacityNote(cat) && (
              <p className="font-body text-xs text-muted-foreground/70 mt-1 italic">
                {capacityNote(cat)}
              </p>
            )}
            <p className="font-serif text-lg text-foreground mt-3">
              ${cat.price.toLocaleString()} USD
            </p>
          </div>

          <div
            className={`mt-5 w-full py-2.5 text-center font-body text-xs uppercase tracking-[0.25em] transition-all duration-200 ${
              isSelected
                ? "bg-primary text-primary-foreground"
                : soldOut
                ? "bg-muted text-muted-foreground"
                : "border border-border text-muted-foreground hover:border-primary hover:text-foreground"
            }`}
          >
            {soldOut ? "Sold Out" : isSelected ? "Selected" : "Select"}
          </div>
        </button>
      </FadeIn>
    );
  };

  const notOnsiteSelected = selectedAccommodation === "Not Staying Onsite";

  const renderAltCard = (name: string, title: string, description: string, delay = 0) => {
    const isSelected = selectedAccommodation === name;
    return (
      <FadeIn key={name} delay={delay}>
        <button
          type="button"
          onClick={() => handleSelect(name)}
          className={`w-full text-left p-6 flex flex-col justify-between h-full transition-all duration-300 ${
            isSelected
              ? "border-2 border-primary border-solid bg-primary/[0.04] shadow-lg shadow-primary/10"
              : "border border-dashed border-border/70 hover:border-primary/50 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/5 cursor-pointer"
          }`}
        >
          <div>
            <h3 className="font-serif text-lg text-foreground mb-1">{title}</h3>
            <p className="font-body text-sm text-muted-foreground font-light">{description}</p>
          </div>
          <div
            className={`mt-5 w-full py-2.5 text-center font-body text-xs uppercase tracking-[0.25em] transition-all duration-200 ${
              isSelected
                ? "bg-primary text-primary-foreground"
                : "border border-border text-muted-foreground hover:border-primary hover:text-foreground"
            }`}
          >
            {isSelected ? "Selected" : "Select"}
          </div>
        </button>
      </FadeIn>
    );
  };

  if (loading) {
    return (
      <div className="text-center">
        <p className="body-editorial">Loading rooms...</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Not Staying Onsite card */}
      <FadeIn delay={100}>
        <button
          type="button"
          onClick={() => handleSelect("Not Staying Onsite")}
          className={`w-full text-left border p-6 transition-all duration-300 ${
            notOnsiteSelected
              ? "border-2 border-primary bg-primary/[0.04] shadow-lg shadow-primary/10"
              : "border-border hover:border-primary/50 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/5 cursor-pointer"
          }`}
        >
          <h3 className="font-serif text-lg text-foreground mb-1">Not Staying Onsite</h3>
          <p className="font-body text-sm text-muted-foreground font-light">
            For guests who prefer to make their own travel arrangements and stay off the estate.
          </p>
          <div
            className={`mt-5 w-full py-2.5 text-center font-body text-xs uppercase tracking-[0.25em] transition-all duration-200 ${
              notOnsiteSelected
                ? "bg-primary text-primary-foreground"
                : "border border-border text-muted-foreground hover:border-primary hover:text-foreground"
            }`}
          >
            {notOnsiteSelected ? "Selected" : "Select"}
          </div>
        </button>
      </FadeIn>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {soloCategory && renderCard(soloCategory, true, 150)}
        {categories.map((cat, i) => renderCard(cat, false, 200 + i * 60))}
        {renderAltCard("Joining a Reserved Room", "Joining a Reserved Room", "Only choose this if a friend or family member has already reserved and paid for the room you'll be staying in. No payment needed.", 300)}
        {renderAltCard("Choosing Room Later", "Not Ready to Pick a Room Yet", "Lock in your RSVP now and choose your room later. We'll send a friendly reminder — but rooms go fast, so don't wait too long.", 340)}
      </div>
    </div>
  );
};

export default RoomCardsDisplay;
