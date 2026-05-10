import httpClient from "@/core/http/http-client";
import type { ForPayrollResponse } from "../models/api/response/for-payroll-response.model";
import type { ForPayrollFilter } from "../models/api/request/for-payroll-filter.model";

const ENDPOINT = "daily-time-record/for-payroll";

const MOCK_DATA: ForPayrollResponse[] = Array.from({ length: 20 }, (_, i) => ({
  id: `fp-${i + 1}`,
  bioId: `BIO-${1000 + i}`,
  employeeId: `emp-${1001 + i}`,
  employeeName: `Employee ${i + 1}`,
  departmentId: `dept-${(i % 4) + 1}`,
  clientId: `client-${(i % 3) + 1}`,
  payrollGroupId: `pg-${(i % 3) + 1}`,
  late: (i * 5) % 120,
  underTime: (i * 3) % 60,
  regNet: parseFloat((8 - ((i * 0.5) % 4)).toFixed(2)),
  netOvertime: parseFloat(((i * 0.25) % 4).toFixed(2)),
  nd: parseFloat(((i * 0.1) % 2).toFixed(2)),
  ndOt: parseFloat(((i * 0.05) % 1).toFixed(2)),
  restDayNet: parseFloat(((i * 0.2) % 8).toFixed(2)),
  restDayOt: parseFloat(((i * 0.15) % 4).toFixed(2)),
  rdNd: parseFloat(((i * 0.08) % 2).toFixed(2)),
  rdNdOt: parseFloat(((i * 0.04) % 1).toFixed(2)),
  lh: parseFloat(((i * 0.3) % 8).toFixed(2)),
  lhOt: parseFloat(((i * 0.12) % 4).toFixed(2)),
  lhNd: parseFloat(((i * 0.07) % 2).toFixed(2)),
  lhNdOt: parseFloat(((i * 0.03) % 1).toFixed(2)),
  sph: parseFloat(((i * 0.25) % 8).toFixed(2)),
  sphOt: parseFloat(((i * 0.1) % 4).toFixed(2)),
  sphNd: parseFloat(((i * 0.06) % 2).toFixed(2)),
  sphNdOt: parseFloat(((i * 0.02) % 1).toFixed(2)),
}));

function applyFilter(
  data: ForPayrollResponse[],
  filter: ForPayrollFilter,
): ForPayrollResponse[] {
  return data.filter((item) => {
    if (filter.departmentId && item.departmentId !== filter.departmentId)
      return false;
    if (filter.clientId && item.clientId !== filter.clientId) return false;
    if (filter.employeeId && item.employeeId !== filter.employeeId)
      return false;
    if (filter.payrollGroupId && item.payrollGroupId !== filter.payrollGroupId)
      return false;
    return true;
  });
}

export const forPayrollApi = {
  async getAll(filter: ForPayrollFilter = {}): Promise<ForPayrollResponse[]> {
    try {
      const data = await httpClient.getUnwrapped<ForPayrollResponse[]>(
        ENDPOINT,
        { params: filter },
      );
      const result = data.length ? data : MOCK_DATA;
      return applyFilter(result, filter);
    } catch {
      return applyFilter(MOCK_DATA, filter);
    }
  },
};
