import axiosInstance from "@/core/http/axios.instance";
import httpClient from "@/core/http/http-client";
import { API_PREFIX, buildApiUrl } from "@/core/http/api-url.util";
import type { UploadAttendanceRequest } from "../models/api/request/upload-attendance-request.model";
import type { UploadBatchResponse } from "../models/api/response/upload-batch-response.model";
import type { UploadBatchChangeResponse } from "../models/api/response/upload-batch-change-response.model";

const ENDPOINT = buildApiUrl(API_PREFIX.hrms, "attendance/upload-att-log");
const ATTENDANCE_ENDPOINT = buildApiUrl(API_PREFIX.hrms, "attendance");

export const uploadAttendanceApi = {
  async upload(data: UploadAttendanceRequest): Promise<void> {
    const formData = new FormData();
    formData.append("file", data.file);
    if (data.branchId) formData.append("branchId", data.branchId);
    if (data.operationAreaId)
      formData.append("operationAreaId", data.operationAreaId);
    if (data.clientId) formData.append("clientId", data.clientId);
    if (data.departmentId) formData.append("departmentId", data.departmentId);
    formData.append("remarks", data.remarks);

    // Setting multipart/form-data signals axios v1.x's XHR adapter to delete the
    // header before sending, so the browser can append the correct boundary value.
    await axiosInstance.post(ENDPOINT, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  // Uploads with a log between the dates (YYYY-MM-DD), newest first.
  async getBatches(filter: {
    fromDate?: string;
    toDate?: string;
  }): Promise<UploadBatchResponse[]> {
    const params: Record<string, string> = {};
    if (filter.fromDate) params.fromDate = filter.fromDate;
    if (filter.toDate) params.toDate = filter.toDate;
    return httpClient.getUnwrapped<UploadBatchResponse[]>(
      `${ATTENDANCE_ENDPOINT}/upload-batches`,
      { params },
    );
  },

  // The logs of an upload a user edited or removed, with their originals.
  async getBatchChanges(
    batchCode: string,
  ): Promise<UploadBatchChangeResponse[]> {
    return httpClient.getUnwrapped<UploadBatchChangeResponse[]>(
      `${ATTENDANCE_ENDPOINT}/upload-batch/${encodeURIComponent(batchCode)}/changes`,
    );
  },

  // Deletes every log of the upload and the saved originals of its edited/removed logs.
  async deleteBatch(batchCode: string): Promise<void> {
    await httpClient.delete<void>(
      `${ATTENDANCE_ENDPOINT}/upload-batch/${encodeURIComponent(batchCode)}`,
    );
  },
};
