import httpClient from "@/core/http/http-client";
import { API_PREFIX, buildApiUrl } from "@/core/http/api-url.util";
import type { FixedTimeShiftResponse } from "../models/api/response/fixed-time-shift-response.model";
import type { CreateFixedTimeShift } from "../models/api/request/create-fixed-time-shift.model";
import type { UpdateFixedTimeShift } from "../models/api/request/update-fixed-time-shift.model";

const ENDPOINT = buildApiUrl(API_PREFIX.hrms, "timeshifts");

const MOCK_FIXED_TIME_SHIFTS: FixedTimeShiftResponse[] = [
  {
    id: "fts-001",
    shiftName: "Regular Day Shift",
    shiftType: "FIXED",
    startTime: "08:00:00",
    endTime: "17:00:00",
    withLunchBreak: "UNPAID_BREAK",
    lunchStartTime: "12:00:00",
    lunchEndTime: "13:00:00",
    breakDurationMinutes: 60,
    withAMBreak: "NONE",
    amStartTime: null,
    amEndTime: null,
    withPMBreak: "NONE",
    pmStartTime: null,
    pmEndTime: null,
    gracePeriodMinutes: 15,
    maxWorkingMinutes: 480,
    minimumWorkMinutes: 0,
    withOT: true,
    otRequireTimeIn: false,
    otStart: "17:00:00",
    overTimeThreshold: 60,
  },
  {
    id: "fts-002",
    shiftName: "Morning Shift",
    shiftType: "FIXED",
    startTime: "06:00:00",
    endTime: "14:00:00",
    withLunchBreak: "PAID_BREAK",
    lunchStartTime: "10:00:00",
    lunchEndTime: "10:30:00",
    breakDurationMinutes: 30,
    withAMBreak: "NONE",
    amStartTime: null,
    amEndTime: null,
    withPMBreak: "NONE",
    pmStartTime: null,
    pmEndTime: null,
    gracePeriodMinutes: 10,
    maxWorkingMinutes: 480,
    minimumWorkMinutes: 0,
    withOT: false,
    otRequireTimeIn: false,
    otStart: "00:00:00",
    overTimeThreshold: 0,
  },
  {
    id: "fts-003",
    shiftName: "Night Shift",
    shiftType: "FIXED",
    startTime: "22:00:00",
    endTime: "1.06:00:00",
    withLunchBreak: "UNPAID_BREAK",
    lunchStartTime: "02:00:00",
    lunchEndTime: "03:00:00",
    breakDurationMinutes: 60,
    withAMBreak: "PAID_BREAK",
    amStartTime: "00:00:00",
    amEndTime: "00:15:00",
    withPMBreak: "PAID_BREAK",
    pmStartTime: "04:00:00",
    pmEndTime: "04:15:00",
    gracePeriodMinutes: 15,
    maxWorkingMinutes: 480,
    minimumWorkMinutes: 0,
    withOT: true,
    otRequireTimeIn: true,
    otStart: "06:00:00",
    overTimeThreshold: 60,
  },
];

export const fixedTimeShiftApi = {
  async getAll(): Promise<FixedTimeShiftResponse[]> {
    try {
      const data = await httpClient.getUnwrapped<FixedTimeShiftResponse[]>(ENDPOINT);
      return data.length ? data : MOCK_FIXED_TIME_SHIFTS;
    } catch {
      return MOCK_FIXED_TIME_SHIFTS;
    }
  },
  async getById(id: string): Promise<FixedTimeShiftResponse> {
    try {
      return await httpClient.getUnwrapped<FixedTimeShiftResponse>(`${ENDPOINT}/${id}`);
    } catch {
      const match = MOCK_FIXED_TIME_SHIFTS.find((item) => item.id === id);
      if (match) return match;
      throw new Error(`Fixed time shift ${id} not found`);
    }
  },
  create(data: CreateFixedTimeShift): Promise<FixedTimeShiftResponse> {
    return httpClient.postUnwrapped<FixedTimeShiftResponse>(ENDPOINT, data);
  },
  update(data: UpdateFixedTimeShift): Promise<FixedTimeShiftResponse> {
    return httpClient.put<FixedTimeShiftResponse>(`${ENDPOINT}/${data.id}`, data);
  },
  remove(id: string): Promise<void> {
    return httpClient.delete<void>(`${ENDPOINT}/${id}`);
  },
};
