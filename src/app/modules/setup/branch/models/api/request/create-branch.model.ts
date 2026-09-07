import type { GeoJsonPolygon } from "@/shared/types/geo.types";

export interface CreateBranch {
  code: string;
  name: string;
  address: string | null;
  boundary: GeoJsonPolygon | null;
  status: string;
  // DOLE regional wage order region — used to look up the applicable Minimum Wage Rate for
  // BIR 1601-C. See src/shared/constants/ph-regions.const.ts.
  regionCode?: string | null;
  // Sector/class this establishment is registered under (e.g. "Non-Agriculture",
  // "Retail/Service establishments employing 10 workers or less") — matched against the
  // Minimum Wage Rate entries for the same region. Null = unspecified, falls back to the
  // region's general (class-less) rate.
  wageOrderClass?: string | null;
}
