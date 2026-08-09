import httpClient from "@/core/http/http-client";
import { API_PREFIX, buildApiUrl } from "@/core/http/api-url.util";
import type { LeaveApplicationResponse } from "../models/api/response/leave-application-response.model";
import type { CreateLeaveApplication } from "../models/api/request/create-leave-application.model";
import type { UpdateLeaveApplication } from "../models/api/request/update-leave-application.model";

const ENDPOINT = buildApiUrl(API_PREFIX.hrms, "leaveapplications");

export const leaveApplicationApi = {
  async getAll(params?: {
    from?: string;
    to?: string;
  }): Promise<LeaveApplicationResponse[]> {
    const qs = new URLSearchParams();
    if (params?.from) qs.set("from", params.from);
    if (params?.to) qs.set("to", params.to);
    const query = qs.toString();
    return httpClient.getUnwrapped<LeaveApplicationResponse[]>(
      query ? `${ENDPOINT}?${query}` : ENDPOINT,
    );
  },

  async getById(id: string): Promise<LeaveApplicationResponse> {
    return httpClient.getUnwrapped<LeaveApplicationResponse>(
      `${ENDPOINT}/${id}`,
    );
  },

  create(data: CreateLeaveApplication): Promise<LeaveApplicationResponse> {
    return httpClient.postUnwrapped<LeaveApplicationResponse>(ENDPOINT, data);
  },

  createBatch(
    data: CreateLeaveApplication[],
  ): Promise<LeaveApplicationResponse[]> {
    return httpClient.postUnwrapped<LeaveApplicationResponse[]>(
      `${ENDPOINT}/batch`,
      data,
    );
  },

  update(data: UpdateLeaveApplication): Promise<LeaveApplicationResponse> {
    return httpClient.putUnwrapped<LeaveApplicationResponse>(
      `${ENDPOINT}/${data.id}`,
      data,
    );
  },

  changeStatus(
    record: LeaveApplicationResponse,
    status: string,
  ): Promise<LeaveApplicationResponse> {
    return httpClient.putUnwrapped<LeaveApplicationResponse>(
      `${ENDPOINT}/${record.id}`,
      {
        id: record.id,
        employeeId: record.employeeId,
        leaveId: record.leaveId,
        leaveDateFrom: record.leaveDateFrom,
        leaveDateTo: record.leaveDateTo,
        dayType: record.dayType,
        payType: record.payType,
        applicationRemarks: record.applicationRemarks,
        approvalStatus: status,
      },
    );
  },

  remove(id: string): Promise<void> {
    return httpClient.delete<void>(`${ENDPOINT}/${id}`);
  },
};
