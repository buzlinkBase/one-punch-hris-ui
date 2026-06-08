import { lazy } from "react";
import type { ComponentType, LazyExoticComponent } from "react";

const DepartmentList = lazy(
  () => import("@/app/modules/setup/department/pages/DepartmentList"),
);
const DepartmentDetail = lazy(
  () => import("@/app/modules/setup/department/pages/DepartmentDetail"),
);

const EmployeeList = lazy(
  () => import("@/app/modules/setup/employee/pages/EmployeeList"),
);
const EmployeeDetail = lazy(
  () => import("@/app/modules/setup/employee/pages/EmployeeDetail"),
);

const HolidayList = lazy(
  () => import("@/app/modules/setup/holiday/pages/HolidayList"),
);
const HolidayDetail = lazy(
  () => import("@/app/modules/setup/holiday/pages/HolidayDetail"),
);

const OperationAreaList = lazy(
  () => import("@/app/modules/setup/operation-area/pages/OperationAreaList"),
);
const OperationAreaDetail = lazy(
  () => import("@/app/modules/setup/operation-area/pages/OperationAreaDetail"),
);

const PayrollGroupList = lazy(
  () => import("@/app/modules/setup/payroll-group/pages/PayrollGroupList"),
);
const PayrollGroupDetail = lazy(
  () => import("@/app/modules/setup/payroll-group/pages/PayrollGroupDetail"),
);

const FixedTimeShiftList = lazy(
  () => import("@/app/modules/setup/time-shift/fixed/pages/FixedTimeShiftList"),
);
const FixedTimeShiftDetail = lazy(
  () =>
    import("@/app/modules/setup/time-shift/fixed/pages/FixedTimeShiftDetail"),
);

const FlexiTimeShiftList = lazy(
  () => import("@/app/modules/setup/time-shift/flexi/pages/FlexiTimeShiftList"),
);
const FlexiTimeShiftDetail = lazy(
  () =>
    import("@/app/modules/setup/time-shift/flexi/pages/FlexiTimeShiftDetail"),
);

const DeductionList = lazy(
  () => import("@/app/modules/setup/deduction/pages/DeductionList"),
);
const DeductionDetail = lazy(
  () => import("@/app/modules/setup/deduction/pages/DeductionDetail"),
);

const DeductionTypeList = lazy(
  () => import("@/app/modules/setup/deduction-type/pages/DeductionTypeList"),
);
const DeductionTypeDetail = lazy(
  () =>
    import("@/app/modules/setup/deduction-type/pages/DeductionTypeDetail"),
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

  { path: "operation-area", component: OperationAreaList },
  { path: "operation-area/create", component: OperationAreaDetail },
  { path: "operation-area/$id", component: OperationAreaDetail },

  { path: "payroll-group", component: PayrollGroupList },
  { path: "payroll-group/create", component: PayrollGroupDetail },
  { path: "payroll-group/$id", component: PayrollGroupDetail },

  { path: "time-shift/fixed", component: FixedTimeShiftList },
  { path: "time-shift/fixed/create", component: FixedTimeShiftDetail },
  { path: "time-shift/fixed/$id", component: FixedTimeShiftDetail },

  { path: "time-shift/flexi", component: FlexiTimeShiftList },
  { path: "time-shift/flexi/create", component: FlexiTimeShiftDetail },
  { path: "time-shift/flexi/$id", component: FlexiTimeShiftDetail },

  { path: "deduction", component: DeductionList },
  { path: "deduction/create", component: DeductionDetail },
  { path: "deduction/$id", component: DeductionDetail },

  { path: "deduction-type", component: DeductionTypeList },
  { path: "deduction-type/create", component: DeductionTypeDetail },
  { path: "deduction-type/$id", component: DeductionTypeDetail },
];
