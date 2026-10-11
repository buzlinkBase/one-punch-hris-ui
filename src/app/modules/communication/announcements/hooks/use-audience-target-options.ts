import { useMemo } from "react";
import type { AudienceRuleKind } from "@/shared/types/announcement.model";
import { useDepartments } from "@/app/modules/setup/department/hooks/use-department-queries";
import { usePositions } from "@/app/modules/setup/position/hooks/use-position-queries";
import { useBranches } from "@/app/modules/setup/branch/hooks/use-branch-queries";
import { useOperationAreas } from "@/app/modules/setup/operation-area/hooks/use-operation-area-queries";
import { useClients } from "@/app/modules/setup/client/hooks/use-client-queries";
import { useSections } from "@/app/modules/setup/section/hooks/use-section-queries";
import { useEmployeeFilter } from "@/app/modules/timekeeping/attendance-entry/hooks/use-attendance-entry-queries";
import { EMPLOYMENT_STATUS_OPTIONS } from "@/app/modules/setup/employee/constants/label.const";

export interface TargetOption {
  value: string;
  label: string;
}

const codeAndName = (x: { id: string; code?: string; name: string }) => ({
  value: x.id,
  label: x.code ? `${x.code} - ${x.name}` : x.name,
});

/** Target choices for each audience rule kind, from the existing setup lookups. */
export function useAudienceTargetOptions(enabled = true) {
  const { data: departments = [], isLoading: l1 } = useDepartments();
  const { data: positions = [], isLoading: l2 } = usePositions();
  const { data: branches = [], isLoading: l3 } = useBranches();
  const { data: sites = [], isLoading: l4 } = useOperationAreas();
  const { data: clients = [], isLoading: l5 } = useClients();
  const { data: sections = [], isLoading: l6 } = useSections();
  const { data: employees = [], isLoading: l7 } = useEmployeeFilter(
    {},
    { enabled },
  );

  const options = useMemo<Record<AudienceRuleKind, TargetOption[]>>(
    () => ({
      AllEmployees: [],
      Department: departments.map(codeAndName),
      Position: positions.map((p) => ({ value: p.id, label: p.name })),
      Branch: branches.map(codeAndName),
      ProjectSite: sites.map(codeAndName),
      Client: clients.map(codeAndName),
      Section: sections.map(codeAndName),
      EmploymentStatus: EMPLOYMENT_STATUS_OPTIONS,
      Employee: employees.map((e) => ({ value: e.id, label: e.name ?? e.id })),
    }),
    [departments, positions, branches, sites, clients, sections, employees],
  );

  return {
    options,
    isLoading: l1 || l2 || l3 || l4 || l5 || l6 || l7,
  };
}
