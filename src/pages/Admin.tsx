import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import AdminReservations from "./AdminReservations";
import AdminShuttle from "./AdminShuttle";

const SESSION_KEY = "admin_unlocked_at";
const SESSION_TTL_MS = 1000 * 60 * 60 * 4;

type Tab = "reservations" | "travel";

import { supabase } from "@/integrations/supabase/client";

const Admin = () => {
  const [unlocked, setUnlocked] = useState(false);
  const [password, setPassword] = useState("");
  const [authenticating, setAuthenticating] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();

  const tab: Tab = searchParams.get("tab") === "travel" ? "travel" : "reservations";

  useEffect(() => {
    const ts = localStorage.getItem(SESSION_KEY);
    if (ts && Date.now() - Number(ts) < SESSION_TTL_MS) setUnlocked(true);
  }, []);

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

  const setTab = (next: Tab) => {
    setSearchParams(next === "reservations" ? {} : { tab: next });
  };

  if (!unlocked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
        <form onSubmit={handleLogin} className="w-full max-w-sm border border-border bg-card p-8 space-y-5">
          <h1 className="font-serif text-2xl text-foreground">Admin Access</h1>
          <p className="font-body text-sm text-muted-foreground">Enter the admin password.</p>
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
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <h1 className="font-serif text-3xl text-foreground">Admin</h1>
          <button
            onClick={logOut}
            className="px-4 py-2 font-body text-xs uppercase tracking-[0.25em] text-muted-foreground hover:text-foreground transition-colors"
          >
            Log out
          </button>
        </div>

        <div className="flex gap-2 border-b border-border mb-8">
          <button
            onClick={() => setTab("reservations")}
            className={`px-5 py-3 font-body text-xs uppercase tracking-[0.25em] border-b-2 transition-colors ${
              tab === "reservations"
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Reservations
          </button>
          <button
            onClick={() => setTab("travel")}
            className={`px-5 py-3 font-body text-xs uppercase tracking-[0.25em] border-b-2 transition-colors ${
              tab === "travel"
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Travel Confirmations
          </button>
        </div>

        {tab === "reservations" ? <AdminReservations embedded /> : <AdminShuttle embedded />}
      </div>
    </div>
  );
};

export default Admin;
