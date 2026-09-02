import type { GeoJsonPolygon } from "@/shared/types/geo.types";

export interface CreateOperationArea {
  code: string;
  name: string;
  address: string;
  boundary: GeoJsonPolygon | null;
  status: string;
  branchId: string | null;
}
