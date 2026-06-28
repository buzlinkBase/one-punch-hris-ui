import httpClient from "@/core/http/http-client";
import { API_PREFIX, buildApiUrl } from "@/core/http/api-url.util";
import type { HolidayResponse } from "../models/api/response/holiday-response.model";
import type { CreateHoliday } from "../models/api/request/create-holiday.model";
import type { UpdateHoliday } from "../models/api/request/update-holiday.model";

const ENDPOINT = buildApiUrl(API_PREFIX.hrms, "holidays");

const MOCK_HOLIDAYS: HolidayResponse[] = [
  { id: "hol-1",  description: "New Year's Day",            holType: "LEGAL",   workType: "NonWorking", holDate: "2026-01-01", holYear: 2026, isRecuring: true,  isPaid: true,  areaId: null, status: "ACTIVE" },
  { id: "hol-2",  description: "Araw ng Kagitingan",        holType: "LEGAL",   workType: "NonWorking", holDate: "2026-04-09", holYear: 2026, isRecuring: true,  isPaid: true,  areaId: null, status: "ACTIVE" },
  { id: "hol-3",  description: "Maundy Thursday",           holType: "LEGAL",   workType: "NonWorking", holDate: "2026-04-02", holYear: 2026, isRecuring: false, isPaid: true,  areaId: null, status: "ACTIVE" },
  { id: "hol-4",  description: "Good Friday",               holType: "LEGAL",   workType: "NonWorking", holDate: "2026-04-03", holYear: 2026, isRecuring: false, isPaid: true,  areaId: null, status: "ACTIVE" },
  { id: "hol-5",  description: "Labor Day",                 holType: "LEGAL",   workType: "NonWorking", holDate: "2026-05-01", holYear: 2026, isRecuring: true,  isPaid: true,  areaId: null, status: "ACTIVE" },
  { id: "hol-6",  description: "Independence Day",          holType: "LEGAL",   workType: "NonWorking", holDate: "2026-06-12", holYear: 2026, isRecuring: true,  isPaid: true,  areaId: null, status: "ACTIVE" },
  { id: "hol-7",  description: "National Heroes Day",       holType: "LEGAL",   workType: "NonWorking", holDate: "2026-08-31", holYear: 2026, isRecuring: true,  isPaid: true,  areaId: null, status: "ACTIVE" },
  { id: "hol-8",  description: "Bonifacio Day",             holType: "LEGAL",   workType: "NonWorking", holDate: "2026-11-30", holYear: 2026, isRecuring: true,  isPaid: true,  areaId: null, status: "ACTIVE" },
  { id: "hol-9",  description: "Christmas Day",             holType: "LEGAL",   workType: "NonWorking", holDate: "2026-12-25", holYear: 2026, isRecuring: true,  isPaid: true,  areaId: null, status: "ACTIVE" },
  { id: "hol-10", description: "Rizal Day",                 holType: "LEGAL",   workType: "NonWorking", holDate: "2026-12-30", holYear: 2026, isRecuring: true,  isPaid: true,  areaId: null, status: "ACTIVE" },
  { id: "hol-11", description: "All Saints Day",            holType: "SPECIAL", workType: "NonWorking", holDate: "2026-11-01", holYear: 2026, isRecuring: true,  isPaid: false, areaId: null, status: "ACTIVE" },
  { id: "hol-12", description: "Christmas Eve",             holType: "SPECIAL", workType: "NonWorking", holDate: "2026-12-24", holYear: 2026, isRecuring: true,  isPaid: false, areaId: null, status: "ACTIVE" },
  { id: "hol-13", description: "Last Day of the Year",      holType: "SPECIAL", workType: "NonWorking", holDate: "2026-12-31", holYear: 2026, isRecuring: true,  isPaid: false, areaId: null, status: "ACTIVE" },
  { id: "hol-14", description: "City Foundation Day",       holType: "SPECIAL", workType: "NonWorking", holDate: "2026-03-15", holYear: 2026, isRecuring: true,  isPaid: false, areaId: "area-1", status: "ACTIVE" },
];

export const holidayApi = {
  async getAll(): Promise<HolidayResponse[]> {
    try {
      const data = await httpClient.getUnwrapped<HolidayResponse[]>(ENDPOINT);
      return data.length ? data : MOCK_HOLIDAYS;
    } catch {
      return MOCK_HOLIDAYS;
    }
  },
  async getById(id: string): Promise<HolidayResponse> {
    try {
      return await httpClient.getUnwrapped<HolidayResponse>(`${ENDPOINT}/${id}`);
    } catch {
      const match = MOCK_HOLIDAYS.find((item) => item.id === id);
      if (match) return match;
      throw new Error(`Holiday ${id} not found`);
    }
  },
  create(data: CreateHoliday): Promise<HolidayResponse> {
    return httpClient.postUnwrapped<HolidayResponse>(ENDPOINT, data);
  },
  update(data: UpdateHoliday): Promise<HolidayResponse> {
    return httpClient.put<HolidayResponse>(`${ENDPOINT}/${data.id}`, data);
  },
  remove(id: string): Promise<void> {
    return httpClient.delete<void>(`${ENDPOINT}/${id}`);
  },
};
