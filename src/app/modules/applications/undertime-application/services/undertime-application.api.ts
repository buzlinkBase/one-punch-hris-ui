import httpClient from "@/core/http/http-client";
import { API_PREFIX, buildApiUrl } from "@/core/http/api-url.util";
import type { UndertimeApplicationResponse } from "../models/api/response/undertime-application-response.model";
import type { CreateUndertimeApplication } from "../models/api/request/create-undertime-application.model";
import type { UpdateUndertimeApplication } from "../models/api/request/update-undertime-application.model";

const ENDPOINT = buildApiUrl(API_PREFIX.hrms, "undertimeapplications");

export const undertimeApi = {
  async getAll(params?: {
    from?: string;
    to?: string;
  }): Promise<UndertimeApplicationResponse[]> {
    const qs = new URLSearchParams();
    if (params?.from) qs.set("from", params.from);
    if (params?.to) qs.set("to", params.to);
    const query = qs.toString();
    return httpClient.getUnwrapped<UndertimeApplicationResponse[]>(
      query ? `${ENDPOINT}?${query}` : ENDPOINT,
    );
  },

  async getById(id: string): Promise<UndertimeApplicationResponse> {
    return httpClient.getUnwrapped<UndertimeApplicationResponse>(
      `${ENDPOINT}/${id}`,
    );
  },

  create(
    data: CreateUndertimeApplication,
  ): Promise<UndertimeApplicationResponse> {
    return httpClient.postUnwrapped<UndertimeApplicationResponse>(
      ENDPOINT,
      data,
    );
  },

  createBatch(
    data: CreateUndertimeApplication[],
  ): Promise<UndertimeApplicationResponse[]> {
    return httpClient.postUnwrapped<UndertimeApplicationResponse[]>(
      `${ENDPOINT}/batch`,
      data,
    );
  },

  update(
    data: UpdateUndertimeApplication,
  ): Promise<UndertimeApplicationResponse> {
    return httpClient.putUnwrapped<UndertimeApplicationResponse>(
      `${ENDPOINT}/${data.id}`,
      data,
    );
  },

  changeStatus(
    record: UndertimeApplicationResponse,
    status: string,
  ): Promise<UndertimeApplicationResponse> {
    return httpClient.putUnwrapped<UndertimeApplicationResponse>(
      `${ENDPOINT}/${record.id}`,
      {
        id: record.id,
        employeeId: record.employeeId,
        payrollDate: record.payrollDate,
        utMinutes: record.utMinutes,
        remarks: record.remarks,
        approvalStatus: status,
      },
    );
  },

  remove(id: string): Promise<void> {
    return httpClient.delete<void>(`${ENDPOINT}/${id}`);
  },
};
