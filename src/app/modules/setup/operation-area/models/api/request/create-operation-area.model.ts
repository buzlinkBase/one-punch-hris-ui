import type { GeoJsonPolygon } from "@/shared/types/geo.types";

export interface CreateOperationArea {
  code: string;
  name: string;
  address: string;
  boundary: GeoJsonPolygon | null;
  status: string;
  branchId: string | null;
  /** The employee who heads this site (what an approval step "Applicant's project site head" resolves to). */
  headEmployeeId?: string | null;
}
