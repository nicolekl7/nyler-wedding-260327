import { useEffect, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const VERIFIED_KEY = "guestVerified";

interface EntryGateProps {
  children: ReactNode;
}

const EntryGate = ({ children }: EntryGateProps) => {
  const [verified, setVerified] = useState(false);
  const [checkingStorage, setCheckingStorage] = useState(true);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (localStorage.getItem(VERIFIED_KEY) === "true") {
      setVerified(true);
    }
    setCheckingStorage(false);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const parts = name.trim().toLowerCase().split(/\s+/);
    if (parts.length < 2) {
      toast.error("Please enter your full first and last name");
      return;
    }

    const firstName = parts[0];
    const lastName = parts.slice(1).join(" ");

    setLoading(true);

    const { data: match } = await supabase
      .from("guests")
      .select("*")
      .ilike("first_name", firstName)
      .ilike("last_name", lastName)
      .limit(1);

    setLoading(false);

    if (!match || match.length === 0) {
      toast.error("We couldn't find your name on the guest list. Please try again.");
      return;
    }

    localStorage.setItem(VERIFIED_KEY, "true");
    setVerified(true);
  };

  if (checkingStorage) {
    return <div className="min-h-screen bg-white" />;
  }

  if (verified) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-white px-6">
      <div className="max-w-md w-full text-center">
        <h1 className="font-serif text-3xl md:text-4xl text-foreground mb-6 tracking-wide">
          Benvenuti!
        </h1>
        <p className="font-serif text-base md:text-lg text-foreground/80 mb-8 leading-relaxed">
          To access Nicole &amp; Tyler's wedding website, please verify your guest identity by
          entering your full name below.
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col items-center gap-4">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Full Name"
            className="w-full text-center font-body text-base border-b border-foreground/30 focus:border-foreground/70 outline-none py-2 bg-transparent transition-colors"
            autoFocus
          />
          <button
            type="submit"
            disabled={loading}
            className="mt-2 px-8 py-2 font-body text-sm uppercase tracking-widest border border-foreground/40 text-foreground hover:bg-foreground hover:text-white transition-colors disabled:opacity-50"
          >
            {loading ? "Verifying..." : "Enter"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EntryGate;
