import type { GeoJsonPolygon } from "@/shared/types/geo.types";
import type { MobilePunchMode } from "@/shared/constants/mobile-punch-mode.const";

export interface OperationAreaResponse {
  id: string;
  code: string;
  name: string;
  address: string;
  boundary: GeoJsonPolygon | null;
  status: string;
  branchId: string | null;
  branchName?: string | null;
  branchCode?: string | null;
  clientId?: string | null;
  clientName?: string | null;
  headEmployeeId?: string | null;
  /** Null = follows the site's branch. */
  punchMode?: MobilePunchMode | null;
}
