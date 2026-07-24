import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { namesMatch, parseGuestList } from "@/lib/guestMatching";
import { WAVE_TIME } from "./AdminShuttle";

interface InvitedGuest {
  id: string;
  first_name: string;
  last_name: string;
  welcome_party_rsvp: string | null;
  pool_day_rsvp: string | null;
  wedding_day_rsvp: string | null;
}

interface ShuttleSignup {
  full_name: string;
  arrival_wave: string;
  departure_wave: string;
  guest_names: string | null;
}

interface RoomBooking {
  guest_names: string | null;
  room_category_id: string;
  is_released: boolean;
}

interface RoomCategory {
  id: string;
  name: string;
}

interface GuestRow {
  id: string;
  firstName: string;
  lastName: string;
  welcome: string | null;
  pool: string | null;
  wedding: string | null;
  arrival: string;
  departure: string;
  room: string;
}

type SortKey =
  | "firstName"
  | "lastName"
  | "welcome"
  | "pool"
  | "wedding"
  | "arrival"
  | "departure"
  | "room";

const COLUMNS: { key: SortKey; label: string }[] = [
  { key: "firstName", label: "First Name" },
  { key: "lastName", label: "Last Name" },
  { key: "welcome", label: "Welcome" },
  { key: "pool", label: "Pool" },
  { key: "wedding", label: "Wedding" },
  { key: "arrival", label: "Arrival Shuttle" },
  { key: "departure", label: "Departure Shuttle" },
  { key: "room", label: "Room" },
];

const rsvpLabel = (v: string | null) => {
  if (v === "yes" || v === "accept") return "Yes";
  if (v === "no" || v === "decline") return "No";
  return "—";
};

const rsvpClass = (v: string | null) => {
  if (v === "yes" || v === "accept") return "text-primary";
  if (v === "no" || v === "decline") return "text-muted-foreground";
  return "text-muted-foreground/60";
};

const isNoRsvp = (v: string | null) => v === "no" || v === "decline";

const waveLabel = (direction: "arrival" | "departure", wave: string) => {
  if (wave === "none" || !wave) return "Not taking";
  return WAVE_TIME[direction][wave as "wave_1" | "wave_2" | "wave_3"] ?? "—";
};

const sortValue = (r: GuestRow, key: SortKey): string => {
  switch (key) {
    case "firstName":
      return r.firstName;
    case "lastName":
      return r.lastName;
    case "welcome":
      return rsvpLabel(r.welcome);
    case "pool":
      return rsvpLabel(r.pool);
    case "wedding":
      return rsvpLabel(r.wedding);
    case "arrival":
      return r.arrival;
    case "departure":
      return r.departure;
    case "room":
      return r.room;
  }
};

const AdminGuestList = ({ embedded = false }: { embedded?: boolean } = {}) => {
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<GuestRow[]>([]);
  const [search, setSearch] = useState("");
  const [hideAllNo, setHideAllNo] = useState(true);
  const [sortKey, setSortKey] = useState<SortKey>("lastName");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const loadData = async () => {
    setLoading(true);
    const [invRes, shuttleRes, bookRes, catRes] = await Promise.all([
      supabase
        .from("invited_guests")
        .select("id,first_name,last_name,welcome_party_rsvp,pool_day_rsvp,wedding_day_rsvp"),
      supabase.from("shuttle_signups" as any).select("full_name,arrival_wave,departure_wave,guest_names"),
      supabase.from("room_bookings" as any).select("guest_names,room_category_id,is_released"),
      supabase.from("room_categories").select("id,name"),
    ]);

    if (invRes.error) toast.error("Failed to load guest list");
    if (shuttleRes.error) toast.error("Failed to load shuttle signups");
    if (bookRes.error) toast.error("Failed to load room bookings");
    if (catRes.error) toast.error("Failed to load room categories");

    const invitedGuests = (invRes.data ?? []) as InvitedGuest[];
    const shuttleSignups = ((shuttleRes.data ?? []) as unknown) as ShuttleSignup[];
    const roomBookings = ((bookRes.data ?? []) as unknown) as RoomBooking[];
    const roomCategories = (catRes.data ?? []) as RoomCategory[];
    const catMap = new Map(roomCategories.map((c) => [c.id, c.name]));

    const built = invitedGuests.map((g) => {
      const fullName = `${g.first_name} ${g.last_name}`.trim();

      const shuttle = shuttleSignups.find(
        (s) =>
          namesMatch(s.full_name, fullName) ||
          parseGuestList(s.guest_names).some((n) => namesMatch(n, fullName))
      );

      const room = roomBookings.find(
        (b) => !b.is_released && parseGuestList(b.guest_names).some((n) => namesMatch(n, fullName))
      );

      return {
        id: g.id,
        firstName: g.first_name,
        lastName: g.last_name,
        welcome: g.welcome_party_rsvp,
        pool: g.pool_day_rsvp,
        wedding: g.wedding_day_rsvp,
        arrival: shuttle ? waveLabel("arrival", shuttle.arrival_wave) : "Not submitted",
        departure: shuttle ? waveLabel("departure", shuttle.departure_wave) : "Not submitted",
        room: room ? catMap.get(room.room_category_id) ?? "—" : "Not staying onsite",
      };
    });

    setRows(built);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const isAllNo = (r: GuestRow) => isNoRsvp(r.welcome) && isNoRsvp(r.pool) && isNoRsvp(r.wedding);

  const visibleRows = rows
    .filter((r) => !hideAllNo || !isAllNo(r))
    .filter((r) =>
      search.trim()
        ? `${r.firstName} ${r.lastName}`.toLowerCase().includes(search.trim().toLowerCase())
        : true
    )
    .sort((a, b) => {
      const cmp = sortValue(a, sortKey).localeCompare(sortValue(b, sortKey));
      return sortDir === "asc" ? cmp : -cmp;
    });

  const exportCsv = () => {
    const header = ["First Name", "Last Name", "Welcome", "Pool", "Wedding", "Arrival Shuttle", "Departure Shuttle", "Room"];
    const csvRows = visibleRows.map((r) => [
      r.firstName,
      r.lastName,
      rsvpLabel(r.welcome),
      rsvpLabel(r.pool),
      rsvpLabel(r.wedding),
      r.arrival,
      r.departure,
      r.room,
    ]);
    const csv = [header, ...csvRows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "guest-list.csv";
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const hiddenCount = rows.length - rows.filter((r) => !isAllNo(r)).length;

  const innerContent = (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="font-serif text-2xl text-foreground">Guest List</h2>
          <p className="font-body text-sm text-muted-foreground mt-1">
            {visibleRows.length} of {rows.length} invited guest{rows.length === 1 ? "" : "s"} shown — RSVPs,
            shuttle times, and room assignments in one place.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name…"
            className="bg-background border border-border px-3 py-2 font-body text-sm text-foreground focus:outline-none focus:border-primary w-48"
          />
          <button
            onClick={exportCsv}
            disabled={loading || visibleRows.length === 0}
            className="px-4 py-2 border border-primary text-primary font-body text-xs uppercase tracking-[0.25em] hover:bg-primary hover:text-primary-foreground transition-colors disabled:opacity-50"
          >
            Export CSV
          </button>
          <button
            onClick={loadData}
            disabled={loading}
            className="px-4 py-2 border border-primary text-primary font-body text-xs uppercase tracking-[0.25em] hover:bg-primary hover:text-primary-foreground transition-colors disabled:opacity-50"
          >
            {loading ? "Loading..." : "Refresh"}
          </button>
        </div>
      </div>

      <label className="flex items-center gap-2 mb-4 font-body text-xs uppercase tracking-[0.2em] text-muted-foreground cursor-pointer w-fit">
        <input
          type="checkbox"
          checked={hideAllNo}
          onChange={(e) => setHideAllNo(e.target.checked)}
          className="w-4 h-4 cursor-pointer"
        />
        Hide guests who RSVP'd no to everything
        {hideAllNo && hiddenCount > 0 && <span className="normal-case tracking-normal">({hiddenCount} hidden)</span>}
      </label>

      <div className="border border-border bg-card overflow-x-auto">
        <table className="w-full text-sm font-body">
          <thead>
            <tr className="text-left text-xs uppercase tracking-[0.2em] text-muted-foreground border-b border-border">
              {COLUMNS.map((col, i) => (
                <th key={col.key} className={i === 0 ? "px-5 py-3 font-medium" : "px-4 py-3 font-medium"}>
                  <button
                    type="button"
                    onClick={() => toggleSort(col.key)}
                    className="flex items-center gap-1 hover:text-foreground transition-colors whitespace-nowrap"
                  >
                    {col.label}
                    <span className="inline-block w-3">
                      {sortKey === col.key ? (sortDir === "asc" ? "▲" : "▼") : ""}
                    </span>
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={COLUMNS.length} className="px-5 py-4 font-body text-sm text-muted-foreground">
                  Loading…
                </td>
              </tr>
            ) : visibleRows.length === 0 ? (
              <tr>
                <td colSpan={COLUMNS.length} className="px-5 py-4 font-body text-sm text-muted-foreground">
                  No guests match this search.
                </td>
              </tr>
            ) : (
              visibleRows.map((r) => (
                <tr key={r.id} className="border-b border-border/50 last:border-0">
                  <td className="px-5 py-3 text-foreground whitespace-nowrap">{r.firstName}</td>
                  <td className="px-4 py-3 text-foreground whitespace-nowrap">{r.lastName}</td>
                  <td className={`px-4 py-3 ${rsvpClass(r.welcome)}`}>{rsvpLabel(r.welcome)}</td>
                  <td className={`px-4 py-3 ${rsvpClass(r.pool)}`}>{rsvpLabel(r.pool)}</td>
                  <td className={`px-4 py-3 ${rsvpClass(r.wedding)}`}>{rsvpLabel(r.wedding)}</td>
                  <td className="px-4 py-3 text-foreground whitespace-nowrap">{r.arrival}</td>
                  <td className="px-4 py-3 text-foreground whitespace-nowrap">{r.departure}</td>
                  <td className="px-4 py-3 text-foreground whitespace-nowrap">{r.room}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );

  if (embedded) return innerContent;

  return (
    <div className="min-h-screen bg-background p-6 md:p-10">
      <div className="max-w-6xl mx-auto">{innerContent}</div>
    </div>
  );
};

export default AdminGuestList;
