import { useEffect, useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const SESSION_KEY = "admin_unlocked_at";
const SESSION_TTL_MS = 1000 * 60 * 60 * 4;
const WAVE_CAPACITY: Record<"arrival" | "departure", Record<"wave_1" | "wave_2", number>> = {
  arrival: { wave_1: 24, wave_2: 24 },
  departure: { wave_1: 22, wave_2: 22 },
};
const WAVE_TIME: Record<"arrival" | "departure", Record<"wave_1" | "wave_2", string>> = {
  arrival: { wave_1: "2:00 PM", wave_2: "3:00 PM" },
  departure: { wave_1: "11:00 AM", wave_2: "12:00 PM" },
};

type Wave = "wave_1" | "wave_2" | "none";
type SortMode = "lastName" | "firstName" | "submitted";

const SORT_OPTIONS: { value: SortMode; label: string }[] = [
  { value: "lastName", label: "Last Name (A–Z)" },
  { value: "firstName", label: "First Name (A–Z)" },
  { value: "submitted", label: "Date Submitted" },
];

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

const getFirstName = (fullName: string) => fullName.trim().split(/\s+/)[0] ?? fullName;
const getLastName = (fullName: string) => {
  const parts = fullName.trim().split(/\s+/);
  return parts.length > 1 ? parts[parts.length - 1] : (parts[0] ?? fullName);
};

const sortSignups = (rows: Signup[], mode: SortMode) => {
  const sorted = [...rows];
  sorted.sort((a, b) => {
    if (mode === "submitted") return a.created_at.localeCompare(b.created_at);
    if (mode === "firstName") return getFirstName(a.full_name).localeCompare(getFirstName(b.full_name));
    return getLastName(a.full_name).localeCompare(getLastName(b.full_name));
  });
  return sorted;
};

const WAVE_LABELS: Record<"arrival" | "departure", Record<Wave, string>> = {
  arrival: {
    wave_1: "Depart Siena Train Station 2:00 PM (Sept 17)",
    wave_2: "Depart Siena Train Station 3:00 PM (Sept 17)",
    none: "Not taking the arrival shuttle",
  },
  departure: {
    wave_1: "Depart Borgo 11:00 AM (Sept 19)",
    wave_2: "Depart Borgo 12:00 PM (Sept 19)",
    none: "Not taking the departure shuttle",
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
  const [sortMode, setSortMode] = useState<SortMode>("lastName");
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [arrivalTab, setArrivalTab] = useState<Wave>("wave_1");
  const [departureTab, setDepartureTab] = useState<Wave>("wave_1");

  useEffect(() => {
    const ts = localStorage.getItem(SESSION_KEY);
    if (ts && Date.now() - Number(ts) < SESSION_TTL_MS) setUnlocked(true);
  }, []);

  useEffect(() => {
    if (unlocked) loadData();
  }, [unlocked]);

  const loadData = async () => {
    setLoading(true);
    const [signupsRes, trackerRes, invitedRes] = await Promise.all([
      supabase.from("shuttle_signups" as any).select("*").order("created_at", { ascending: true }),
      supabase.from("passport_tracker" as any).select("*").order("full_name", { ascending: true }),
      supabase
        .from("invited_guests")
        .select("id, first_name, last_name, welcome_party_rsvp, wedding_day_rsvp, pool_day_rsvp"),
    ]);
    if (signupsRes.error) toast.error("Failed to load signups");
    if (trackerRes.error) toast.error("Failed to load passport tracker");
    if (invitedRes.error) toast.error("Failed to load guest list");
    setSignups(((signupsRes.data ?? []) as unknown) as Signup[]);
    setPassportTracker(((trackerRes.data ?? []) as unknown) as PassportTrackerEntry[]);
    setInvitedGuests((invitedRes.data ?? []) as InvitedGuest[]);
    setLoading(false);
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

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
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

  const renderEditForm = (s: Signup) => (
    <div className="pt-1">
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
    </div>
  );

  const renderPartyRow = (r: Signup, direction: "arrival" | "departure", wave: Wave) => {
    const isExpanded = expandedIds.has(r.id);
    const isEditing = editingId === r.id;
    const names = parseGuestNames(r.guest_names);
    const extraNames = names.slice(1);
    const allNames = names.length > 0 ? names : [r.full_name];
    const sentSeparatelyCount = allNames.filter((n) => findTrackerEntry(n)).length;
    const uploadedCount = r.passport_paths?.length ?? 0;
    const passportsAccounted = Math.min(r.party_size, uploadedCount + sentSeparatelyCount);
    const passportComplete = passportsAccounted >= r.party_size;

    return (
      <div key={r.id} className="border-b border-border/50 last:border-0">
        <button
          type="button"
          onClick={() => toggleExpand(r.id)}
          className="w-full flex items-center justify-between gap-3 px-5 py-3 text-left hover:bg-muted/30 transition-colors"
        >
          <div className="flex items-center gap-3 min-w-0">
            {isExpanded ? (
              <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
            ) : (
              <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
            )}
            <span className="font-body text-sm text-foreground truncate">
              {r.full_name}
              {r.party_size > 1 && <span className="text-muted-foreground"> (+{r.party_size - 1})</span>}
            </span>
          </div>
          <span
            className={`font-body text-[11px] uppercase tracking-[0.15em] shrink-0 ${
              passportComplete ? "text-primary" : "text-destructive"
            }`}
          >
            {passportComplete ? "Passports OK" : `Passports ${passportsAccounted}/${r.party_size}`}
          </span>
        </button>

        {isExpanded && (
          <div className="px-5 pb-5 bg-secondary/20">
            {isEditing ? (
              renderEditForm(r)
            ) : (
              <div className="pt-1 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-body text-sm">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-1">Email</p>
                    <p className="text-foreground">{r.email || "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-1">Florence Sept 15</p>
                    <p className="text-foreground">{r.florence_rsvp || "—"}</p>
                  </div>
                  {wave === "none" && (
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-1">Travel Plan</p>
                      <p className="text-foreground">
                        {PLAN_LABELS[(direction === "arrival" ? r.arrival_plan : r.departure_plan) ?? ""] ?? "—"}
                      </p>
                    </div>
                  )}
                  <div className="sm:col-span-2">
                    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-1">Travel Details</p>
                    <p className="text-foreground whitespace-pre-wrap">{r.travel_details || "—"}</p>
                  </div>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2">Party & Passports</p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 font-body text-sm">
                      <span className="text-foreground">{r.full_name} (primary)</span>
                      {renderSentSeparatelyButton(r.full_name)}
                    </div>
                    {extraNames.map((name) => (
                      <div key={name} className="flex items-center gap-2 font-body text-sm">
                        <span className="text-foreground">{name}</span>
                        {renderSentSeparatelyButton(name)}
                      </div>
                    ))}
                  </div>
                  {uploadedCount > 0 && (
                    <div className="flex flex-wrap gap-3 mt-3">
                      {r.passport_paths!.map((p, i) => (
                        <button
                          key={p}
                          onClick={() => openPassport(p)}
                          className="font-body text-xs uppercase tracking-[0.15em] text-primary hover:opacity-70 transition-opacity"
                        >
                          View Passport {i + 1}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex gap-4 pt-1">
                  <button
                    onClick={() => startEdit(r)}
                    className="font-body text-xs uppercase tracking-[0.2em] text-primary hover:opacity-70 transition-opacity"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteRow(r)}
                    className="font-body text-xs uppercase tracking-[0.2em] text-destructive hover:opacity-70 transition-opacity"
                  >
                    Delete
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderManifestSection = (direction: "arrival" | "departure") => {
    const groups = direction === "arrival" ? arrival : departure;
    const tab = direction === "arrival" ? arrivalTab : departureTab;
    const setTab = direction === "arrival" ? setArrivalTab : setDepartureTab;
    const rows = sortSignups(groups[tab], sortMode);
    const isCapacityWave = tab !== "none";
    const used = groups[tab].reduce((sum, r) => sum + r.party_size, 0);
    const capacity = isCapacityWave ? WAVE_CAPACITY[direction][tab as "wave_1" | "wave_2"] : 0;
    const notTakingCount = groups.none.reduce((sum, r) => sum + r.party_size, 0);

    return (
      <div className="border border-border bg-card">
        <div className="flex flex-wrap items-center gap-2 px-5 py-4 border-b border-border">
          {(["wave_1", "wave_2", "none"] as Wave[]).map((w) => (
            <button
              key={w}
              onClick={() => setTab(w)}
              className={`px-4 py-2 font-body text-xs uppercase tracking-[0.2em] border transition-colors ${
                tab === w
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border text-foreground hover:border-primary"
              }`}
            >
              {w === "none"
                ? `Not Taking (${notTakingCount})`
                : `Wave ${w === "wave_1" ? "1" : "2"} · ${WAVE_TIME[direction][w]}`}
            </button>
          ))}
        </div>

        <div className="px-5 py-4 border-b border-border">
          <h3 className="font-serif text-lg text-foreground">
            {tab === "none"
              ? `Not Taking the ${direction === "arrival" ? "Arrival" : "Departure"} Shuttle`
              : `Wave ${tab === "wave_1" ? "1" : "2"} (${WAVE_TIME[direction][tab]}) — ${used} / ${capacity} Seats Used`}
          </h3>
          <p className="font-body text-xs text-muted-foreground mt-1">{WAVE_LABELS[direction][tab]}</p>
        </div>

        {rows.length === 0 ? (
          <p className="px-5 py-4 font-body text-sm text-muted-foreground">
            {tab === "none" ? "Everyone has a shuttle assigned." : "No signups yet."}
          </p>
        ) : (
          <div>{rows.map((r) => renderPartyRow(r, direction, tab))}</div>
        )}
      </div>
    );
  };

  const arrival = groupBy("arrival");
  const departure = groupBy("departure");

  const arrivalConfirmed =
    arrival.wave_1.reduce((s, r) => s + r.party_size, 0) + arrival.wave_2.reduce((s, r) => s + r.party_size, 0);
  const arrivalMax = WAVE_CAPACITY.arrival.wave_1 + WAVE_CAPACITY.arrival.wave_2;
  const departureConfirmed =
    departure.wave_1.reduce((s, r) => s + r.party_size, 0) + departure.wave_2.reduce((s, r) => s + r.party_size, 0);
  const departureMax = WAVE_CAPACITY.departure.wave_1 + WAVE_CAPACITY.departure.wave_2;

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

  const capacitySummary = (
    <section className="mb-10">
      <h2 className="font-serif text-2xl text-foreground mb-1">Shuttle Utilization</h2>
      <p className="font-body text-sm text-muted-foreground mb-4">
        Confirmed riders against total seat capacity across both waves.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {(
          [
            { label: "Arrival Shuttle Riders", confirmed: arrivalConfirmed, max: arrivalMax },
            { label: "Departure Shuttle Riders", confirmed: departureConfirmed, max: departureMax },
          ]
        ).map(({ label, confirmed, max }) => {
          const pct = max ? Math.min(100, Math.round((confirmed / max) * 100)) : 0;
          const remaining = Math.max(0, max - confirmed);
          return (
            <div key={label} className="border border-border bg-card p-5">
              <p className="font-body text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2">{label}</p>
              <p className="font-serif text-4xl text-foreground">
                {confirmed}
                <span className="text-lg text-muted-foreground"> / {max}</span>
              </p>
              <div className="h-1.5 bg-muted rounded-full overflow-hidden mt-3 mb-2">
                <div className="h-full bg-primary" style={{ width: `${pct}%` }} />
              </div>
              <p className="font-body text-xs text-muted-foreground">
                {remaining} seat{remaining === 1 ? "" : "s"} remaining across both waves
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );

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

      {capacitySummary}

      <section className="mb-12">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <div>
            <h2 className="font-serif text-2xl text-foreground">Shuttle Manifests</h2>
            <p className="font-body text-xs text-muted-foreground mt-1">
              Click a party to view flight details, passport status, and edit actions. Use "Mark Sent" inside a
              party to record a passport photo that arrived outside the online form.
            </p>
          </div>
          <label className="flex items-center gap-2 font-body text-xs uppercase tracking-[0.2em] text-muted-foreground shrink-0">
            Sort riders by
            <select
              value={sortMode}
              onChange={(e) => setSortMode(e.target.value as SortMode)}
              className="bg-background border border-border px-2 py-1.5 font-body text-xs text-foreground focus:outline-none focus:border-primary normal-case tracking-normal"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </label>
        </div>

        <div className="mb-8">
          <h3 className="font-body text-xs uppercase tracking-[0.25em] text-muted-foreground mb-3">
            Arrival — Sept 17
          </h3>
          {renderManifestSection("arrival")}
        </div>

        <div>
          <h3 className="font-body text-xs uppercase tracking-[0.25em] text-muted-foreground mb-3">
            Departure — Sept 19 (Check-out is 12 PM)
          </h3>
          {renderManifestSection("departure")}
        </div>
      </section>

      {guestListSection}
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
