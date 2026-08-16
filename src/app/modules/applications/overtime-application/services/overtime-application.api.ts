import httpClient from "@/core/http/http-client";
import { API_PREFIX, buildApiUrl } from "@/core/http/api-url.util";
import type { OvertimeApplicationResponse } from "../models/api/response/overtime-application-response.model";
import type { CreateOvertimeApplication } from "../models/api/request/create-overtime-application.model";
import type { UpdateOvertimeApplication } from "../models/api/request/update-overtime-application.model";

const ENDPOINT = buildApiUrl(API_PREFIX.hrms, "overtimeapplications");

export const overtimeApplicationApi = {
  async getAll(params?: {
    from?: string;
    to?: string;
  }): Promise<OvertimeApplicationResponse[]> {
    const qs = new URLSearchParams();
    if (params?.from) qs.set("from", params.from);
    if (params?.to) qs.set("to", params.to);
    const query = qs.toString();
    return httpClient.getUnwrapped<OvertimeApplicationResponse[]>(
      query ? `${ENDPOINT}?${query}` : ENDPOINT,
    );
  },

  async getById(id: string): Promise<OvertimeApplicationResponse> {
    return httpClient.getUnwrapped<OvertimeApplicationResponse>(
      `${ENDPOINT}/${id}`,
    );
  },

  create(
    data: CreateOvertimeApplication,
  ): Promise<OvertimeApplicationResponse> {
    return httpClient.postUnwrapped<OvertimeApplicationResponse>(
      ENDPOINT,
      data,
    );
  },

  createBatch(
    data: CreateOvertimeApplication[],
  ): Promise<OvertimeApplicationResponse[]> {
    return httpClient.postUnwrapped<OvertimeApplicationResponse[]>(
      `${ENDPOINT}/batch`,
      data,
    );
  },

  update(
    data: UpdateOvertimeApplication,
  ): Promise<OvertimeApplicationResponse> {
    return httpClient.putUnwrapped<OvertimeApplicationResponse>(
      `${ENDPOINT}/${data.id}`,
      data,
    );
  },

  changeStatus(
    record: OvertimeApplicationResponse,
    status: string,
  ): Promise<OvertimeApplicationResponse> {
    return httpClient.putUnwrapped<OvertimeApplicationResponse>(
      `${ENDPOINT}/${record.id}`,
      {
        id: record.id,
        employeeId: record.employeeId,
        otDate: record.otDate,
        startTime: record.startTime,
        endTime: record.endTime,
        manualOTMinutes: record.manualOTMinutes,
        isManualEntry: record.isManualEntry,
        remarks: record.remarks,
        approvalStatus: status,
      },
    );
  },

  remove(id: string): Promise<void> {
    return httpClient.delete<void>(`${ENDPOINT}/${id}`);
  },
};
