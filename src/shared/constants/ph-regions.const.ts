// Philippine DOLE regional wage-order regions — a fixed, rarely-changing list, so this is a
// hardcoded lookup rather than a database-managed Setup entity. Used by Setup > Branch (which
// region a branch's employees fall under) and Setup > Minimum Wage Rate (which region a rate
// applies to) for BIR 1601-C Minimum-Wage-Earner classification.
export const PH_REGION_OPTIONS = [
  { value: "NCR", label: "NCR — National Capital Region" },
  { value: "CAR", label: "CAR — Cordillera Administrative Region" },
  { value: "I", label: "Region I — Ilocos Region" },
  { value: "II", label: "Region II — Cagayan Valley" },
  { value: "III", label: "Region III — Central Luzon" },
  { value: "IV-A", label: "Region IV-A — CALABARZON" },
  { value: "MIMAROPA", label: "MIMAROPA Region" },
  { value: "V", label: "Region V — Bicol Region" },
  { value: "VI", label: "Region VI — Western Visayas" },
  { value: "VII", label: "Region VII — Central Visayas" },
  { value: "VIII", label: "Region VIII — Eastern Visayas" },
  { value: "IX", label: "Region IX — Zamboanga Peninsula" },
  { value: "X", label: "Region X — Northern Mindanao" },
  { value: "XI", label: "Region XI — Davao Region" },
  { value: "XII", label: "Region XII — SOCCSKSARGEN" },
  { value: "XIII", label: "Region XIII — Caraga" },
  { value: "BARMM", label: "BARMM — Bangsamoro Autonomous Region" },
] as const;

export const PH_REGION_NAME: Record<string, string> = Object.fromEntries(
  PH_REGION_OPTIONS.map((r) => [r.value, r.label]),
);
