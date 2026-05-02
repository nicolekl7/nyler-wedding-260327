import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface RoomCategory {
  id: string;
  name: string;
  inventory_count: number;
  price: number;
}

interface Booking {
  id: string;
  room_category_id: string;
  guest_names: string;
  email: string;
  reserved_at: string;
  payment_status: string;
  is_released: boolean;
}

const HOLD_HOURS = 48;
const SESSION_KEY = "admin_unlocked_at";
const SESSION_TTL_MS = 1000 * 60 * 60 * 4; // 4 hours

const AdminReservations = () => {
  const [unlocked, setUnlocked] = useState(false);
  const [password, setPassword] = useState("");
  const [authenticating, setAuthenticating] = useState(false);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [categories, setCategories] = useState<RoomCategory[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const ts = localStorage.getItem(SESSION_KEY);
    if (ts && Date.now() - Number(ts) < SESSION_TTL_MS) {
      setUnlocked(true);
    }
  }, []);

  useEffect(() => {
    if (unlocked) loadData();
  }, [unlocked]);

  const loadData = async () => {
    setLoading(true);
    const [{ data: bookingsData }, { data: catsData }] = await Promise.all([
      supabase
        .from("room_bookings")
        .select("*")
        .eq("is_released", false)
        .order("reserved_at", { ascending: false }),
      supabase.from("room_categories").select("id, name, inventory_count, price"),
    ]);
    setBookings((bookingsData ?? []) as Booking[]);
    setCategories((catsData ?? []) as RoomCategory[]);
    setLoading(false);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthenticating(true);
    try {
      const { data, error } = await supabase.functions.invoke(
        "verify-admin-password",
        { body: { password } }
      );
      if (error || !data?.ok) {
        toast.error("Incorrect password");
        setAuthenticating(false);
        return;
      }
      localStorage.setItem(SESSION_KEY, String(Date.now()));
      setUnlocked(true);
    } catch {
      toast.error("Could not verify password");
    }
    setAuthenticating(false);
  };

  const markPaid = async (b: Booking) => {
    const { error } = await supabase
      .from("room_bookings")
      .update({ payment_status: "paid" })
      .eq("id", b.id);
    if (error) {
      toast.error("Failed to mark paid");
      return;
    }
    toast.success("Marked as paid");
    loadData();
  };

  const releaseRoom = async (b: Booking) => {
    if (!confirm(`Release this ${roomName(b.room_category_id)} reservation? Inventory will be returned.`))
      return;

    const cat = categories.find((c) => c.id === b.room_category_id);
    if (cat) {
      await supabase
        .from("room_categories")
        .update({ inventory_count: cat.inventory_count + 1 })
        .eq("id", cat.id);
    }
    const { error } = await supabase
      .from("room_bookings")
      .update({ is_released: true })
      .eq("id", b.id);
    if (error) {
      toast.error("Failed to release");
      return;
    }
    toast.success("Reservation released");
    loadData();
  };

  const logOut = () => {
    localStorage.removeItem(SESSION_KEY);
    setUnlocked(false);
    setPassword("");
  };

  const roomName = (id: string) =>
    categories.find((c) => c.id === id)?.name ?? "—";

  const isExpired = (b: Booking) => {
    if (b.payment_status === "paid") return false;
    const reserved = new Date(b.reserved_at).getTime();
    return Date.now() - reserved > HOLD_HOURS * 60 * 60 * 1000;
  };

  const sortedBookings = [...bookings].sort((a, b) => {
    if (a.payment_status !== b.payment_status) {
      return a.payment_status === "unpaid" ? -1 : 1;
    }
    return new Date(b.reserved_at).getTime() - new Date(a.reserved_at).getTime();
  });

  if (!unlocked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
        <form
          onSubmit={handleLogin}
          className="w-full max-w-sm border border-border bg-card p-8 space-y-5"
        >
          <h1 className="font-serif text-2xl text-foreground">Admin Access</h1>
          <p className="font-body text-sm text-muted-foreground">
            Enter the admin password to view reservations.
          </p>
          <input
            type="password"
            autoFocus
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full bg-transparent border-b border-border py-2 font-body text-foreground focus:outline-none focus:border-primary transition-colors"
          />
          <button
            type="submit"
            disabled={authenticating || !password}
            className="w-full py-3 bg-primary text-primary-foreground font-body text-xs uppercase tracking-[0.25em] hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {authenticating ? "Verifying..." : "Enter"}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6 md:p-10">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-serif text-3xl text-foreground">Reservations</h1>
            <p className="font-body text-sm text-muted-foreground mt-1">
              Manage room bookings and payment status
            </p>
          </div>
          <button
            onClick={logOut}
            className="font-body text-xs uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground transition-colors"
          >
            Log out
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-10">
          {categories.map((c) => (
            <div key={c.id} className="border border-border p-3">
              <p className="font-body text-[10px] uppercase tracking-widest text-muted-foreground">
                {c.name}
              </p>
              <p className="font-serif text-xl text-foreground mt-1">
                {c.inventory_count} <span className="text-xs text-muted-foreground">left</span>
              </p>
            </div>
          ))}
        </div>

        {loading ? (
          <p className="font-body text-muted-foreground">Loading…</p>
        ) : sortedBookings.length === 0 ? (
          <p className="font-body text-muted-foreground">No active reservations.</p>
        ) : (
          <div className="overflow-x-auto border border-border">
            <table className="w-full font-body text-sm">
              <thead className="bg-muted/50 border-b border-border">
                <tr className="text-left">
                  <th className="px-4 py-3 font-medium text-foreground">Guest(s)</th>
                  <th className="px-4 py-3 font-medium text-foreground">Room</th>
                  <th className="px-4 py-3 font-medium text-foreground">Reserved</th>
                  <th className="px-4 py-3 font-medium text-foreground">Status</th>
                  <th className="px-4 py-3 font-medium text-foreground text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sortedBookings.map((b) => {
                  const expired = isExpired(b);
                  return (
                    <tr
                      key={b.id}
                      className={`border-b border-border last:border-b-0 ${
                        expired ? "bg-red-50" : ""
                      }`}
                    >
                      <td className="px-4 py-3 align-top">
                        <div className="text-foreground">{b.guest_names}</div>
                        {b.email && (
                          <div className="text-xs text-muted-foreground mt-0.5">{b.email}</div>
                        )}
                      </td>
                      <td className="px-4 py-3 align-top text-foreground">
                        {roomName(b.room_category_id)}
                      </td>
                      <td className="px-4 py-3 align-top text-muted-foreground">
                        {new Date(b.reserved_at).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 align-top">
                        {b.payment_status === "paid" ? (
                          <span className="inline-block px-2 py-0.5 text-xs uppercase tracking-widest bg-green-100 text-green-800 border border-green-300">
                            Paid
                          </span>
                        ) : expired ? (
                          <span className="inline-block px-2 py-0.5 text-xs uppercase tracking-widest bg-red-100 text-red-800 border border-red-300">
                            Expired (48h+)
                          </span>
                        ) : (
                          <span className="inline-block px-2 py-0.5 text-xs uppercase tracking-widest bg-amber-100 text-amber-800 border border-amber-300">
                            Unpaid
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 align-top text-right space-x-2 whitespace-nowrap">
                        {b.payment_status !== "paid" && (
                          <button
                            onClick={() => markPaid(b)}
                            className="px-3 py-1.5 text-xs uppercase tracking-widest border border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
                          >
                            Mark Paid
                          </button>
                        )}
                        <button
                          onClick={() => releaseRoom(b)}
                          className="px-3 py-1.5 text-xs uppercase tracking-widest border border-border text-muted-foreground hover:border-red-500 hover:text-red-600 transition-colors"
                        >
                          Release Room
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminReservations;
