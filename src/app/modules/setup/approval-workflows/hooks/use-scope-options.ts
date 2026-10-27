import { useCallback } from "react";
import { useBranches } from "@/app/modules/setup/branch/hooks/use-branch-queries";
import { useDepartments } from "@/app/modules/setup/department/hooks/use-department-queries";
import { useClients } from "@/app/modules/setup/client/hooks/use-client-queries";
import { useOperationAreas } from "@/app/modules/setup/operation-area/hooks/use-operation-area-queries";
import { usePayrollGroups } from "@/app/modules/setup/payroll-group/hooks/use-payroll-group-queries";
import { usePositions } from "@/app/modules/setup/position/hooks/use-position-queries";
import { useSections } from "@/app/modules/setup/section/hooks/use-section-queries";
import { useEmployeeFilter } from "@/app/modules/timekeeping/attendance-entry/hooks/use-attendance-entry-queries";
import { useLeaveTypes } from "@/app/modules/setup/leave-type/hooks/use-leave-type-queries";
import { EMPLOYMENT_STATUS_OPTIONS } from "@/app/modules/setup/employee/constants/label.const";
import type { ApprovalScopeDimension } from "../models/api/approval-scope.model";

export interface ScopeOption {
  value: string;
  label: string;
}

interface Named {
  id: string;
  code?: string | null;
  name: string;
}

const toOptions = (items: Named[]): ScopeOption[] =>
  items.map((i) => ({
    value: i.id,
    label: i.code ? `${i.code} - ${i.name}` : i.name,
  }));

/**
 * The pickable values for every scope dimension, plus a label lookup (used to describe a
 * workflow's conditions in the list). Reuses the setup lists the rest of the app already caches.
 */
export function useScopeOptions() {
  const { data: branches = [] } = useBranches();
  const { data: departments = [] } = useDepartments();
  const { data: clients = [] } = useClients();
  const { data: areas = [] } = useOperationAreas();
  const { data: payrollGroups = [] } = usePayrollGroups();
  const { data: positions = [] } = usePositions();
  const { data: sections = [] } = useSections();
  const { data: employees = [] } = useEmployeeFilter();
  const { data: leaveTypes = [] } = useLeaveTypes();

  const options: Record<ApprovalScopeDimension, ScopeOption[]> = {
    Branch: toOptions(branches),
    Department: toOptions(departments),
    Client: toOptions(clients),
    Area: toOptions(areas),
    PayrollGroup: toOptions(payrollGroups),
    Position: toOptions(positions),
    Section: toOptions(sections),
    EmploymentStatus: EMPLOYMENT_STATUS_OPTIONS.map((o) => ({
      value: o.value,
      label: o.label,
    })),
    Employee: employees.map((e) => ({ value: e.id, label: e.name ?? e.id })),
    LeaveType: leaveTypes.map((l) => ({
      value: l.id,
      label: l.code ? `${l.code} - ${l.description}` : l.description,
    })),
  };

  const labelFor = useCallback(
    (dimension: ApprovalScopeDimension, value: string): string =>
      options[dimension].find((o) => o.value === value)?.label ??
      `${value.slice(0, 8)}…`,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      branches,
      departments,
      clients,
      areas,
      payrollGroups,
      positions,
      sections,
      employees,
      leaveTypes,
    ],
  );

  return { options, labelFor };
}
