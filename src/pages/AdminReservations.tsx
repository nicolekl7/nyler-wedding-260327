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
  grouped_room_id: string | null;
  grouped_room_category_id: string | null;
}

const HOLD_HOURS = 48;
const SESSION_KEY = "admin_unlocked_at";
const SESSION_TTL_MS = 1000 * 60 * 60 * 4; // 4 hours
const SOLO_NAME = "Solo Guest Estate Pass";

const AdminReservations = () => {
  const [unlocked, setUnlocked] = useState(false);
  const [password, setPassword] = useState("");
  const [authenticating, setAuthenticating] = useState(false);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [categories, setCategories] = useState<RoomCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedSoloIds, setSelectedSoloIds] = useState<Set<string>>(new Set());
  const [assignToCategoryId, setAssignToCategoryId] = useState<string>("");
  const [grouping, setGrouping] = useState(false);

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
    setSelectedSoloIds(new Set());
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

    // Increment inventory for the original room category
    const cat = categories.find((c) => c.id === b.room_category_id);
    if (cat) {
      await supabase
        .from("room_categories")
        .update({ inventory_count: cat.inventory_count + 1 })
        .eq("id", cat.id);
    }
    // If this booking is part of a group, also restore the assigned room's inventory once
    if (b.grouped_room_id && b.grouped_room_category_id) {
      // Only restore if this is the last/only booking in the group still active
      const groupSiblings = bookings.filter(
        (x) => x.grouped_room_id === b.grouped_room_id && x.id !== b.id
      );
      if (groupSiblings.length === 0) {
        const groupCat = categories.find((c) => c.id === b.grouped_room_category_id);
        if (groupCat) {
          await supabase
            .from("room_categories")
            .update({ inventory_count: groupCat.inventory_count + 1 })
            .eq("id", groupCat.id);
        }
      }
    }
    // Mark released
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

  const isSolo = (b: Booking) =>
    categories.find((c) => c.id === b.room_category_id)?.name === SOLO_NAME;

  const toggleSoloSelection = (id: string) => {
    setSelectedSoloIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const groupSelectedIntoRoom = async () => {
    if (!assignToCategoryId || selectedSoloIds.size === 0) return;
    const targetCat = categories.find((c) => c.id === assignToCategoryId);
    if (!targetCat) return;
    if (targetCat.inventory_count <= 0) {
      toast.error(`${targetCat.name} is sold out — no inventory to assign.`);
      return;
    }

    setGrouping(true);
    const groupId = crypto.randomUUID();
    const ids = Array.from(selectedSoloIds);

    // Decrement target room inventory by 1
    const { error: invErr } = await supabase
      .from("room_categories")
      .update({ inventory_count: targetCat.inventory_count - 1 })
      .eq("id", targetCat.id);
    if (invErr) {
      toast.error("Failed to update inventory");
      setGrouping(false);
      return;
    }

    // Tag all selected solo bookings with the group + target category
    const { error: updErr } = await supabase
      .from("room_bookings")
      .update({
        grouped_room_id: groupId,
        grouped_room_category_id: targetCat.id,
      })
      .in("id", ids);

    if (updErr) {
      // Roll inventory back
      await supabase
        .from("room_categories")
        .update({ inventory_count: targetCat.inventory_count })
        .eq("id", targetCat.id);
      toast.error("Failed to group bookings");
      setGrouping(false);
      return;
    }

    toast.success(`Grouped ${ids.length} solos into a ${targetCat.name}`);
    setAssignToCategoryId("");
    setGrouping(false);
    loadData();
  };

  const ungroup = async (groupId: string) => {
    const groupBookings = bookings.filter((b) => b.grouped_room_id === groupId);
    if (groupBookings.length === 0) return;
    const targetCatId = groupBookings[0].grouped_room_category_id;
    if (!confirm(`Ungroup ${groupBookings.length} solo bookings? The assigned room will be returned to inventory.`))
      return;

    // Restore inventory
    if (targetCatId) {
      const targetCat = categories.find((c) => c.id === targetCatId);
      if (targetCat) {
        await supabase
          .from("room_categories")
          .update({ inventory_count: targetCat.inventory_count + 1 })
          .eq("id", targetCat.id);
      }
    }
    // Clear grouping fields
    const { error } = await supabase
      .from("room_bookings")
      .update({ grouped_room_id: null, grouped_room_category_id: null })
      .eq("grouped_room_id", groupId);
    if (error) {
      toast.error("Failed to ungroup");
      return;
    }
    toast.success("Ungrouped");
    loadData();
  };

  // Sort: unpaid first, then by reserved_at desc
  const sortedBookings = [...bookings].sort((a, b) => {
    if (a.payment_status !== b.payment_status) {
      return a.payment_status === "unpaid" ? -1 : 1;
    }
    return new Date(b.reserved_at).getTime() - new Date(a.reserved_at).getTime();
  });

  // Selected solos that are NOT already in a group
  const eligibleSelectedCount = Array.from(selectedSoloIds).filter((id) => {
    const b = bookings.find((x) => x.id === id);
    return b && !b.grouped_room_id;
  }).length;

  // Group bookings by grouped_room_id for display
  const groupSummaries = Object.values(
    bookings
      .filter((b) => b.grouped_room_id)
      .reduce<Record<string, { groupId: string; categoryId: string | null; bookings: Booking[] }>>(
        (acc, b) => {
          const gid = b.grouped_room_id!;
          if (!acc[gid])
            acc[gid] = { groupId: gid, categoryId: b.grouped_room_category_id, bookings: [] };
          acc[gid].bookings.push(b);
          return acc;
        },
        {}
      )
  );

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

        {/* Inventory snapshot */}
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

        {/* Existing groups */}
        {groupSummaries.length > 0 && (
          <div className="mb-10">
            <h2 className="font-serif text-xl text-foreground mb-3">Solo Groups</h2>
            <div className="space-y-3">
              {groupSummaries.map((g) => (
                <div key={g.groupId} className="border border-border p-4 bg-muted/30">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-body text-xs uppercase tracking-widest text-muted-foreground mb-1">
                        Assigned to {g.categoryId ? roomName(g.categoryId) : "—"}
                      </p>
                      <ul className="font-body text-sm text-foreground space-y-0.5">
                        {g.bookings.map((b) => (
                          <li key={b.id}>
                            • {b.guest_names}
                            {b.email && (
                              <span className="text-muted-foreground"> — {b.email}</span>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <button
                      onClick={() => ungroup(g.groupId)}
                      className="px-3 py-1.5 text-xs uppercase tracking-widest border border-border text-muted-foreground hover:border-red-500 hover:text-red-600 transition-colors whitespace-nowrap"
                    >
                      Ungroup
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Group action bar */}
        {eligibleSelectedCount > 0 && (
          <div className="sticky top-4 z-10 mb-6 border border-primary bg-card p-4 flex flex-wrap items-center gap-3 shadow-lg">
            <span className="font-body text-sm text-foreground">
              {eligibleSelectedCount} solo{eligibleSelectedCount === 1 ? "" : "s"} selected
            </span>
            <select
              value={assignToCategoryId}
              onChange={(e) => setAssignToCategoryId(e.target.value)}
              className="bg-transparent border border-border px-3 py-2 font-body text-sm text-foreground focus:outline-none focus:border-primary"
            >
              <option value="">Assign to room type…</option>
              {categories
                .filter((c) => c.name !== SOLO_NAME)
                .map((c) => (
                  <option key={c.id} value={c.id} disabled={c.inventory_count <= 0}>
                    {c.name} ({c.inventory_count} left)
                  </option>
                ))}
            </select>
            <button
              onClick={groupSelectedIntoRoom}
              disabled={!assignToCategoryId || grouping}
              className="px-4 py-2 bg-primary text-primary-foreground font-body text-xs uppercase tracking-[0.25em] hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {grouping ? "Grouping…" : "Group into Room"}
            </button>
            <button
              onClick={() => setSelectedSoloIds(new Set())}
              className="font-body text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
            >
              Clear
            </button>
          </div>
        )}

        {loading ? (
          <p className="font-body text-muted-foreground">Loading…</p>
        ) : sortedBookings.length === 0 ? (
          <p className="font-body text-muted-foreground">No active reservations.</p>
        ) : (
          <div className="overflow-x-auto border border-border">
            <table className="w-full font-body text-sm">
              <thead className="bg-muted/50 border-b border-border">
                <tr className="text-left">
                  <th className="px-3 py-3 font-medium text-foreground w-10"></th>
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
                  const solo = isSolo(b);
                  const grouped = !!b.grouped_room_id;
                  return (
                    <tr
                      key={b.id}
                      className={`border-b border-border last:border-b-0 ${
                        expired ? "bg-red-50" : ""
                      }`}
                    >
                      <td className="px-3 py-3 align-top">
                        {solo && !grouped && (
                          <input
                            type="checkbox"
                            checked={selectedSoloIds.has(b.id)}
                            onChange={() => toggleSoloSelection(b.id)}
                            className="w-4 h-4 cursor-pointer"
                          />
                        )}
                      </td>
                      <td className="px-4 py-3 align-top">
                        <div className="text-foreground">{b.guest_names}</div>
                        {b.email && (
                          <div className="text-xs text-muted-foreground mt-0.5">{b.email}</div>
                        )}
                      </td>
                      <td className="px-4 py-3 align-top text-foreground">
                        {roomName(b.room_category_id)}
                        {grouped && (
                          <div className="text-xs text-primary mt-0.5">
                            → grouped into {roomName(b.grouped_room_category_id ?? "")}
                          </div>
                        )}
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
