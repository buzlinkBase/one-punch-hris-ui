import httpClient from "@/core/http/http-client";
import axiosInstance from "@/core/http/axios.instance";
import { API_PREFIX, buildApiUrl } from "@/core/http/api-url.util";
import type {
  EmployeeFullResponse,
  EmployeeResponse,
} from "../models/api/response/employee-response.model";
import type { CreateEmployee } from "../models/api/request/create-employee.model";
import type { UpdateEmployee } from "../models/api/request/update-employee.model";
import type { PaginatedResponse } from "@/core/pagination-model";

const BASE_URL = buildApiUrl(API_PREFIX.hrms, "employees");

export const employeeApi = {
  async getAll(): Promise<EmployeeResponse[]> {
    try {
      const data =
        await httpClient.getUnwrapped<PaginatedResponse<EmployeeResponse[]>>(
          BASE_URL,
        );
      return data.data ?? [];
    } catch {
      return [];
    }
  },

  async getById(id: string): Promise<EmployeeResponse> {
    return httpClient.getUnwrapped<EmployeeResponse>(`${BASE_URL}/${id}`);
  },

  async getFullById(id: string): Promise<EmployeeFullResponse> {
    return httpClient.getUnwrapped<EmployeeFullResponse>(
      `${BASE_URL}/${id}/full`,
    );
  },

  create(data: CreateEmployee): Promise<EmployeeResponse> {
    return httpClient.postUnwrapped<EmployeeResponse>(BASE_URL, data);
  },

  update(data: UpdateEmployee): Promise<EmployeeResponse> {
    return httpClient.put<EmployeeResponse>(`${BASE_URL}/${data.id}`, data);
  },

  remove(id: string): Promise<void> {
    return httpClient.delete<void>(`${BASE_URL}/${id}`);
  },

  async uploadEmployees(file: File): Promise<void> {
    const form = new FormData();
    form.append("excelFile", file);
    await axiosInstance.post(`${BASE_URL}/upload-employees`, form, {
      headers: { "Content-Type": undefined },
    });
  },

  async downloadTemplate(): Promise<void> {
    const response = await axiosInstance.get(`${BASE_URL}/export-template`, {
      responseType: "blob",
    });
    const url = URL.createObjectURL(new Blob([response.data as BlobPart]));
    const a = document.createElement("a");
    a.href = url;
    a.download = "employees.xlsx";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  },
};
