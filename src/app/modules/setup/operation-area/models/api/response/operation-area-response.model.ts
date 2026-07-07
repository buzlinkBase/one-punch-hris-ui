import type { GeoJsonPolygon } from "@/shared/types/geo.types";

export interface OperationAreaResponse {
  id: string;
  code: string;
  name: string;
  address: string;
  boundary: GeoJsonPolygon | null;
  status: string;
}
