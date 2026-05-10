import httpClient from "@/core/http/http-client";
import type { DtrDetailResponse } from "../models/api/response/dtr-detail-response.model";
import type { DtrDetailFilter } from "../models/api/request/dtr-detail-filter.model";

const ENDPOINT = "daily-time-record/detail";

const WORK_TYPES = ["Regular", "Rest Day", "Holiday", "Special Holiday"];
const TIME_SHIFTS = [
  "8:00 AM - 5:00 PM",
  "10:00 PM - 7:00 AM",
  "6:00 AM - 3:00 PM",
];
const STARTS = ["08:00", "22:00", "06:00"];
const ENDS = ["17:00", "07:00", "15:00"];

const r = (max: number, seed: number) =>
  parseFloat(((seed * 0.17) % max).toFixed(2));

const MOCK_DATA: DtrDetailResponse[] = Array.from({ length: 20 }, (_, i) => ({
  id: `dtd-${i + 1}`,
  employeeId: `emp-${1001 + i}`,
  employeeName: `Employee ${i + 1}`,
  departmentId: `dept-${(i % 4) + 1}`,
  clientId: `client-${(i % 3) + 1}`,
  payrollGroupId: `pg-${(i % 3) + 1}`,
  workType: WORK_TYPES[i % 4],
  dtrDate: `2026-05-${String((i % 28) + 1).padStart(2, "0")}`,
  timeShift: TIME_SHIFTS[i % 3],
  start: STARTS[i % 3],
  end: ENDS[i % 3],
  minutesLate: (i * 7) % 120,
  minutesUt: (i * 3) % 60,
  minutesOver: (i * 5) % 90,
  minutesOt: (i * 4) % 60,
  minutesNd: (i * 2) % 30,
  minutesNdOt: i % 20,
  minutesLh: r(8, i + 1),
  minutesSp: r(8, i + 2),
  hoursRegNet: parseFloat((8 - r(4, i)).toFixed(2)),
  hoursNetOt: r(4, i + 3),
  hoursNdOt: r(2, i + 4),
  hoursRdNet: r(8, i + 5),
  hoursRdOt: r(4, i + 6),
  hoursRdNd: r(2, i + 7),
  hoursRdNdOt: r(1, i + 8),
  hoursLh: r(8, i + 9),
  hoursLhOt: r(4, i + 10),
  hoursLhNd: r(2, i + 11),
  hoursLhNdOt: r(1, i + 12),
  hoursSph: r(8, i + 13),
  hoursSphNd: r(2, i + 14),
  hoursSphNdOt: r(1, i + 15),
  total: parseFloat((8 + r(4, i + 16)).toFixed(2)),
}));

function applyFilter(
  data: DtrDetailResponse[],
  filter: DtrDetailFilter,
): DtrDetailResponse[] {
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

export const dtrDetailApi = {
  async getAll(filter: DtrDetailFilter = {}): Promise<DtrDetailResponse[]> {
    try {
      const data = await httpClient.getUnwrapped<DtrDetailResponse[]>(
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
