import type { Dayjs } from "dayjs";
import type { DrillTarget } from "@/shared/drilldown/drill-target";
import {
  CURRENT_STAFF,
  applicationListTarget,
  dtrTarget,
  employeeListTarget,
  type ApplicationKind,
  type EmployeeDrillFilter,
} from "@/shared/drilldown/drill-screens";
import {
  DRILL_DATE_FORMAT,
  dayRange,
  isIsoDate,
  tenureHireRange,
} from "@/shared/drilldown/drill-search.util";
import type {
  DashboardCount,
  DashboardStats,
  DepartmentHeadcount,
  PendingRequest,
  PendingRequestType,
} from "../models/api/response/dashboard-response.model";

// Where each Dashboard figure drills into. Whether the person may open it is useDrillDown's call;
// null here means the figure has no list behind it.

/** The workforce charts count current staff. */
function currentStaff(filter: EmployeeDrillFilter): DrillTarget {
  return employeeListTarget({ ...CURRENT_STAFF, ...filter });
}

/** The tiles, given today on the Philippine clock (the days the API counts in). */
export function statDrill(
  key: keyof DashboardStats,
  today: Dayjs,
): DrillTarget | null {
  switch (key) {
    case "totalEmployees":
      return employeeListTarget({});
    case "newHiresThisMonth":
      return employeeListTarget({
        hireDateFrom: today.startOf("month").format(DRILL_DATE_FORMAT),
      });
    case "presentToday":
    case "lateToday":
    case "absentToday":
      return dtrTarget(dayRange(today));
    case "onLeaveToday":
      return applicationListTarget("leave", {
        range: dayRange(today),
        tab: "processed",
      });
    // Leave and overtime together -- no one list holds both.
    case "pendingRequests":
      return null;
  }
}

/** One day of the last-7-days chart. */
export function attendanceDayDrill(
  workDate: string | undefined,
): DrillTarget | null {
  return isIsoDate(workDate)
    ? dtrTarget({ from: workDate, to: workDate })
    : null;
}

export function departmentDrill(row: DepartmentHeadcount): DrillTarget {
  return currentStaff({ departmentIds: [row.departmentId] });
}

export function branchDrill(row: DashboardCount): DrillTarget | null {
  return row.key ? currentStaff({ branchIds: [row.key] }) : null;
}

export function siteDrill(row: DashboardCount): DrillTarget | null {
  return row.key ? currentStaff({ areaIds: [row.key] }) : null;
}

export function employmentStatusDrill(row: DashboardCount): DrillTarget | null {
  return row.key ? currentStaff({ employmentStatuses: [row.key] }) : null;
}

export function tenureDrill(
  row: DashboardCount,
  today: Dayjs,
): DrillTarget | null {
  const hired = row.key ? tenureHireRange(row.key, today) : null;
  return hired ? currentStaff(hired) : null;
}

const PENDING_LIST: Record<PendingRequestType, ApplicationKind | null> = {
  leave: "leave",
  overtime: "overtime",
  "official-business": "officialBusiness",
  "change-rest-day": "changeRestDay",
  "change-holiday": "changeHoliday",
  "work-rotation": "workRotation",
  // The undertime list isn't in the app yet.
  undertime: null,
};

/** A pending request opens its list on the Pending tab. */
export function pendingRequestDrill(
  request: PendingRequest,
): DrillTarget | null {
  const kind = PENDING_LIST[request.type];
  return kind ? applicationListTarget(kind, { tab: "pending" }) : null;
}
