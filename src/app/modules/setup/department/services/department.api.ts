import httpClient from "@/core/http/http-client";
import type { DepartmentResponse } from "../models/api/response/department-response.model";
import type { CreateDepartment } from "../models/api/request/create-department.model";
import type { UpdateDepartment } from "../models/api/request/update-department.model";

const ENDPOINT = "departments";

const MOCK_DEPARTMENTS: DepartmentResponse[] = Array.from(
  { length: 24 },
  (_, i) => ({
    id: `dept-${i + 1}`,
    code: `DEP${String(i + 1).padStart(3, "0")}`,
    name: `Department ${i + 1}`,
    branchId: i % 2 === 0 ? "branch-main" : "branch-north",
    headId: `emp-${1001 + i}`,
    status: i % 6 === 0 ? "INACTIVE" : "ACTIVE",
  }),
);

export const departmentApi = {
  async getAll(): Promise<DepartmentResponse[]> {
    try {
      const data =
        await httpClient.getUnwrapped<DepartmentResponse[]>(ENDPOINT);
      return data.length ? data : MOCK_DEPARTMENTS;
    } catch {
      return MOCK_DEPARTMENTS;
    }
  },

  async getById(id: string): Promise<DepartmentResponse> {
    try {
      return await httpClient.getUnwrapped<DepartmentResponse>(
        `${ENDPOINT}/${id}`,
      );
    } catch {
      const match = MOCK_DEPARTMENTS.find((item) => item.id === id);
      if (match) return match;
      throw new Error(`Department ${id} not found`);
    }
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
