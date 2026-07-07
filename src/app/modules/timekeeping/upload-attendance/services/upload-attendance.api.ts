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

    // The axios instance defaults to Content-Type: application/json which causes
    // FormData to be JSON-serialized instead of sent as multipart. Strip it here
    // so the browser sets the correct multipart/form-data boundary automatically.
    await axiosInstance.post(ENDPOINT, formData, {
      transformRequest: [
        (reqData: unknown, headers?: Record<string, string>) => {
          if (headers) delete headers["Content-Type"];
          return reqData;
        },
      ],
    });
  },
};
