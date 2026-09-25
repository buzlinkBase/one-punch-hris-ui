/** Mirrors the backend's EmployeeListQuery (GET employees/list). Every filter is optional and
 * the ones that are set combine with AND. `sortField` uses the table's column keys and
 * `sortOrder` uses antd's own "ascend" / "descend" vocabulary. */
export interface EmployeeListQuery {
  page: number;
  limit: number;
  sortField?: string;
  sortOrder?: "ascend" | "descend";
  keyword?: string;

  clientIds?: string[];
  payrollGroupIds?: string[];
  departmentIds?: string[];
  /** Project Site. */
  areaIds?: string[];
  branchIds?: string[];
  positionIds?: string[];
  timeShiftIds?: string[];

  jobLevels?: string[];
  salaryTypes?: string[];
  employmentStatuses?: string[];
  statuses?: string[];
  genders?: string[];

  employeeNo?: string;
  bioId?: string;
  fullName?: string;
  email?: string;
  contact?: string;
  sssNo?: string;
  phicNo?: string;
  hdmfNo?: string;
  tin?: string;

  hireDateFrom?: string;
  hireDateTo?: string;
}
