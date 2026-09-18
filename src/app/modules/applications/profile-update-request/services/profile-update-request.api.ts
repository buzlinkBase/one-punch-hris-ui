import httpClient from "@/core/http/http-client";
import { API_PREFIX, buildApiUrl } from "@/core/http/api-url.util";
import type { EmployeeProfileUpdateRequestResponse } from "../models/api/response/employee-profile-update-request-response.model";

const ENDPOINT = buildApiUrl(API_PREFIX.hrms, "EmployeeProfileUpdateRequests");

export const profileUpdateRequestApi = {
  getAll(employeeId?: string): Promise<EmployeeProfileUpdateRequestResponse[]> {
    const qs = employeeId ? `?employeeId=${employeeId}` : "";
    return httpClient.getUnwrapped<EmployeeProfileUpdateRequestResponse[]>(
      `${ENDPOINT}${qs}`,
    );
  },

  getById(id: string): Promise<EmployeeProfileUpdateRequestResponse> {
    return httpClient.getUnwrapped<EmployeeProfileUpdateRequestResponse>(
      `${ENDPOINT}/${id}`,
    );
  },

  // Throws (via axios, AxiosError.response.status === 409) when the employee record was edited
  // elsewhere since this request was submitted -- callers pass forceApply: true to proceed
  // anyway once the approver has reviewed the conflict. The 409 is expected/handled by the
  // caller, not a real failure, so the global error toast is skipped for this call.
  approve(id: string, note?: string, forceApply?: boolean): Promise<void> {
    return httpClient.postUnwrapped<void>(
      `${ENDPOINT}/${id}/approve`,
      { note, forceApply },
      { _skipErrorNotification: true },
    );
  },

  decline(id: string, note?: string): Promise<void> {
    return httpClient.postUnwrapped<void>(`${ENDPOINT}/${id}/decline`, {
      note,
    });
  },
};
