import { useState, useEffect } from "react";
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

interface RoomCategory {
  id: string;
  name: string;
  description: string | null;
  capacity: number;
  price: number;
  inventory_count: number;
}

const AccommodationsV2 = () => {
  const [categories, setCategories] = useState<RoomCategory[]>([]);
  const [soloCategory, setSoloCategory] = useState<RoomCategory | null>(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<RoomCategory | null>(null);
  const [guestNames, setGuestNames] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCategories();
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
      toast.error("Please fill in all fields");
      return;
    }

    setSubmitting(true);

    const { data: check } = await supabase
      .from("room_categories")
      .select("inventory_count")
      .eq("id", selected.id)
      .single();

    if (!check || check.inventory_count <= 0) {
      toast.error("This room type just sold out. Please select another.");
      await fetchCategories();
      setSelected(null);
      setSubmitting(false);
      return;
    }

    const { error: updateError } = await supabase
      .from("room_categories")
      .update({ inventory_count: check.inventory_count - 1 })
      .eq("id", selected.id);

    if (updateError) {
      toast.error("Something went wrong. Please try again.");
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

    setSubmitting(false);

    if (bookingError) {
      toast.error("Something went wrong. Please try again.");
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
    if (cat.capacity === 1) return "1 Guest (Individual Bed)";
    if (cat.capacity === 2) return "Sleeps 2 Guests";
    if (cat.capacity === 3) return "Sleeps up to 3 Guests";
    return `Sleeps up to ${cat.capacity} Guests`;
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
                <span
                  className={`text-xs uppercase tracking-widest font-body whitespace-nowrap ml-4 ${
                    soldOut ? "text-muted-foreground" : "text-primary"
                  }`}
                >
                  {soldOut ? "Sold Out" : `${cat.inventory_count} left`}
                </span>
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
            {soldOut ? "Sold Out" : "Select This Room"}
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
            The Borgo Laticastelli Experience
          </h1>
          <div className="w-12 h-px bg-primary mx-auto mb-12" />
        </FadeIn>

        <FadeIn delay={100}>
          <div className="max-w-2xl mx-auto mb-16">
            <p className="body-editorial mx-auto text-center text-balance">
              We have reserved the entire Borgo Laticastelli estate exclusively for our guests. If
              you are staying on site with us, we are covering all your meals and drinks for all
              3 days—don't worry about spending any additional money once you arrive.
            </p>
            <p className="body-editorial mx-auto text-center mt-4 text-foreground font-normal">
              Please review the available rooms below and claim your space. Rooms are available on a
              first-come, first-served basis. Please note that a room is not reserved until the
              payment is received.
            </p>
          </div>
        </FadeIn>

        {loading ? (
          <div className="text-center">
            <p className="body-editorial">Loading rooms...</p>
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
              Reserve {selected?.name}
            </DialogTitle>
            <DialogDescription className="font-body text-muted-foreground">
              ${selected?.price.toLocaleString()} USD · {selected && capacityLabel(selected)}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-5 mt-2">
            <div>
              <label className="font-serif text-lg text-foreground block mb-1">
                Names of All Guests in This Room
              </label>
              <textarea
                value={guestNames}
                onChange={(e) => setGuestNames(e.target.value)}
                placeholder="First & Last Name of each guest, one per line"
                rows={1}
                className="w-full bg-transparent border-b border-border py-2 font-body text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary transition-colors resize-none"
                maxLength={500}
              />
            </div>

            <div>
              <label className="font-serif text-lg text-foreground block mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full bg-transparent border-b border-border py-2 font-body text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary transition-colors"
                maxLength={255}
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 bg-primary text-primary-foreground font-body text-xs uppercase tracking-[0.25em] hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {submitting ? "Reserving..." : "Claim This Room"}
            </button>
          </form>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default AccommodationsV2;
