import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const SESSION_KEY = "admin_unlocked_at";
const SESSION_TTL_MS = 1000 * 60 * 60 * 4;
const CAPACITY = 28;

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

const AdminShuttle = ({ embedded = false }: { embedded?: boolean } = {}) => {
  const [unlocked, setUnlocked] = useState(false);
  const [password, setPassword] = useState("");
  const [authenticating, setAuthenticating] = useState(false);
  const [signups, setSignups] = useState<Signup[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Signup>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const ts = localStorage.getItem(SESSION_KEY);
    if (ts && Date.now() - Number(ts) < SESSION_TTL_MS) setUnlocked(true);
  }, []);

  useEffect(() => {
    if (unlocked) loadData();
  }, [unlocked]);

  const loadData = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("shuttle_signups" as any)
      .select("*")
      .order("created_at", { ascending: true });
    if (error) toast.error("Failed to load signups");
    setSignups(((data ?? []) as unknown) as Signup[]);
    setLoading(false);
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
      <td colSpan={7} className="px-5 py-4">
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
    return (
      <div key={`${direction}-${wave}`} className="border border-border bg-card mb-6">
        <div className="px-5 py-4 border-b border-border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <h3 className="font-serif text-lg text-foreground">{WAVE_LABELS[direction][wave]}</h3>
          {isCapacityWave && (
            <div className="font-body text-xs uppercase tracking-[0.2em] text-muted-foreground">
              {used} / {CAPACITY} seats used · {Math.max(0, CAPACITY - used)} remaining
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
                      <td className="px-5 py-3 text-foreground">{r.full_name}</td>
                      <td className="px-5 py-3 text-muted-foreground">
                        {(() => {
                          const names = parseGuestNames(r.guest_names);
                          return names.length > 1 ? names.slice(1).join(", ") : "—";
                        })()}
                      </td>
                      <td className="px-5 py-3 text-foreground">{r.email || "—"}</td>
                      <td className="px-5 py-3 text-foreground">{r.party_size}</td>
                      <td className="px-5 py-3 text-foreground">{r.florence_rsvp || "—"}</td>
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
          <button
            onClick={loadData}
            className="px-4 py-2 border border-primary text-primary font-body text-xs uppercase tracking-[0.25em] hover:bg-primary hover:text-primary-foreground transition-colors"
          >
            {loading ? "Loading..." : "Refresh"}
          </button>
        </div>
      )}

      <section className="mb-12">
        <h2 className="font-serif text-2xl text-foreground mb-4">Arrival — Sept 17</h2>
        {(["wave_1", "wave_2", "none"] as Wave[]).map((w) => renderWaveBlock("arrival", w, arrival[w]))}
      </section>

      <section>
        <h2 className="font-serif text-2xl text-foreground mb-4">Departure — Sept 19</h2>
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
