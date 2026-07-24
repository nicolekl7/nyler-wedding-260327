// ---------- name normalization + nickname matching ----------
const NICKNAMES: Record<string, string[]> = {
  ala: ["alicja"], alicja: ["ala"],
  bri: ["brianna"], brianna: ["bri"],
  nick: ["nicholas"], nicholas: ["nick"],
  ray: ["raymond"], raymond: ["ray"],
  mike: ["michael"], michael: ["mike"],
  tom: ["thomas"], thomas: ["tom"],
  cathy: ["catherine"], catherine: ["cathy"],
  fil: ["filip"], filip: ["fil"],
};

export const norm = (s: string) =>
  (s || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const firstLast = (full: string) => {
  const parts = norm(full).split(" ").filter(Boolean);
  if (parts.length === 0) return { first: "", last: "" };
  return { first: parts[0], last: parts[parts.length - 1] };
};

const firstMatches = (a: string, b: string) => {
  if (!a || !b) return false;
  if (a === b) return true;
  if (a.length >= 3 && b.length >= 3 && (a.startsWith(b) || b.startsWith(a))) return true;
  if ((NICKNAMES[a] || []).includes(b)) return true;
  if ((NICKNAMES[b] || []).includes(a)) return true;
  return false;
};

export const namesMatch = (a: string, b: string) => {
  const A = firstLast(a);
  const B = firstLast(b);
  if (!A.last || !B.last) return false;
  return A.last === B.last && firstMatches(A.first, B.first);
};

// Parse guest_names (JSON array string or comma/plus separated)
export const parseGuestList = (raw: string | null | undefined): string[] => {
  if (!raw) return [];
  const s = raw.trim();
  if (s.startsWith("[")) {
    try {
      const arr = JSON.parse(s);
      if (Array.isArray(arr)) return arr.map((x) => String(x).trim()).filter(Boolean);
    } catch { /* fall through */ }
  }
  return s.split(/[,;+&]|\band\b/i).map((x) => x.trim()).filter(Boolean);
};
