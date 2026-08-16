import { lazy } from "react";
import type { ComponentType, LazyExoticComponent } from "react";

const DepartmentList = lazy(
  () => import("@/app/modules/setup/department/pages/department-list"),
);
const DepartmentDetail = lazy(
  () => import("@/app/modules/setup/department/pages/department-detail"),
);

const EmployeeList = lazy(
  () => import("@/app/modules/setup/employee/pages/employee-list"),
);
const EmployeeDetail = lazy(
  () => import("@/app/modules/setup/employee/pages/employee-detail"),
);

const HolidayList = lazy(
  () => import("@/app/modules/setup/holiday/pages/holiday-list"),
);
const HolidayDetail = lazy(
  () => import("@/app/modules/setup/holiday/pages/holiday-detail"),
);

const OperationAreaList = lazy(
  () => import("@/app/modules/setup/operation-area/pages/operation-area-list"),
);
const OperationAreaDetail = lazy(
  () =>
    import("@/app/modules/setup/operation-area/pages/operation-area-detail"),
);

const PayrollGroupList = lazy(
  () => import("@/app/modules/setup/payroll-group/pages/payroll-group-list"),
);
const PayrollGroupDetail = lazy(
  () => import("@/app/modules/setup/payroll-group/pages/payroll-group-detail"),
);

const FixedTimeShiftList = lazy(
  () =>
    import("@/app/modules/setup/time-shift/fixed/pages/fixed-time-shift-list"),
);
const FixedTimeShiftDetail = lazy(
  () =>
    import("@/app/modules/setup/time-shift/fixed/pages/fixed-time-shift-detail"),
);

const SplitTimeShiftList = lazy(
  () =>
    import("@/app/modules/setup/time-shift/split/pages/split-time-shift-list"),
);
const SplitTimeShiftDetail = lazy(
  () =>
    import("@/app/modules/setup/time-shift/split/pages/split-time-shift-detail"),
);

const FlexiTimeShiftList = lazy(
  () =>
    import("@/app/modules/setup/time-shift/flexi/pages/flexi-time-shift-list"),
);
const FlexiTimeShiftDetail = lazy(
  () =>
    import("@/app/modules/setup/time-shift/flexi/pages/flexi-time-shift-detail"),
);

const DeductionList = lazy(
  () => import("@/app/modules/setup/deduction/pages/deduction-list"),
);
const DeductionDetail = lazy(
  () => import("@/app/modules/setup/deduction/pages/deduction-detail"),
);

const DeductionTypeList = lazy(
  () => import("@/app/modules/setup/deduction-type/pages/deduction-type-list"),
);
const DeductionTypeDetail = lazy(
  () =>
    import("@/app/modules/setup/deduction-type/pages/deduction-type-detail"),
);

const ClientList = lazy(
  () => import("@/app/modules/setup/client/pages/client-list"),
);
const ClientDetail = lazy(
  () => import("@/app/modules/setup/client/pages/client-detail"),
);

const SectionList = lazy(
  () => import("@/app/modules/setup/section/pages/section-list"),
);
const SectionDetail = lazy(
  () => import("@/app/modules/setup/section/pages/section-detail"),
);

const BranchList = lazy(
  () => import("@/app/modules/setup/branch/pages/branch-list"),
);
const BranchDetail = lazy(
  () => import("@/app/modules/setup/branch/pages/branch-detail"),
);

const PositionList = lazy(
  () => import("@/app/modules/setup/position/pages/position-list"),
);
const PositionDetail = lazy(
  () => import("@/app/modules/setup/position/pages/position-detail"),
);

const LeaveTypeList = lazy(
  () => import("@/app/modules/setup/leave-type/pages/leave-type-list"),
);
const LeaveTypeDetail = lazy(
  () => import("@/app/modules/setup/leave-type/pages/leave-type-detail"),
);

const CompanyPolicy = lazy(
  () =>
    import("@/app/modules/setup/company-policy/pages/company-policy/company-policy"),
);

export interface SetupRouteConfig {
  path: string;
  component: LazyExoticComponent<ComponentType>;
}

export const setupRoutes: SetupRouteConfig[] = [
  { path: "department", component: DepartmentList },
  { path: "department/create", component: DepartmentDetail },
  { path: "department/$id", component: DepartmentDetail },

  { path: "employee", component: EmployeeList },
  { path: "employee/create", component: EmployeeDetail },
  { path: "employee/$id", component: EmployeeDetail },

  { path: "holiday", component: HolidayList },
  { path: "holiday/create", component: HolidayDetail },
  { path: "holiday/$id", component: HolidayDetail },

  { path: "project-site", component: OperationAreaList },
  { path: "project-site/create", component: OperationAreaDetail },
  { path: "project-site/$id", component: OperationAreaDetail },

  { path: "payroll-group", component: PayrollGroupList },
  { path: "payroll-group/create", component: PayrollGroupDetail },
  { path: "payroll-group/$id", component: PayrollGroupDetail },

  { path: "time-shift/fixed", component: FixedTimeShiftList },
  { path: "time-shift/fixed/create", component: FixedTimeShiftDetail },
  { path: "time-shift/fixed/$id", component: FixedTimeShiftDetail },

  { path: "time-shift/split", component: SplitTimeShiftList },
  { path: "time-shift/split/create", component: SplitTimeShiftDetail },
  { path: "time-shift/split/$id", component: SplitTimeShiftDetail },

  { path: "time-shift/flexi", component: FlexiTimeShiftList },
  { path: "time-shift/flexi/create", component: FlexiTimeShiftDetail },
  { path: "time-shift/flexi/$id", component: FlexiTimeShiftDetail },

  { path: "deduction", component: DeductionList },
  { path: "deduction/create", component: DeductionDetail },
  { path: "deduction/$id", component: DeductionDetail },

  { path: "deduction-type", component: DeductionTypeList },
  { path: "deduction-type/create", component: DeductionTypeDetail },
  { path: "deduction-type/$id", component: DeductionTypeDetail },

  { path: "client", component: ClientList },
  { path: "client/create", component: ClientDetail },
  { path: "client/$id", component: ClientDetail },

  { path: "section", component: SectionList },
  { path: "section/create", component: SectionDetail },
  { path: "section/$id", component: SectionDetail },

  { path: "branch", component: BranchList },
  { path: "branch/create", component: BranchDetail },
  { path: "branch/$id", component: BranchDetail },

  { path: "position", component: PositionList },
  { path: "position/create", component: PositionDetail },
  { path: "position/$id", component: PositionDetail },

  { path: "leave-type", component: LeaveTypeList },
  { path: "leave-type/create", component: LeaveTypeDetail },
  { path: "leave-type/$id", component: LeaveTypeDetail },

  { path: "company-policy", component: CompanyPolicy },
];
