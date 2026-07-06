import httpClient from "@/core/http/http-client";
import { API_PREFIX, buildApiUrl } from "@/core/http/api-url.util";
import type { EmployeeResponse } from "../models/api/response/employee-response.model";
import type { CreateEmployee } from "../models/api/request/create-employee.model";
import type { UpdateEmployee } from "../models/api/request/update-employee.model";
import dayjs from "dayjs";
import type { PaginatedResponse } from "@/core/pagination-model";

const BASE_URL = buildApiUrl(API_PREFIX.hrms, "employees");

const modeOfPayments: EmployeeResponse["modeOfPayment"][] = ["ATM", "Cash"];
const salaryTypes: EmployeeResponse["salaryType"][] = [
  "DAILY",
  "MONTHLY_VARIABLE",
  "MONTHLY_FIXED",
];
const employmentStatuses: EmployeeResponse["employmentStatus"][] = [
  "Probationary",
  "Regular",
  "Contractual",
  "ProjectBased",
  "Seasonal",
  "Casual",
  "PartTime",
  "Term",
  "Internship",
];
const jobLevels: EmployeeResponse["jobLevel"][] = [
  "Managerial",
  "Supervisory",
  "Executive",
  "RankandFile",
  "EntryLevel",
  "TechnicalSpecialist",
  "Contractual",
  "FieldStaff",
];

const MOCK_EMPLOYEES: EmployeeResponse[] = Array.from(
  { length: 24 },
  (_, i) => ({
    id: `emp-${1001 + i}`,
    bioId: 1001 + i,
    employeeNo: `EMP-${1001 + i}`,
    firstName: `First${i + 1}`,
    lastName: `Last${i + 1}`,
    middleName: i % 3 === 0 ? `M${i + 1}` : undefined,
    departmentId: `dept-${(i % 6) + 1}`,
    areaId: `op-${(i % 6) + 1}`,
    payrollGroupId: `pg-${(i % 4) + 1}`,
    modeOfPayment: modeOfPayments[i % modeOfPayments.length],
    salaryType: salaryTypes[i % salaryTypes.length],
    employmentStatus: employmentStatuses[i % employmentStatuses.length],
    jobLevel: jobLevels[i % jobLevels.length],
    dateRegistered: dayjs().subtract(i, "month").toISOString(),
    hireDate: `2024-${String((i % 12) + 1).padStart(2, "0")}-${String((i % 27) + 1).padStart(2, "0")}`,
    status: i % 7 === 0 ? "INACTIVE" : "ACTIVE",
  }),
);

export const employeeApi = {
  async getAll(): Promise<EmployeeResponse[]> {
    try {
      const data =
        await httpClient.getUnwrapped<PaginatedResponse<EmployeeResponse[]>>(
          BASE_URL,
        );
      return data.data.length ? data.data : MOCK_EMPLOYEES;
    } catch {
      return MOCK_EMPLOYEES;
    }
  },

  async getById(id: string): Promise<EmployeeResponse> {
    try {
      return await httpClient.getUnwrapped<EmployeeResponse>(
        `${BASE_URL}/${id}`,
      );
    } catch {
      const match = MOCK_EMPLOYEES.find((item) => item.id === id);
      if (match) return match;
      throw new Error(`Employee ${id} not found`);
    }
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
};
