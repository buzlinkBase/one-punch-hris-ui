import axiosInstance from "@/core/http/axios.instance";
import { API_PREFIX, buildApiUrl } from "@/core/http/api-url.util";
import type { UploadAttendanceRequest } from "../models/api/request/upload-attendance-request.model";

const ENDPOINT = buildApiUrl(API_PREFIX.hrms, "attendance/upload-att-log");

export const uploadAttendanceApi = {
  async upload(data: UploadAttendanceRequest): Promise<void> {
    const formData = new FormData();
    formData.append("file", data.file);
    if (data.branchId) formData.append("branchId", data.branchId);
    if (data.operationAreaId)
      formData.append("operationAreaId", data.operationAreaId);
    if (data.clientId) formData.append("clientId", data.clientId);
    if (data.departmentId) formData.append("departmentId", data.departmentId);

    // Setting multipart/form-data signals axios v1.x's XHR adapter to delete the
    // header before sending, so the browser can append the correct boundary value.
    await axiosInstance.post(ENDPOINT, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
};
