import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { employeeApi } from "../services/employee.api";
import type { EmployeeListQuery } from "../models/api/request/employee-list-query.model";
import { useClients } from "@/app/modules/setup/client/hooks/use-client-queries";
import { usePayrollGroups } from "@/app/modules/setup/payroll-group/hooks/use-payroll-group-queries";
import { useDepartments } from "@/app/modules/setup/department/hooks/use-department-queries";
import { useOperationAreas } from "@/app/modules/setup/operation-area/hooks/use-operation-area-queries";
import { useBranches } from "@/app/modules/setup/branch/hooks/use-branch-queries";
import { usePositions } from "@/app/modules/setup/position/hooks/use-position-queries";
import { useFixedTimeShifts } from "@/app/modules/setup/time-shift/fixed/hooks/use-fixed-time-shift-queries";
import { useSplitTimeShifts } from "@/app/modules/setup/time-shift/split/hooks/use-split-time-shift-queries";
import { useFlexiTimeShifts } from "@/app/modules/setup/time-shift/flexi/hooks/use-flexi-time-shift-queries";
import type { CreateEmployee } from "../models/api/request/create-employee.model";
import type { UpdateEmployee } from "../models/api/request/update-employee.model";
import type { EmployeeImportPreviewRow } from "../models/api/response/employee-import-preview-response.model";
import { QUERY_KEY as ATTENDANCE_ENTRY_QUERY_KEY } from "@/app/modules/timekeeping/attendance-entry/hooks/use-attendance-entry-queries";

const QUERY_KEY = ["employees"];

// attendance-entry's useEmployeeFilter() is the employee dropdown source for 20+
// other modules (DTR, applications, change-schedule, biometric) — it's backed by a
// separate endpoint/query key, so employee create/update/delete/upload must also
// invalidate it or those dropdowns keep showing pre-edit data until staleTime lapses.
function invalidateEmployeeFilter(
  queryClient: ReturnType<typeof useQueryClient>,
) {
  queryClient.invalidateQueries({ queryKey: ATTENDANCE_ENTRY_QUERY_KEY });
}

export function useEmployees(keyword?: string) {
  return useQuery({
    queryKey: [...QUERY_KEY, { keyword: keyword ?? "" }],
    queryFn: () => employeeApi.getAll(keyword),
  });
}

// Setup → Employee table: server-side paging/sorting/filters. Lives under the same
// ["employees"] key prefix, so every create/update/delete/import invalidation above and below
// refreshes it too. keepPreviousData keeps the current page on screen while the next loads.
export function useEmployeeSearch(query: EmployeeListQuery) {
  return useQuery({
    queryKey: [...QUERY_KEY, "list", query],
    queryFn: () => employeeApi.search(query),
    placeholderData: keepPreviousData,
  });
}

// Option lists for the table's lookup column filters, built from the existing setup queries
// (already cached app-wide, so opening a filter doesn't cost a request).
export function useEmployeeFilterOptions() {
  const { data: clients = [] } = useClients();
  const { data: payrollGroups = [] } = usePayrollGroups();
  const { data: departments = [] } = useDepartments();
  const { data: areas = [] } = useOperationAreas();
  const { data: branches = [] } = useBranches();
  const { data: positions = [] } = usePositions();
  const { data: fixedShifts = [] } = useFixedTimeShifts();
  const { data: splitShifts = [] } = useSplitTimeShifts();
  const { data: flexiShifts = [] } = useFlexiTimeShifts();

  const toOptions = (items: { id: string; name?: string | null }[]) =>
    items
      .map((item) => ({ text: item.name ?? "", value: item.id }))
      .sort((a, b) => a.text.localeCompare(b.text));

  // The three shift endpoints can overlap, so de-duplicate by id.
  const shifts = new Map<string, { text: string; value: string }>();
  for (const shift of [...fixedShifts, ...splitShifts, ...flexiShifts]) {
    shifts.set(shift.id, { text: shift.shiftName, value: shift.id });
  }

  return {
    clients: toOptions(clients),
    payrollGroups: toOptions(payrollGroups),
    departments: toOptions(departments),
    areas: toOptions(areas),
    branches: toOptions(branches),
    positions: toOptions(positions),
    timeShifts: [...shifts.values()].sort((a, b) =>
      a.text.localeCompare(b.text),
    ),
  };
}

export function useEmployee(id: string | undefined) {
  return useQuery({
    queryKey: [...QUERY_KEY, id],
    queryFn: () => employeeApi.getById(id!),
    enabled: !!id,
  });
}

export function useEmployeeFull(id: string | undefined) {
  return useQuery({
    queryKey: [...QUERY_KEY, id, "full"],
    queryFn: () => employeeApi.getFullById(id!),
    enabled: !!id,
    staleTime: 0,
  });
}

export function useCreateEmployee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateEmployee) => employeeApi.create(data),
    onSuccess: (created) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      queryClient.invalidateQueries({
        queryKey: ["employee-fixed-schedule", created.id],
      });
      invalidateEmployeeFilter(queryClient);
    },
  });
}

export function useUpdateEmployee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateEmployee) => employeeApi.update(data),
    onSuccess: (updated) => {
      queryClient.setQueryData([...QUERY_KEY, updated.id], updated);
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      queryClient.invalidateQueries({
        queryKey: ["employee-fixed-schedule", updated.id],
      });
      invalidateEmployeeFilter(queryClient);
    },
  });
}

export function useDeleteEmployee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => employeeApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      invalidateEmployeeFilter(queryClient);
    },
  });
}

export function useDownloadEmployeeTemplate() {
  return useMutation({
    mutationFn: () => employeeApi.downloadTemplate(),
  });
}

export function useUploadEmployees() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => employeeApi.uploadEmployees(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      invalidateEmployeeFilter(queryClient);
    },
  });
}

// Read-only — no cache invalidation, since nothing is committed to the database yet.
export function usePreviewEmployeesUpload() {
  return useMutation({
    mutationFn: (file: File) => employeeApi.previewEmployeesUpload(file),
  });
}

export function useCommitEmployeesImport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (rows: EmployeeImportPreviewRow[]) =>
      employeeApi.commitEmployeesImport(rows),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      invalidateEmployeeFilter(queryClient);
    },
  });
}

export function useExportImportErrors() {
  return useMutation({
    mutationFn: (rows: EmployeeImportPreviewRow[]) =>
      employeeApi.exportImportErrors(rows),
  });
}
