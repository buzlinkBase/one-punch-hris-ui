export interface DashboardStats {
  totalEmployees: number;
  presentToday: number;
  lateToday: number;
  absentToday: number;
  onLeaveToday: number;
  pendingRequests: number;
  newHiresThisMonth: number;
}

export interface AttendanceTrendPoint {
  date: string;
  present: number;
  late: number;
  absent: number;
}

export interface DepartmentHeadcount {
  departmentId: string;
  departmentName: string;
  headcount: number;
}

export interface UpcomingHoliday {
  id: string;
  name: string;
  date: string;
  type: string;
}

export type ActivityType =
  | "punch-in"
  | "punch-out"
  | "leave-request"
  | "new-hire"
  | "schedule-change"
  | "document";

export interface RecentActivity {
  id: string;
  type: ActivityType;
  employeeName: string;
  description: string;
  timestamp: string;
}

export type PendingRequestType =
  "leave" | "change-rest-day" | "change-holiday" | "work-rotation" | "overtime";

export interface PendingRequest {
  id: string;
  type: PendingRequestType;
  employeeName: string;
  submittedAt: string;
  status: "pending" | "approved" | "rejected";
}

export interface DashboardOverview {
  stats: DashboardStats;
  attendanceTrend: AttendanceTrendPoint[];
  departmentHeadcount: DepartmentHeadcount[];
  upcomingHolidays: UpcomingHoliday[];
  recentActivity: RecentActivity[];
  pendingRequests: PendingRequest[];
}
