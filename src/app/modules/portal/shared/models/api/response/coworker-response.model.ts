/** Slim, coworker-safe view of an employee: never pay, DOB, age or government ids. */
export interface CoworkerCardResponse {
  id: string;
  fullName: string;
  profileImg: string;
  departmentName: string;
  positionName: string;
}

export interface AnniversaryResponse extends CoworkerCardResponse {
  years: number;
  daysUntil: number;
}

/** `note` is only "Out", "Half day" or "Away" — never the reason. */
export interface OutTodayResponse extends CoworkerCardResponse {
  note: string;
}

/** Email and contact are present only for employees who opted in. */
export interface DirectoryEntryResponse extends CoworkerCardResponse {
  branchName: string;
  email?: string | null;
  contact?: string | null;
}

export interface DirectoryPageResponse {
  items: DirectoryEntryResponse[];
  total: number;
}

export type OrgNodeKind = "company" | "department" | "section" | "employee";

/** One box in the org chart: the company, a department, a section or a person. */
export interface OrgNodeResponse {
  id: string;
  kind: OrgNodeKind;
  name: string;
  /** People only. */
  positionName: string;
  /** People only; higher is more senior. */
  level: number;
  /** People in this node, itself included for a person; the whole unit for a unit. */
  headCount: number;
  children: OrgNodeResponse[];
}

/** Which Coworkers widgets the company switched on. */
export interface CoworkerSettingsResponse {
  showNewHires: boolean;
  showAnniversaries: boolean;
  showWhosOut: boolean;
  showDirectory: boolean;
}
