import httpClient from "@/core/http/http-client";
import { API_PREFIX, buildApiUrl } from "@/core/http/api-url.util";
import type { DashboardOverview } from "../models/api/response/dashboard-response.model";

const ENDPOINT = buildApiUrl(API_PREFIX.hrms, "dashboard/overview");

const DEPARTMENT_NAMES = ["HR", "Finance", "Operations", "IT", "Sales"];

const MOCK_DATA: DashboardOverview = {
  stats: {
    totalEmployees: 248,
    presentToday: 211,
    lateToday: 14,
    absentToday: 9,
    onLeaveToday: 14,
    pendingRequests: 7,
    newHiresThisMonth: 5,
  },
  attendanceTrend: Array.from({ length: 7 }, (_, i) => {
    const day = dayLabel(i);
    return {
      date: day,
      present: 190 + ((i * 7) % 30),
      late: 8 + ((i * 3) % 12),
      absent: 4 + ((i * 2) % 8),
    };
  }),
  departmentHeadcount: DEPARTMENT_NAMES.map((name, i) => ({
    departmentId: `dept-${i + 1}`,
    departmentName: name,
    headcount: [64, 38, 72, 41, 33][i],
  })),
  upcomingHolidays: [
    {
      id: "hol-1",
      name: "National Heroes Day",
      date: "2026-08-31",
      type: "Regular",
    },
    {
      id: "hol-2",
      name: "All Saints' Day",
      date: "2026-11-01",
      type: "Special",
    },
    { id: "hol-3", name: "Bonifacio Day", date: "2026-11-30", type: "Regular" },
    { id: "hol-4", name: "Christmas Day", date: "2026-12-25", type: "Regular" },
  ],
  recentActivity: [
    {
      id: "act-1",
      type: "punch-in",
      employeeName: "Maria Santos",
      description: "Punched in for the morning shift",
      timestamp: "2026-07-12T08:02:00Z",
    },
    {
      id: "act-2",
      type: "leave-request",
      employeeName: "Juan Dela Cruz",
      description: "Filed a leave request for 3 days",
      timestamp: "2026-07-12T07:41:00Z",
    },
    {
      id: "act-3",
      type: "new-hire",
      employeeName: "Angela Reyes",
      description: "Onboarded as Payroll Associate",
      timestamp: "2026-07-11T16:15:00Z",
    },
    {
      id: "act-4",
      type: "schedule-change",
      employeeName: "Mark Villanueva",
      description: "Requested a rest day change",
      timestamp: "2026-07-11T14:03:00Z",
    },
    {
      id: "act-5",
      type: "document",
      employeeName: "Kristine Bautista",
      description: "Uploaded updated government ID",
      timestamp: "2026-07-11T10:27:00Z",
    },
  ],
  pendingRequests: [
    {
      id: "req-1",
      type: "leave",
      employeeName: "Juan Dela Cruz",
      submittedAt: "2026-07-12T07:41:00Z",
      status: "pending",
    },
    {
      id: "req-2",
      type: "change-rest-day",
      employeeName: "Mark Villanueva",
      submittedAt: "2026-07-11T14:03:00Z",
      status: "pending",
    },
    {
      id: "req-3",
      type: "overtime",
      employeeName: "Liza Fernandez",
      submittedAt: "2026-07-11T09:12:00Z",
      status: "pending",
    },
    {
      id: "req-4",
      type: "work-rotation",
      employeeName: "Paolo Ramos",
      submittedAt: "2026-07-10T17:30:00Z",
      status: "pending",
    },
  ],
};

function dayLabel(offsetFromMonday: number): string {
  const labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  return labels[offsetFromMonday % labels.length];
}

export const dashboardApi = {
  async getOverview(): Promise<DashboardOverview> {
    try {
      const data = await httpClient.getUnwrapped<DashboardOverview>(ENDPOINT);
      return data ?? MOCK_DATA;
    } catch {
      return MOCK_DATA;
    }
  },
};
