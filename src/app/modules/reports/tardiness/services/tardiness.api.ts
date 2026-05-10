import httpClient from "@/core/http/http-client";
import type { TardinessResponse } from "../models/api/response/tardiness-response.model";
import type { TardinessFilter } from "../models/api/request/tardiness-filter.model";

const ENDPOINT = "reports/tardiness";

const MOCK_TARDINESS: TardinessResponse[] = Array.from(
  { length: 20 },
  (_, i) => ({
    id: `tard-${i + 1}`,
    employeeNo: `EMP-${1001 + i}`,
    employeeName: `Employee ${i + 1}`,
    departmentId: `dept-${(i % 4) + 1}`,
    department: ["HR", "Finance", "Operations", "IT"][i % 4],
    employeeId: `emp-${1001 + i}`,
    payrollGroupId: `pg-${(i % 3) + 1}`,
    late: (i * 7) % 120,
    underTime: (i * 3) % 60,
  }),
);

function applyFilter(
  data: TardinessResponse[],
  filter: TardinessFilter,
): TardinessResponse[] {
  return data.filter((item) => {
    if (filter.departmentId && item.departmentId !== filter.departmentId)
      return false;
    if (filter.employeeId && item.employeeId !== filter.employeeId)
      return false;
    if (filter.payrollGroupId && item.payrollGroupId !== filter.payrollGroupId)
      return false;
    return true;
  });
}

export const tardinessApi = {
  async getAll(filter: TardinessFilter = {}): Promise<TardinessResponse[]> {
    try {
      const data = await httpClient.getUnwrapped<TardinessResponse[]>(
        ENDPOINT,
        {
          params: filter,
        },
      );
      const result = data.length ? data : MOCK_TARDINESS;
      return applyFilter(result, filter);
    } catch {
      return applyFilter(MOCK_TARDINESS, filter);
    }
  },
};
