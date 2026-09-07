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
}
