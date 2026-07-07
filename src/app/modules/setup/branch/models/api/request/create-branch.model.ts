import type { GeoJsonPolygon } from "@/shared/types/geo.types";

export interface CreateBranch {
  code: string;
  name: string;
  address: string | null;
  boundary: GeoJsonPolygon | null;
  status: string;
}
