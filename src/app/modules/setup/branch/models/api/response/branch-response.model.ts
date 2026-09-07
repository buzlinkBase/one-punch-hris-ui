import type { GeoJsonPolygon } from "@/shared/types/geo.types";

export interface BranchResponse {
  id: string;
  code: string;
  name: string;
  address: string | null;
  boundary: GeoJsonPolygon | null;
  status: string;
  regionCode?: string | null;
}
