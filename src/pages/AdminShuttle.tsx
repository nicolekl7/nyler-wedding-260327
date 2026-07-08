import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const SESSION_KEY = "admin_unlocked_at";
const SESSION_TTL_MS = 1000 * 60 * 60 * 4;
const DEFAULT_WAVE_CAPACITY: Record<"arrival" | "departure", Record<"wave_1" | "wave_2", number>> = {
  arrival: { wave_1: 26, wave_2: 26 },
  departure: { wave_1: 22, wave_2: 22 },
};
const WAVE_TIME: Record<"arrival" | "departure", Record<"wave_1" | "wave_2", string>> = {
  arrival: { wave_1: "2 PM", wave_2: "3 PM" },
  departure: { wave_1: "11 AM", wave_2: "12 PM" },
};

type Wave = "wave_1" | "wave_2" | "none";

interface Signup {
  id: string;
  created_at: string;
  full_name: string;
  email: string | null;
  party_size: number;
  arrival_wave: Wave;
  departure_wave: Wave;
  whatsapp_optin: boolean;
  travel_details: string | null;
  passport_paths: string[] | null;
  departure_plan: string | null;
  florence_rsvp: string | null;
  arrival_plan: string | null;
  guest_names: string[] | string | null;
}

const parseGuestNames = (raw: Signup["guest_names"]): string[] => {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  const s = String(raw).trim();
  if (!s) return [];
  if (s.startsWith("[")) {
    try {
      const parsed = JSON.parse(s);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return s.split(",").map((n) => n.trim()).filter(Boolean);
};

const WAVE_LABELS: Record<"arrival" | "departure", Record<Wave, string>> = {
  arrival: {
    wave_1: "Wave 1 — depart Siena Train Station 2:00 PM (Sept 17)",
    wave_2: "Wave 2 — depart Siena Train Station 3:00 PM (Sept 17)",
    none: "Not Taking Arrival Shuttle",
  },
  departure: {
    wave_1: "Wave 1 — depart Borgo 11:00 AM (Sept 19)",
    wave_2: "Wave 2 — depart Borgo 12:00 PM (Sept 19)",
    none: "Not Taking Departure Shuttle",
  },
};

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

const PLAN_LABELS: Record<string, string> = {
  rental_car: "Renting a car",
  private_transfer: "Private transfer / taxi",
  not_sure: "Not sure yet",
};

interface PassportTrackerEntry {
  id: string;
  created_at: string;
  full_name: string;
  received: boolean;
}

interface InvitedGuest {
  id: string;
  first_name: string;
  last_name: string;
  welcome_party_rsvp: string | null;
  wedding_day_rsvp: string | null;
  pool_day_rsvp: string | null;
}

const EVENT_FIELDS: { key: keyof InvitedGuest; label: string }[] = [
  { key: "welcome_party_rsvp", label: "Welcome" },
  { key: "wedding_day_rsvp", label: "Wedding" },
  { key: "pool_day_rsvp", label: "Pool" },
];

const AdminShuttle = ({ embedded = false }: { embedded?: boolean } = {}) => {
  const [unlocked, setUnlocked] = useState(false);
  const [password, setPassword] = useState("");
  const [authenticating, setAuthenticating] = useState(false);
  const [signups, setSignups] = useState<Signup[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Signup>>({});
  const [saving, setSaving] = useState(false);
  const [passportTracker, setPassportTracker] = useState<PassportTrackerEntry[]>([]);
  const [invitedGuests, setInvitedGuests] = useState<InvitedGuest[]>([]);
  const [guestFilter, setGuestFilter] = useState<"all" | "missingShuttle" | "missingPassport">("all");
  const [waveCapacity, setWaveCapacity] = useState(DEFAULT_WAVE_CAPACITY);
  const [capacityDraft, setCapacityDraft] = useState(DEFAULT_WAVE_CAPACITY);
  const [savingCapacity, setSavingCapacity] = useState(false);

  useEffect(() => {
    const ts = localStorage.getItem(SESSION_KEY);
    if (ts && Date.now() - Number(ts) < SESSION_TTL_MS) setUnlocked(true);
  }, []);

  useEffect(() => {
    if (unlocked) loadData();
  }, [unlocked]);

  const loadData = async () => {
    setLoading(true);
    const [signupsRes, trackerRes, invitedRes, capacityRes] = await Promise.all([
      supabase.from("shuttle_signups" as any).select("*").order("created_at", { ascending: true }),
      supabase.from("passport_tracker" as any).select("*").order("full_name", { ascending: true }),
      supabase
        .from("invited_guests")
        .select("id, first_name, last_name, welcome_party_rsvp, wedding_day_rsvp, pool_day_rsvp"),
      supabase.from("shuttle_capacity" as any).select("direction, wave, capacity"),
    ]);
    if (signupsRes.error) toast.error("Failed to load signups");
    if (trackerRes.error) toast.error("Failed to load passport tracker");
    if (invitedRes.error) toast.error("Failed to load guest list");
    if (capacityRes.error) toast.error("Failed to load shuttle capacity");
    setSignups(((signupsRes.data ?? []) as unknown) as Signup[]);
    setPassportTracker(((trackerRes.data ?? []) as unknown) as PassportTrackerEntry[]);
    setInvitedGuests((invitedRes.data ?? []) as InvitedGuest[]);
    if (capacityRes.data && capacityRes.data.length > 0) {
      const next = { arrival: { ...DEFAULT_WAVE_CAPACITY.arrival }, departure: { ...DEFAULT_WAVE_CAPACITY.departure } };
      (capacityRes.data as { direction: "arrival" | "departure"; wave: "wave_1" | "wave_2"; capacity: number }[]).forEach(
        (row) => {
          next[row.direction][row.wave] = row.capacity;
        }
      );
      setWaveCapacity(next);
      setCapacityDraft(next);
    }
    setLoading(false);
  };

  const saveCapacity = async () => {
    setSavingCapacity(true);
    const rows = (["arrival", "departure"] as const).flatMap((direction) =>
      (["wave_1", "wave_2"] as const).map((wave) => ({
        direction,
        wave,
        capacity: capacityDraft[direction][wave],
      }))
    );
    const results = await Promise.all(
      rows.map((row) =>
        supabase
          .from("shuttle_capacity" as any)
          .update({ capacity: row.capacity })
          .eq("direction", row.direction)
          .eq("wave", row.wave)
      )
    );
    const failed = results.some((r) => r.error);
    if (failed) {
      toast.error("Could not save shuttle capacity.");
    } else {
      setWaveCapacity(capacityDraft);
      toast.success("Shuttle capacity updated.");
    }
    setSavingCapacity(false);
  };

  const normalizeName = (name: string) => name.trim().toLowerCase();

  const findTrackerEntry = (name: string) =>
    passportTracker.find((p) => normalizeName(p.full_name) === normalizeName(name));

  const toggleSentSeparately = async (name: string) => {
    const existing = findTrackerEntry(name);
    if (existing) {
      setPassportTracker((prev) => prev.filter((p) => p.id !== existing.id));
      const { error } = await supabase.from("passport_tracker" as any).delete().eq("id", existing.id);
      if (error) {
        toast.error("Could not update passport checklist.");
        setPassportTracker((prev) => [...prev, existing]);
      }
      return;
    }
    const tempId = `temp-${Date.now()}`;
    const optimisticEntry: PassportTrackerEntry = {
      id: tempId,
      created_at: new Date().toISOString(),
      full_name: name.trim(),
      received: true,
    };
    setPassportTracker((prev) => [...prev, optimisticEntry]);
    const { data, error } = await supabase
      .from("passport_tracker" as any)
      .insert({ full_name: name.trim(), received: true })
      .select()
      .single();
    if (error) {
      toast.error("Could not update passport checklist.");
      setPassportTracker((prev) => prev.filter((p) => p.id !== tempId));
      return;
    }
    setPassportTracker((prev) => prev.map((p) => (p.id === tempId ? ((data as unknown) as PassportTrackerEntry) : p)));
  };

  const renderSentSeparatelyButton = (name: string) => {
    const checked = !!findTrackerEntry(name);
    return (
      <button
        type="button"
        onClick={() => toggleSentSeparately(name)}
        className={`px-3 py-1 font-body text-[11px] uppercase tracking-[0.15em] border transition-colors whitespace-nowrap ${
          checked
            ? "bg-primary text-primary-foreground border-primary"
            : "border-border text-muted-foreground hover:border-primary hover:text-primary"
        }`}
      >
        {checked ? "✓ Sent" : "Mark Sent"}
      </button>
    );
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthenticating(true);
    try {
      const { data, error } = await supabase.functions.invoke("verify-admin-password", {
        body: { password },
      });
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

  const logOut = () => {
    localStorage.removeItem(SESSION_KEY);
    setUnlocked(false);
    setPassword("");
  };

  const startEdit = (s: Signup) => {
    setEditingId(s.id);
    setEditForm({ ...s });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const saveEdit = async () => {
    if (!editingId) return;
    if (!editForm.full_name?.trim() || !editForm.party_size || editForm.party_size < 1) {
      toast.error("Name and party size are required.");
      return;
    }
    setSaving(true);
    const { error } = await supabase
      .from("shuttle_signups" as any)
      .update({
        full_name: editForm.full_name?.trim(),
        email: editForm.email?.trim() || null,
        party_size: editForm.party_size,
        arrival_wave: editForm.arrival_wave,
        departure_wave: editForm.departure_wave,
        travel_details: editForm.travel_details?.trim() || null,
        florence_rsvp: editForm.florence_rsvp || null,
      })
      .eq("id", editingId);
    setSaving(false);
    if (error) {
      toast.error("Could not save changes.");
      return;
    }
    toast.success("Updated.");
    cancelEdit();
    loadData();
  };

  const deleteRow = async (s: Signup) => {
    if (!confirm(`Delete shuttle signup for ${s.full_name}? This cannot be undone.`)) return;
    const { error } = await supabase.from("shuttle_signups" as any).delete().eq("id", s.id);
    if (error) {
      toast.error("Could not delete.");
      return;
    }
    toast.success("Deleted.");
    loadData();
  };

  const waveShortLabel = (w: Wave) => (w === "wave_1" ? "Wave 1" : w === "wave_2" ? "Wave 2" : "Not Taking");

  const exportCsv = () => {
    const header = [
      "Full Name",
      "Guest Names",
      "Email",
      "Party Size",
      "Arrival Wave",
      "Arrival Plan (if not taking)",
      "Departure Wave",
      "Departure Plan (if not taking)",
      "Florence Sept 15",
      "Travel Details",
      "Passports Uploaded Online",
      "Sent Passport Separately",
      "WhatsApp Opt-in",
      "Submitted",
    ];
    const rows = signups.map((s) => {
      const names = parseGuestNames(s.guest_names);
      const allNames = names.length > 0 ? names : [s.full_name];
      const sentSeparately = allNames.filter((n) => findTrackerEntry(n));
      return [
        s.full_name,
        names.slice(1).join("; "),
        s.email ?? "",
        String(s.party_size),
        waveShortLabel(s.arrival_wave),
        s.arrival_wave === "none" ? (PLAN_LABELS[s.arrival_plan ?? ""] ?? "") : "",
        waveShortLabel(s.departure_wave),
        s.departure_wave === "none" ? (PLAN_LABELS[s.departure_plan ?? ""] ?? "") : "",
        s.florence_rsvp ?? "",
        s.travel_details ?? "",
        String(s.passport_paths?.length ?? 0),
        sentSeparately.join("; "),
        s.whatsapp_optin ? "Yes" : "No",
        s.created_at,
      ];
    });
    const csv = [header, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "shuttle-signups.csv";
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const openPassport = async (path: string) => {
    const { data, error } = await supabase.storage
      .from("passports")
      .createSignedUrl(path, 60 * 10);
    if (error || !data?.signedUrl) {
      toast.error("Could not open passport file.");
      return;
    }
    window.open(data.signedUrl, "_blank", "noopener,noreferrer");
  };

  if (!embedded && !unlocked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
        <form onSubmit={handleLogin} className="w-full max-w-sm border border-border bg-card p-8 space-y-5">
          <h1 className="font-serif text-2xl text-foreground">Admin Access</h1>
          <p className="font-body text-sm text-muted-foreground">Enter the admin password to view shuttle signups.</p>
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

  const groupBy = (direction: "arrival" | "departure") => {
    const groups: Record<Wave, Signup[]> = { wave_1: [], wave_2: [], none: [] };
    signups.forEach((s) => {
      const w = direction === "arrival" ? s.arrival_wave : s.departure_wave;
      (groups[w] ?? groups.none).push(s);
    });
    return groups;
  };

  const renderEditRow = (s: Signup) => (
    <tr key={s.id} className="border-b border-border/50 last:border-0 bg-secondary/30">
      <td colSpan={100} className="px-5 py-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
          <label className="flex flex-col gap-1">
            <span className="font-body text-xs uppercase tracking-[0.2em] text-muted-foreground">Full Name</span>
            <input
              type="text"
              value={editForm.full_name ?? ""}
              onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
              className="bg-background border border-border px-2 py-1 font-body text-sm text-foreground focus:outline-none focus:border-primary"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="font-body text-xs uppercase tracking-[0.2em] text-muted-foreground">Email</span>
            <input
              type="email"
              value={editForm.email ?? ""}
              onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
              className="bg-background border border-border px-2 py-1 font-body text-sm text-foreground focus:outline-none focus:border-primary"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="font-body text-xs uppercase tracking-[0.2em] text-muted-foreground">Party Size</span>
            <input
              type="number"
              min={1}
              value={editForm.party_size ?? 1}
              onChange={(e) => setEditForm({ ...editForm, party_size: Math.max(1, parseInt(e.target.value || "1", 10)) })}
              className="bg-background border border-border px-2 py-1 font-body text-sm text-foreground focus:outline-none focus:border-primary w-32"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="font-body text-xs uppercase tracking-[0.2em] text-muted-foreground">Arrival Wave</span>
            <select
              value={editForm.arrival_wave}
              onChange={(e) => setEditForm({ ...editForm, arrival_wave: e.target.value as Wave })}
              className="bg-background border border-border px-2 py-1 font-body text-sm text-foreground focus:outline-none focus:border-primary"
            >
              {ARRIVAL_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1">
            <span className="font-body text-xs uppercase tracking-[0.2em] text-muted-foreground">Departure Wave</span>
            <select
              value={editForm.departure_wave}
              onChange={(e) => setEditForm({ ...editForm, departure_wave: e.target.value as Wave })}
              className="bg-background border border-border px-2 py-1 font-body text-sm text-foreground focus:outline-none focus:border-primary"
            >
              {DEPARTURE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1">
            <span className="font-body text-xs uppercase tracking-[0.2em] text-muted-foreground">Florence Sept 15</span>
            <select
              value={editForm.florence_rsvp ?? ""}
              onChange={(e) => setEditForm({ ...editForm, florence_rsvp: e.target.value || null })}
              className="bg-background border border-border px-2 py-1 font-body text-sm text-foreground focus:outline-none focus:border-primary"
            >
              <option value="">—</option>
              <option value="Yes, count me in">Yes, count me in</option>
              <option value="No">No</option>
              <option value="Maybe">Maybe</option>
            </select>
          </label>
          <label className="flex flex-col gap-1 md:col-span-2">
            <span className="font-body text-xs uppercase tracking-[0.2em] text-muted-foreground">Travel Details</span>
            <textarea
              rows={2}
              value={editForm.travel_details ?? ""}
              onChange={(e) => setEditForm({ ...editForm, travel_details: e.target.value })}
              className="bg-background border border-border px-2 py-1 font-body text-sm text-foreground focus:outline-none focus:border-primary"
            />
          </label>
        </div>
        <div className="flex gap-2 justify-end">
          <button
            onClick={cancelEdit}
            className="px-4 py-2 font-body text-xs uppercase tracking-[0.25em] text-muted-foreground hover:text-foreground transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={saveEdit}
            disabled={saving}
            className="px-4 py-2 bg-primary text-primary-foreground font-body text-xs uppercase tracking-[0.25em] hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </td>
    </tr>
  );

  const renderWaveBlock = (direction: "arrival" | "departure", wave: Wave, rows: Signup[]) => {
    const used = rows.reduce((sum, r) => sum + r.party_size, 0);
    const isCapacityWave = wave !== "none";
    const capacity = isCapacityWave ? waveCapacity[direction][wave as "wave_1" | "wave_2"] : 0;
    return (
      <div key={`${direction}-${wave}`} className="border border-border bg-card mb-6">
        <div className="px-5 py-4 border-b border-border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <h3 className="font-serif text-lg text-foreground">{WAVE_LABELS[direction][wave]}</h3>
          {isCapacityWave && (
            <div className="font-body text-xs uppercase tracking-[0.2em] text-muted-foreground">
              {used} / {capacity} seats used · {Math.max(0, capacity - used)} remaining
            </div>
          )}
        </div>
        {rows.length === 0 ? (
          <p className="px-5 py-4 font-body text-sm text-muted-foreground">No signups yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm font-body">
              <thead>
                <tr className="text-left text-xs uppercase tracking-[0.2em] text-muted-foreground border-b border-border">
                  <th className="px-5 py-3 font-medium">Full Name</th>
                  <th className="px-5 py-3 font-medium">Guest Names</th>
                  <th className="px-5 py-3 font-medium">Email</th>
                  <th className="px-5 py-3 font-medium">Party</th>
                  <th className="px-5 py-3 font-medium">Florence Sept 15</th>
                  {wave === "none" && <th className="px-5 py-3 font-medium">Travel Plan</th>}
                  <th className="px-5 py-3 font-medium">Travel Details</th>
                  <th className="px-5 py-3 font-medium">Passports</th>
                  <th className="px-5 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) =>
                  editingId === r.id ? (
                    renderEditRow(r)
                  ) : (
                    <tr key={r.id} className="border-b border-border/50 last:border-0">
                      <td className="px-5 py-3 text-foreground">
                        <div className="flex items-center gap-2">
                          <span>{r.full_name}</span>
                          {renderSentSeparatelyButton(r.full_name)}
                        </div>
                      </td>
                      <td className="px-5 py-3 text-muted-foreground">
                        {(() => {
                          const names = parseGuestNames(r.guest_names).slice(1);
                          if (names.length === 0) return "—";
                          return (
                            <div className="flex flex-col gap-2">
                              {names.map((name) => (
                                <div key={name} className="flex items-center gap-2">
                                  <span>{name}</span>
                                  {renderSentSeparatelyButton(name)}
                                </div>
                              ))}
                            </div>
                          );
                        })()}
                      </td>
                      <td className="px-5 py-3 text-foreground">{r.email || "—"}</td>
                      <td className="px-5 py-3 text-foreground">{r.party_size}</td>
                      <td className="px-5 py-3 text-foreground">{r.florence_rsvp || "—"}</td>
                      {wave === "none" && (
                        <td className="px-5 py-3 text-foreground">
                          {PLAN_LABELS[(direction === "arrival" ? r.arrival_plan : r.departure_plan) ?? ""] ?? "—"}
                        </td>
                      )}
                      <td className="px-5 py-3 text-muted-foreground whitespace-pre-wrap max-w-xs">{r.travel_details || "—"}</td>
                      <td className="px-5 py-3 text-foreground">
                        {r.passport_paths && r.passport_paths.length > 0 ? (
                          <div className="flex flex-col gap-1">
                            {r.passport_paths.map((p, i) => (
                              <button
                                key={p}
                                onClick={() => openPassport(p)}
                                className="text-left font-body text-xs uppercase tracking-[0.15em] text-primary hover:opacity-70 transition-opacity"
                              >
                                Passport {i + 1}
                              </button>
                            ))}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="px-5 py-3 text-right whitespace-nowrap">
                        <button
                          onClick={() => startEdit(r)}
                          className="font-body text-xs uppercase tracking-[0.2em] text-primary hover:opacity-70 transition-opacity mr-3"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteRow(r)}
                          className="font-body text-xs uppercase tracking-[0.2em] text-destructive hover:opacity-70 transition-opacity"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  };

  const arrival = groupBy("arrival");
  const departure = groupBy("departure");

  const shuttleByName = new Map<string, Signup>();
  signups.forEach((s) => {
    const names = parseGuestNames(s.guest_names);
    const allNames = names.length > 0 ? names : [s.full_name];
    allNames.forEach((n) => shuttleByName.set(normalizeName(n), s));
  });

  const attendingGuests = invitedGuests
    .filter((g) => EVENT_FIELDS.some((f) => g[f.key] === "accept"))
    .map((g) => ({
      id: g.id,
      name: `${g.first_name} ${g.last_name}`.trim(),
      events: EVENT_FIELDS.filter((f) => g[f.key] === "accept").map((f) => f.label),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

  const attendingTotal = attendingGuests.length;
  const shuttleSubmittedCount = attendingGuests.filter((g) => shuttleByName.has(normalizeName(g.name))).length;
  const shuttleOutstanding = attendingTotal - shuttleSubmittedCount;
  const shuttlePct = attendingTotal ? Math.round((shuttleSubmittedCount / attendingTotal) * 100) : 0;

  const passportsReceivedCount = attendingGuests.filter((g) => !!findTrackerEntry(g.name)).length;
  const passportsPct = attendingTotal ? Math.round((passportsReceivedCount / attendingTotal) * 100) : 0;

  const missingShuttleGuests = attendingGuests.filter((g) => !shuttleByName.has(normalizeName(g.name)));
  const missingPassportGuests = attendingGuests.filter((g) => !findTrackerEntry(g.name));

  const waveBreakdown = (direction: "arrival" | "departure") => {
    const key = direction === "arrival" ? "arrival_wave" : "departure_wave";
    const wave1 = attendingGuests.filter((g) => shuttleByName.get(normalizeName(g.name))?.[key] === "wave_1").length;
    const wave2 = attendingGuests.filter((g) => shuttleByName.get(normalizeName(g.name))?.[key] === "wave_2").length;
    const none = attendingGuests.filter((g) => shuttleByName.get(normalizeName(g.name))?.[key] === "none").length;
    const notSubmitted = attendingTotal - wave1 - wave2 - none;
    return { wave1, wave2, none, notSubmitted, submittedSoFar: wave1 + wave2, maxPossible: attendingTotal - none };
  };

  const arrivalBreakdown = waveBreakdown("arrival");
  const departureBreakdown = waveBreakdown("departure");

  const filteredGuests =
    guestFilter === "missingShuttle"
      ? missingShuttleGuests
      : guestFilter === "missingPassport"
        ? missingPassportGuests
        : attendingGuests;

  const guestListSection = (
    <section className="mb-12">
      <h2 className="font-serif text-2xl text-foreground mb-1">Attending Guest List</h2>
      <p className="font-body text-sm text-muted-foreground mb-6">
        Every invited guest who accepted at least one event, cross-referenced with shuttle signups and passport
        photos.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="border border-border bg-card p-5">
          <p className="font-body text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2">Attending</p>
          <p className="font-serif text-4xl text-foreground">{attendingTotal}</p>
          <p className="font-body text-xs text-muted-foreground mt-1">guests across all events</p>
        </div>
        <div className="border border-border bg-card p-5">
          <p className="font-body text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2">Shuttle Form</p>
          <p className="font-serif text-4xl text-foreground">
            {shuttleSubmittedCount}
            <span className="text-lg text-muted-foreground"> / {attendingTotal}</span>
          </p>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden mt-3 mb-2">
            <div className="h-full bg-primary" style={{ width: `${shuttlePct}%` }} />
          </div>
          <p className="font-body text-xs text-muted-foreground">
            {shuttlePct}% submitted · {shuttleOutstanding} outstanding
          </p>
        </div>
        <div className="border border-border bg-card p-5">
          <p className="font-body text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2">
            Passports Received
          </p>
          <p className="font-serif text-4xl text-foreground">
            {passportsReceivedCount}
            <span className="text-lg text-muted-foreground"> / {attendingTotal}</span>
          </p>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden mt-3 mb-2">
            <div className="h-full bg-primary" style={{ width: `${passportsPct}%` }} />
          </div>
          <p className="font-body text-xs text-muted-foreground">
            {passportsPct}% received · form or direct
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {(
          [
            { direction: "arrival" as const, title: "Arrival Shuttle", wave1Label: "2 PM (Wave 1)", wave2Label: "3 PM (Wave 2)", data: arrivalBreakdown },
            { direction: "departure" as const, title: "Departure Shuttle", wave1Label: "11 AM (Wave 1)", wave2Label: "12 PM (Wave 2)", data: departureBreakdown },
          ]
        ).map(({ direction, title, wave1Label, wave2Label, data }) => (
          <div key={direction} className="border border-border bg-card p-5">
            <p className="font-body text-xs uppercase tracking-[0.2em] text-muted-foreground mb-3">{title}</p>
            <div className="font-body text-sm space-y-1.5">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{wave1Label}</span>
                <span className="text-foreground">{data.wave1}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{wave2Label}</span>
                <span className="text-foreground">{data.wave2}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Not Taking</span>
                <span className="text-foreground">{data.none}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Hasn't Submitted</span>
                <span className="text-foreground">{data.notSubmitted}</span>
              </div>
              <div className="flex justify-between border-t border-border/50 pt-1.5 mt-1.5">
                <span className="text-muted-foreground">Submitted So Far (both times)</span>
                <span className="text-foreground font-medium">{data.submittedSoFar}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Max Possible Riders</span>
                <span className="text-foreground font-medium">{data.maxPossible}</span>
              </div>
            </div>
            <p className="font-body text-[11px] text-muted-foreground mt-3">
              Max possible = {attendingTotal} attending − {data.none} not taking = {data.maxPossible}, assuming
              everyone who hasn't submitted yet ends up riding.
            </p>
          </div>
        ))}
      </div>

      <div className="flex gap-2 mb-4 flex-wrap">
        {(
          [
            { key: "all" as const, label: `All (${attendingTotal})` },
            { key: "missingShuttle" as const, label: `Missing Shuttle (${missingShuttleGuests.length})` },
            { key: "missingPassport" as const, label: `Missing Passport (${missingPassportGuests.length})` },
          ]
        ).map((f) => (
          <button
            key={f.key}
            onClick={() => setGuestFilter(f.key)}
            className={`px-4 py-2 font-body text-xs uppercase tracking-[0.2em] border transition-colors ${
              guestFilter === f.key
                ? "bg-primary text-primary-foreground border-primary"
                : "border-border text-foreground hover:border-primary"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="border border-border bg-card overflow-x-auto">
        <table className="w-full text-sm font-body">
          <thead>
            <tr className="text-left text-xs uppercase tracking-[0.2em] text-muted-foreground border-b border-border">
              <th className="px-5 py-3 font-medium">Guest</th>
              <th className="px-5 py-3 font-medium">Events</th>
              <th className="px-5 py-3 font-medium">Shuttle</th>
              <th className="px-5 py-3 font-medium">Passport</th>
            </tr>
          </thead>
          <tbody>
            {filteredGuests.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-5 py-4 font-body text-sm text-muted-foreground">
                  No guests match this filter.
                </td>
              </tr>
            ) : (
              filteredGuests.map((g) => {
                const shuttleMatch = shuttleByName.get(normalizeName(g.name));
                return (
                  <tr key={g.id} className="border-b border-border/50 last:border-0">
                    <td className="px-5 py-3 text-foreground">{g.name}</td>
                    <td className="px-5 py-3">
                      <div className="flex flex-wrap gap-1.5">
                        {g.events.map((e) => (
                          <span
                            key={e}
                            className="px-2 py-1 border border-border font-body text-[10px] uppercase tracking-[0.15em] text-muted-foreground"
                          >
                            {e}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      {shuttleMatch ? (
                        <div className="flex flex-col gap-0.5 text-xs text-foreground">
                          <span>
                            Arr ·{" "}
                            {shuttleMatch.arrival_wave === "none"
                              ? "Not Taking"
                              : WAVE_TIME.arrival[shuttleMatch.arrival_wave as "wave_1" | "wave_2"]}
                          </span>
                          <span>
                            Dep ·{" "}
                            {shuttleMatch.departure_wave === "none"
                              ? "Not Taking"
                              : WAVE_TIME.departure[shuttleMatch.departure_wave as "wave_1" | "wave_2"]}
                          </span>
                        </div>
                      ) : (
                        <span className="font-body text-xs uppercase tracking-[0.15em] text-destructive font-medium">
                          Not Submitted
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3">{renderSentSeparatelyButton(g.name)}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </section>
  );

  const innerContent = (
    <>
      {!embedded && (
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-serif text-3xl text-foreground">Travel Confirmations</h1>
            <p className="font-body text-sm text-muted-foreground mt-1">
              {signups.length} total signup{signups.length === 1 ? "" : "s"}
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={exportCsv}
              className="px-4 py-2 border border-primary text-primary font-body text-xs uppercase tracking-[0.25em] hover:bg-primary hover:text-primary-foreground transition-colors"
            >
              Export CSV
            </button>
            <button
              onClick={loadData}
              className="px-4 py-2 border border-primary text-primary font-body text-xs uppercase tracking-[0.25em] hover:bg-primary hover:text-primary-foreground transition-colors"
            >
              {loading ? "Loading..." : "Refresh"}
            </button>
            <button
              onClick={logOut}
              className="px-4 py-2 font-body text-xs uppercase tracking-[0.25em] text-muted-foreground hover:text-foreground transition-colors"
            >
              Log out
            </button>
          </div>
        </div>
      )}

      {embedded && (
        <div className="flex items-center justify-between mb-6">
          <p className="font-body text-sm text-muted-foreground">
            {signups.length} total signup{signups.length === 1 ? "" : "s"}
          </p>
          <div className="flex gap-3">
            <button
              onClick={exportCsv}
              className="px-4 py-2 border border-primary text-primary font-body text-xs uppercase tracking-[0.25em] hover:bg-primary hover:text-primary-foreground transition-colors"
            >
              Export CSV
            </button>
            <button
              onClick={loadData}
              className="px-4 py-2 border border-primary text-primary font-body text-xs uppercase tracking-[0.25em] hover:bg-primary hover:text-primary-foreground transition-colors"
            >
              {loading ? "Loading..." : "Refresh"}
            </button>
          </div>
        </div>
      )}

      {guestListSection}

      <p className="mb-6 font-body text-xs text-muted-foreground">
        Use "Mark Sent" below to record a guest's passport photo that arrived outside the online form — it counts
        toward the Passports Received total above.
      </p>

      <section className="mb-12 border border-border bg-card p-5">
        <h2 className="font-serif text-lg text-foreground mb-4">Shuttle Capacity</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
          {(
            [
              { direction: "arrival" as const, wave: "wave_1" as const, label: "Arrival Wave 1" },
              { direction: "arrival" as const, wave: "wave_2" as const, label: "Arrival Wave 2" },
              { direction: "departure" as const, wave: "wave_1" as const, label: "Departure Wave 1" },
              { direction: "departure" as const, wave: "wave_2" as const, label: "Departure Wave 2" },
            ]
          ).map(({ direction, wave, label }) => (
            <div key={`${direction}-${wave}`} className="space-y-1.5">
              <label className="font-body text-xs uppercase tracking-[0.15em] text-muted-foreground block">
                {label}
              </label>
              <input
                type="number"
                min={0}
                value={capacityDraft[direction][wave]}
                onChange={(e) =>
                  setCapacityDraft((prev) => ({
                    ...prev,
                    [direction]: { ...prev[direction], [wave]: Math.max(0, parseInt(e.target.value || "0", 10)) },
                  }))
                }
                className="w-full px-3 py-2 border border-border bg-background font-body text-sm"
              />
            </div>
          ))}
        </div>
        <button
          onClick={saveCapacity}
          disabled={savingCapacity}
          className="px-4 py-2 border border-primary text-primary font-body text-xs uppercase tracking-[0.25em] hover:bg-primary hover:text-primary-foreground transition-colors disabled:opacity-50"
        >
          {savingCapacity ? "Saving..." : "Save Capacity"}
        </button>
      </section>

      <section className="mb-12">
        <h2 className="font-serif text-2xl text-foreground mb-4">Arrival — Sept 17</h2>
        {(["wave_1", "wave_2", "none"] as Wave[]).map((w) => renderWaveBlock("arrival", w, arrival[w]))}
      </section>

      <section>
        <h2 className="font-serif text-2xl text-foreground mb-4">Departure Shuttle — Sept 19 (Check-out is 12 PM)</h2>
        {(["wave_1", "wave_2", "none"] as Wave[]).map((w) => renderWaveBlock("departure", w, departure[w]))}
      </section>
    </>
  );

  if (embedded) return innerContent;

  return (
    <div className="min-h-screen bg-background p-6 md:p-10">
      <div className="max-w-6xl mx-auto">{innerContent}</div>
    </div>
  );
};

export default AdminShuttle;
