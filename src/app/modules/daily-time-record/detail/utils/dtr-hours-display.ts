// DTR screens hide the ND-OT column and show its hours inside the familiar ones instead:
//   Hrs = Hrs + ND,  ND = ND + ND-OT,  OT = OT + ND-OT
// The backend's Hrs is regular work minus its night part, so Hrs + ND is all regular hours,
// ND + ND-OT all night hours, OT + ND-OT all overtime. Display only -- the API data is unchanged.

// Each day type's Hrs / OT / ND / ND-OT field names.
const GROUPS = [
  {
    label: "Regular",
    hrs: "regularNetHours",
    ot: "regularOTHours",
    nd: "regularNDHours",
    ndot: "regularNDOTHours",
  },
  {
    label: "Rest Day",
    hrs: "restDayHours",
    ot: "restDayOTHours",
    nd: "restDayNDHours",
    ndot: "restDayNDOTHours",
  },
  {
    label: "Legal Holiday",
    hrs: "legalHolHours",
    ot: "legalHolOTHours",
    nd: "legalHolNightDiffHours",
    ndot: "legalHolNightDiffOTHours",
  },
  {
    label: "Special Holiday",
    hrs: "specialHolHours",
    ot: "specialHolOTHours",
    nd: "specialHolNightDiffHours",
    ndot: "specialHolNightDiffOTHours",
  },
  {
    label: "Rest + Legal Day",
    hrs: "restLegalDayHours",
    ot: "restLegalDayOTHours",
    nd: "restLegalDayNDHours",
    ndot: "restLegalDayNDOTHours",
  },
  {
    label: "Rest + Special Day",
    hrs: "restSpecialDayHours",
    ot: "restSpecialDayOTHours",
    nd: "restSpecialDayNDHours",
    ndot: "restSpecialDayNDOTHours",
  },
  {
    label: "Double Legal Holiday",
    hrs: "doubleLegalHours",
    ot: "doubleLegalOTHours",
    nd: "doubleLegalNDHours",
    ndot: "doubleLegalNDOTHours",
  },
  {
    label: "Rest + Double Legal",
    hrs: "restDoubleLegalHours",
    ot: "restDoubleLegalOTHours",
    nd: "restDoubleLegalNDHours",
    ndot: "restDoubleLegalNDOTHours",
  },
] as const;

type Group = (typeof GROUPS)[number];
type HourKey = Group["hrs"] | Group["ot"] | Group["nd"] | Group["ndot"];

export type DtrHourFields = {
  [K in HourKey]?: number | null;
};

/** A display copy of a DTR row with ND-OT folded into Hrs, ND and OT. Never mutates `r`. */
export function toDisplayHours<T extends DtrHourFields>(r: T): T {
  const out: Record<string, unknown> = { ...r };
  for (const g of GROUPS) {
    const hrs = r[g.hrs] ?? 0;
    const ot = r[g.ot] ?? 0;
    const nd = r[g.nd] ?? 0;
    const ndot = r[g.ndot] ?? 0;
    out[g.hrs] = hrs + nd;
    out[g.nd] = nd + ndot;
    out[g.ot] = ot + ndot;
  }
  return out as T;
}

const displayCache = new WeakMap<object, unknown>();

/** toDisplayHours, computed once per row -- for per-cell callers like the export fmtCell. */
export function displayHoursOf<T extends DtrHourFields>(r: T): T {
  const cached = displayCache.get(r);
  if (cached) return cached as T;
  const display = toDisplayHours(r);
  displayCache.set(r, display);
  return display;
}
