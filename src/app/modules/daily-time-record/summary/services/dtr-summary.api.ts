import httpClient from "@/core/http/http-client";
import { API_PREFIX, buildApiUrl } from "@/core/http/api-url.util";
import type { DtrSummaryResponse } from "../models/api/response/dtr-summary-response.model";
import type { DtrSummaryFilter } from "../models/api/request/dtr-summary-filter.model";

const ENDPOINT = buildApiUrl(API_PREFIX.hrms, "dailyrecords/load-summary");

const r = (max: number, offset = 0) =>
  parseFloat(((offset * 0.13) % max).toFixed(2));

const TIME_SHIFTS = [
  "8:00 AM - 5:00 PM",
  "10:00 PM - 7:00 AM",
  "6:00 AM - 3:00 PM",
];
const STARTS = ["08:00", "22:00", "06:00"];
const ENDS = ["17:00", "07:00", "15:00"];

const MOCK_DATA: DtrSummaryResponse[] = Array.from({ length: 20 }, (_, i) => ({
  id: `dts-${i + 1}`,
  bioId: `BIO-${1000 + i}`,
  employeeId: `emp-${1001 + i}`,
  employeeName: `Employee ${i + 1}`,
  departmentId: `dept-${(i % 4) + 1}`,
  clientId: `client-${(i % 3) + 1}`,
  payrollGroupId: `pg-${(i % 3) + 1}`,
  timeShift: TIME_SHIFTS[i % 3],
  start: STARTS[i % 3],
  end: ENDS[i % 3],
  late: (i * 5) % 120,
  underTime: (i * 3) % 60,
  over: (i * 4) % 90,
  ot: (i * 6) % 60,
  overOt: r(8, i + 1),
  nd: r(4, i + 2),
  ndOt: r(2, i + 3),
  lhHours: r(8, i + 4),
  spHours: r(8, i + 5),
  days: (i % 26) + 1,
  rnd: r(4, i + 6),
  rot: r(4, i + 7),
  rndo: r(2, i + 8),
  restDay: r(8, i + 9),
  rdNd: r(4, i + 10),
  rdOt: r(4, i + 11),
  rdNdo: r(2, i + 12),
  lhUsed: r(8, i + 13),
  spUsed: r(8, i + 14),
  regNet: parseFloat((8 - r(4, i)).toFixed(2)),
  netOt: r(4, i + 15),
  ndNet: r(2, i + 16),
  ndOtNet: r(1, i + 17),
  rdNet: r(8, i + 18),
  rdOtNet: r(4, i + 19),
  rdNdOt: r(2, i + 20),
  lh: r(8, i + 21),
  lhOt: r(4, i + 22),
  lhNd: r(2, i + 23),
  lhNdOt: r(1, i + 24),
  sph: r(8, i + 25),
  sphOt: r(4, i + 26),
  sphNd: r(2, i + 27),
  sphNdOt: r(1, i + 28),
  rawOt: r(8, i + 29),
  appliedOt: r(8, i + 30),
  abs: (i * 2) % 5,
  total: parseFloat((160 - ((i * 3) % 40)).toFixed(2)),
}));

function applyFilter(
  data: DtrSummaryResponse[],
  filter: DtrSummaryFilter,
): DtrSummaryResponse[] {
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

export const dtrSummaryApi = {
  async getAll(filter: DtrSummaryFilter = {}): Promise<DtrSummaryResponse[]> {
    try {
      const data = await httpClient.getUnwrapped<DtrSummaryResponse[]>(
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
