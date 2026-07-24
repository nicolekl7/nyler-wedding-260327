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
  char: ["charlene"], charlene: ["char"],
  wes: ["wesley"], wesley: ["wes"],
  dan: ["daniel"], daniel: ["dan"],
  lexie: ["alexandra"], alexandra: ["lexie"],
  vic: ["victor"], victor: ["vic"],
  ben: ["benjamin"], benjamin: ["ben"],
  michal: ["micha"], micha: ["michal"],
  pat: ["patrick"], patrick: ["pat"],
  waldek: ["waldemar"], waldemar: ["waldek"],
  art: ["arthur"], arthur: ["art"],
  bob: ["robert"], robert: ["bob"],
  val: ["valerie"], valerie: ["val"],
  nim: ["naima"], naima: ["nim"],
  kait: ["kaitlyn"], kaitlyn: ["kait"],
  hal: ["haldun"], haldun: ["hal"],
};

export const norm = (s: string) =>
  (s || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const nameTokens = (full: string) => norm(full).split(" ").filter(Boolean);

const firstMatches = (a: string, b: string) => {
  if (!a || !b) return false;
  if (a === b) return true;
  if (a.length >= 3 && b.length >= 3 && (a.startsWith(b) || b.startsWith(a))) return true;
  if ((NICKNAMES[a] || []).includes(b)) return true;
  if ((NICKNAMES[b] || []).includes(a)) return true;
  return false;
};

export const namesMatch = (a: string, b: string) => {
  const aTokens = nameTokens(a);
  const bTokens = nameTokens(b);
  if (aTokens.length === 0 || bTokens.length === 0) return false;

  const A = { first: aTokens[0], last: aTokens[aTokens.length - 1] };
  const B = { first: bTokens[0], last: bTokens[bTokens.length - 1] };

  // A bare first name (no last name typed, e.g. informally-entered guest lists) can't be
  // compared on last name at all — fall back to matching first name alone in that case.
  if (aTokens.length === 1 || bTokens.length === 1) {
    return firstMatches(A.first, B.first);
  }

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
