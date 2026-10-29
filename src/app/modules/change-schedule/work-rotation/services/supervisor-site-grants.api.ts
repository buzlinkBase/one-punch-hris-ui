import httpClient from "@/core/http/http-client";
import { API_PREFIX, buildApiUrl } from "@/core/http/api-url.util";

const ENDPOINT = buildApiUrl(API_PREFIX.hrms, "supervisorsitegrants");

export const supervisorSiteGrantsApi = {
  getAreaIds(employeeId: string): Promise<string[]> {
    return httpClient.getUnwrapped<string[]>(`${ENDPOINT}/${employeeId}`);
  },

  setAreaIds(employeeId: string, areaIds: string[]): Promise<string[]> {
    return httpClient.put<string[]>(`${ENDPOINT}/${employeeId}`, { areaIds });
  },
};
