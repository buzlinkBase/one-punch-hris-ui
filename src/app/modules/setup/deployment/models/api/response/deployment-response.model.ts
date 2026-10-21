export type DeploymentRole = "Regular" | "Reliever" | "Augmentation";

export interface ClientSiteResponse {
  id: string;
  clientId: string;
  code: string;
  name: string;
  areaId: string;
  areaName: string;
  subAreaLabel: string | null;
  startDate: string | null;
  endDate: string | null;
  postCount: number;
  /** People the site's posts need today. */
  requiredHeadcount: number;
  /** Regular personnel deployed to the site's posts today. */
  deployedHeadcount: number;
}

export interface PostRequirementResponse {
  id: string;
  postId: string;
  shiftLabel: string;
  timeShiftId: string | null;
  startTime: string | null;
  endTime: string | null;
  requiredHeadcount: number;
  /** Empty = every day. */
  daysOfWeek: string[];
  effectiveFrom: string;
  effectiveTo: string | null;
}

export interface ClientPostResponse {
  id: string;
  clientSiteId: string;
  code: string;
  name: string;
  position: string;
  armed: boolean;
  notes: string | null;
  currentRequirements: PostRequirementResponse[];
  requirements: PostRequirementResponse[];
  deployedRegulars: number;
}

export interface DeploymentResponse {
  id: string;
  employeeId: string;
  employeeNo: string;
  employeeName: string;
  postId: string;
  postName: string;
  clientSiteId: string;
  siteName: string;
  clientId: string;
  clientName: string;
  role: DeploymentRole;
  startDate: string;
  endDate: string | null;
  reason: string | null;
  eventTag: string | null;
  active: boolean;
}

export interface CoverageRow {
  siteId: string;
  siteName: string;
  postId: string;
  postName: string;
  position: string;
  /** The day's shifts and their headcount, e.g. "DS 2 · NS 1". */
  shifts: string;
  required: number;
  regulars: number;
  relievers: number;
  augmentation: number;
  /** Required minus regulars and relievers; negative = more than needed. */
  gap: number;
}

export interface CoverageReport {
  clientId: string;
  date: string;
  required: number;
  deployed: number;
  gap: number;
  rows: CoverageRow[];
}
