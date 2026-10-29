import type { GeoJsonPolygon } from "@/shared/types/geo.types";
import type { MobilePunchMode } from "@/shared/constants/mobile-punch-mode.const";

export interface BranchResponse {
  id: string;
  code: string;
  name: string;
  address: string | null;
  boundary: GeoJsonPolygon | null;
  status: string;
  regionCode?: string | null;
  wageOrderClass?: string | null;
  headEmployeeId?: string | null;
  punchMode?: MobilePunchMode;
}
