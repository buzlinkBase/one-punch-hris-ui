export type ShiftPhase = "Upcoming" | "InProgress" | "Ended";
export type GuardLiveStatus = "OnDuty" | "Late" | "Undertime" | "OffDuty";

export interface LiveTiles {
  required: number;
  present: number;
  onDuty: number;
  late: number;
  undertime: number;
  notYetIn: number;
  absent: number;
  short: number;
  /** Share of the people needed on started shifts who clocked in (0–1); null before any shift starts. */
  fillRate: number | null;
}

export interface LiveGuard {
  guardId: string;
  guardName: string;
  role: string | null;
  status: GuardLiveStatus;
  in: string;
  out: string | null;
  lateMinutes: number;
  undertimeMinutes: number;
}

export interface LiveShift {
  shiftId: string;
  siteId: string;
  siteName: string;
  postId: string;
  postName: string;
  position: string | null;
  shiftName: string;
  workDate: string;
  start: string | null;
  end: string | null;
  phase: ShiftPhase;
  required: number;
  present: number;
  onDuty: number;
  late: number;
  undertime: number;
  notYetIn: number;
  absent: number;
  short: number;
  guards: LiveGuard[];
}

export interface LiveMissing {
  guardId: string;
  guardName: string;
  postId: string;
  postName: string;
  siteName: string;
  role: string;
  absent: boolean;
}

export interface LivePunch {
  id: string;
  at: string;
  guardName: string;
  siteName: string;
  postName: string | null;
  source: string;
  device: string | null;
}

export interface LiveToday {
  clientId: string;
  date: string;
  asOf: string;
  hasPlan: boolean;
  tiles: LiveTiles;
  shifts: LiveShift[];
  missing: LiveMissing[];
  log: LivePunch[];
}

export interface AgencyClientLive {
  clientId: string;
  clientName: string;
  tiles: LiveTiles;
  uncovered: number;
}

export interface UncoveredShift {
  clientId: string;
  clientName: string;
  shiftId: string;
  siteName: string;
  postName: string;
  shiftName: string;
  start: string | null;
  required: number;
  present: number;
  short: number;
}

export interface AgencyLive {
  asOf: string;
  tiles: LiveTiles;
  clients: AgencyClientLive[];
  uncovered: UncoveredShift[];
}
