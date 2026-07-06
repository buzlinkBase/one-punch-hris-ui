import httpClient from "@/core/http/http-client";
import { API_PREFIX, buildApiUrl } from "@/core/http/api-url.util";
import type { FlexiTimeShiftResponse } from "../models/api/response/flexi-time-shift-response.model";
import type { CreateFlexiTimeShift } from "../models/api/request/create-flexi-time-shift.model";
import type { UpdateFlexiTimeShift } from "../models/api/request/update-flexi-time-shift.model";

const ENDPOINT = buildApiUrl(API_PREFIX.hrms, "timeshifts");

const MOCK_FLEXI_TIME_SHIFTS: FlexiTimeShiftResponse[] = [
  {
    id: "flx-001",
    shiftName: "Standard Flexi",
    shiftType: "FLEXI",
    startTime: "06:00:00",
    endTime: "22:00:00",
    withAMBreak: "NONE",
    amStartTime: null,
    amEndTime: null,
    withLunchBreak: "UNPAID_BREAK",
    lunchStartTime: "12:00:00",
    lunchEndTime: "13:00:00",
    withPMBreak: "NONE",
    pmStartTime: null,
    pmEndTime: null,
    gracePeriodMinutes: 0,
    breakDurationMinutes: 60,
    withOT: true,
    otRequireTimeIn: false,
    otStart: "00:00:00",
    overTimeThreshold: 60,
    minimumWorkMinutes: 480,
    maxWorkingMinutes: 600,
  },
  {
    id: "flx-002",
    shiftName: "Core Hours Flexi",
    shiftType: "FLEXI",
    startTime: "07:00:00",
    endTime: "20:00:00",
    withAMBreak: "NONE",
    amStartTime: null,
    amEndTime: null,
    withLunchBreak: "PAID_BREAK",
    lunchStartTime: null,
    lunchEndTime: null,
    withPMBreak: "NONE",
    pmStartTime: null,
    pmEndTime: null,
    gracePeriodMinutes: 0,
    breakDurationMinutes: 0,
    withOT: false,
    otRequireTimeIn: false,
    otStart: "00:00:00",
    overTimeThreshold: 0,
    minimumWorkMinutes: 480,
    maxWorkingMinutes: 600,
  },
];

export const flexiTimeShiftApi = {
  async getAll(): Promise<FlexiTimeShiftResponse[]> {
    try {
      const data =
        await httpClient.getUnwrapped<FlexiTimeShiftResponse[]>(ENDPOINT);
      return data.length ? data : MOCK_FLEXI_TIME_SHIFTS;
    } catch {
      return MOCK_FLEXI_TIME_SHIFTS;
    }
  },
  async getById(id: string): Promise<FlexiTimeShiftResponse> {
    try {
      return await httpClient.getUnwrapped<FlexiTimeShiftResponse>(
        `${ENDPOINT}/${id}`,
      );
    } catch {
      const match = MOCK_FLEXI_TIME_SHIFTS.find((item) => item.id === id);
      if (match) return match;
      throw new Error(`Flexi time shift ${id} not found`);
    }
  },
  create(data: CreateFlexiTimeShift): Promise<FlexiTimeShiftResponse> {
    return httpClient.postUnwrapped<FlexiTimeShiftResponse>(ENDPOINT, data);
  },
  update(data: UpdateFlexiTimeShift): Promise<FlexiTimeShiftResponse> {
    return httpClient.put<FlexiTimeShiftResponse>(
      `${ENDPOINT}/${data.id}`,
      data,
    );
  },
  remove(id: string): Promise<void> {
    return httpClient.delete<void>(`${ENDPOINT}/${id}`);
  },
};
