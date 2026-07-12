import httpClient from "@/core/http/http-client";
import { API_PREFIX, buildApiUrl } from "@/core/http/api-url.util";
import type { DepartmentResponse } from "../models/api/response/department-response.model";
import type { CreateDepartment } from "../models/api/request/create-department.model";
import type { UpdateDepartment } from "../models/api/request/update-department.model";

const ENDPOINT = buildApiUrl(API_PREFIX.hrms, "departments");

export const departmentApi = {
  getAll(): Promise<DepartmentResponse[]> {
    return httpClient.getUnwrapped<DepartmentResponse[]>(ENDPOINT);
  },
  getById(id: string): Promise<DepartmentResponse> {
    return httpClient.getUnwrapped<DepartmentResponse>(`${ENDPOINT}/${id}`);
  },
  create(data: CreateDepartment): Promise<DepartmentResponse> {
    return httpClient.postUnwrapped<DepartmentResponse>(ENDPOINT, data);
  },
  update(data: UpdateDepartment): Promise<DepartmentResponse> {
    return httpClient.put<DepartmentResponse>(`${ENDPOINT}/${data.id}`, data);
  },
  remove(id: string): Promise<void> {
    return httpClient.delete<void>(`${ENDPOINT}/${id}`);
  },
};
