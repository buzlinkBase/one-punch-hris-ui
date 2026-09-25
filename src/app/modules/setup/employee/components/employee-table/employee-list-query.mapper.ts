import type { FilterValue, SorterResult } from "antd/es/table/interface";
import type { EmployeeListQuery } from "../../models/api/request/employee-list-query.model";

type ListField =
  | "clientIds"
  | "payrollGroupIds"
  | "departmentIds"
  | "areaIds"
  | "branchIds"
  | "positionIds"
  | "timeShiftIds"
  | "jobLevels"
  | "salaryTypes"
  | "employmentStatuses"
  | "statuses"
  | "genders";

type TextField =
  | "employeeNo"
  | "bioId"
  | "fullName"
  | "email"
  | "contact"
  | "sssNo"
  | "phicNo"
  | "hdmfNo"
  | "tin";

/** Which query param each filterable table column (by column key) drives. */
export const LIST_FILTER_COLUMNS: Record<string, ListField> = {
  clientName: "clientIds",
  payrollGroupName: "payrollGroupIds",
  departmentName: "departmentIds",
  areaName: "areaIds",
  branchName: "branchIds",
  positionName: "positionIds",
  timeShiftName: "timeShiftIds",
  jobLevel: "jobLevels",
  salaryType: "salaryTypes",
  employmentStatus: "employmentStatuses",
  status: "statuses",
  gender: "genders",
};

export const TEXT_FILTER_COLUMNS: Record<string, TextField> = {
  employeeNo: "employeeNo",
  bioId: "bioId",
  fullName: "fullName",
  email: "email",
  contact: "contact",
  sssNo: "sssNo",
  phicNo: "phicNo",
  hdmfNo: "hdmfNo",
  tin: "tin",
};

export const HIRE_DATE_COLUMN = "hireDate";

const FILTER_FIELDS = [
  ...Object.values(LIST_FILTER_COLUMNS),
  ...Object.values(TEXT_FILTER_COLUMNS),
  "hireDateFrom",
  "hireDateTo",
] as const;

/** Folds antd's Table onChange (filters + sorter) into the query. Any filter or sort change
 * returns to page 1 -- the old page number means nothing against a different result set. */
export function applyTableFiltersAndSort<T>(
  query: EmployeeListQuery,
  filters: Record<string, FilterValue | null>,
  sorter: SorterResult<T> | SorterResult<T>[],
): EmployeeListQuery {
  const next: EmployeeListQuery = { ...query };

  for (const [columnKey, field] of Object.entries(LIST_FILTER_COLUMNS)) {
    const values = filters[columnKey];
    next[field] = values?.length ? values.map(String) : undefined;
  }
  for (const [columnKey, field] of Object.entries(TEXT_FILTER_COLUMNS)) {
    const value = filters[columnKey]?.[0];
    next[field] = value ? String(value).trim() || undefined : undefined;
  }
  const [from, to] = filters[HIRE_DATE_COLUMN] ?? [];
  next.hireDateFrom = from ? String(from) : undefined;
  next.hireDateTo = to ? String(to) : undefined;

  const active = Array.isArray(sorter) ? sorter[0] : sorter;
  next.sortField = active?.order ? String(active.columnKey) : undefined;
  next.sortOrder = active?.order ?? undefined;

  const changed =
    FILTER_FIELDS.some(
      (f) => JSON.stringify(next[f]) !== JSON.stringify(query[f]),
    ) ||
    next.sortField !== query.sortField ||
    next.sortOrder !== query.sortOrder;
  if (changed) next.page = 1;

  return next;
}

export function hasActiveFilters(query: EmployeeListQuery): boolean {
  return !!query.keyword || FILTER_FIELDS.some((f) => query[f] !== undefined);
}

/** Resets filters, keyword and sort; keeps the chosen page size. */
export function clearedQuery(query: EmployeeListQuery): EmployeeListQuery {
  return { page: 1, limit: query.limit };
}
