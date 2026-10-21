import type { DeploymentRole } from "../response/deployment-response.model";

export interface ClientSiteRequest {
  code: string;
  name: string;
  areaId: string;
  subAreaLabel: string | null;
  startDate: string | null;
  endDate: string | null;
}

export interface ClientPostRequest {
  code: string;
  name: string;
  position: string;
  armed: boolean;
  notes: string | null;
}

export interface PostRequirementRequest {
  shiftLabel: string;
  timeShiftId: string | null;
  startTime: string | null;
  endTime: string | null;
  requiredHeadcount: number;
  daysOfWeek: string[];
  effectiveFrom: string;
  effectiveTo: string | null;
}

export interface AssignDeploymentRequest {
  employeeId: string;
  postId: string;
  role: DeploymentRole;
  startDate: string;
  endDate: string | null;
  reason: string | null;
  eventTag: string | null;
}

export interface EndDeploymentRequest {
  endDate: string;
  reason: string | null;
}

export interface DeploymentListQuery {
  clientId?: string;
  siteId?: string;
  postId?: string;
  employeeId?: string;
  activeOn?: string;
}
