import httpClient from "@/core/http/http-client";
import type { EmployeeResponse } from "../models/api/response/employee-response.model";
import type { CreateEmployee } from "../models/api/request/create-employee.model";
import type { UpdateEmployee } from "../models/api/request/update-employee.model";

const ENDPOINT = "employees";

const paymentMethods: EmployeeResponse["paymentMethod"][] = ["ATM", "Cash"];
const salaryTypes: EmployeeResponse["salaryType"][] = [
  "Daily",
  "Monthly Variable",
  "Monthly Fixed",
];
const employmentStatuses: EmployeeResponse["employmentStatus"][] = [
  "Probationary",
  "Regular",
  "Contractual",
  "Project Based",
  "Seasonal",
];
const jobLevels: EmployeeResponse["jobLevel"][] = [
  "Rank and File",
  "Supervisor",
  "Manager",
  "Executive",
];

const MOCK_EMPLOYEES: EmployeeResponse[] = Array.from(
  { length: 24 },
  (_, i) => ({
    id: `emp-${1001 + i}`,
    employeeNo: `EMP-${1001 + i}`,
    firstName: `First${i + 1}`,
    lastName: `Last${i + 1}`,
    middleName: i % 3 === 0 ? `M${i + 1}` : undefined,
    email: `employee${i + 1}@onepunch.local`,
    departmentId: `dept-${(i % 6) + 1}`,
    operationAreaId: `op-${(i % 6) + 1}`,
    payrollGroupId: `pg-${(i % 4) + 1}`,
    paymentMethod: paymentMethods[i % paymentMethods.length],
    salaryType: salaryTypes[i % salaryTypes.length],
    employmentStatus: employmentStatuses[i % employmentStatuses.length],
    jobLevel: jobLevels[i % jobLevels.length],
    hireDate: `2024-${String((i % 12) + 1).padStart(2, "0")}-${String((i % 27) + 1).padStart(2, "0")}`,
    status: i % 7 === 0 ? "INACTIVE" : "ACTIVE",
  }),
);

export const employeeApi = {
  async getAll(): Promise<EmployeeResponse[]> {
    try {
      const data = await httpClient.getUnwrapped<EmployeeResponse[]>(ENDPOINT);
      return data.length ? data : MOCK_EMPLOYEES;
    } catch {
      return MOCK_EMPLOYEES;
    }
  },

  async getById(id: string): Promise<EmployeeResponse> {
    try {
      return await httpClient.getUnwrapped<EmployeeResponse>(
        `${ENDPOINT}/${id}`,
      );
    } catch {
      const match = MOCK_EMPLOYEES.find((item) => item.id === id);
      if (match) return match;
      throw new Error(`Employee ${id} not found`);
    }
  },

  create(data: CreateEmployee): Promise<EmployeeResponse> {
    return httpClient.postUnwrapped<EmployeeResponse>(ENDPOINT, data);
  },

  update(data: UpdateEmployee): Promise<EmployeeResponse> {
    return httpClient.put<EmployeeResponse>(`${ENDPOINT}/${data.id}`, data);
  },

  remove(id: string): Promise<void> {
    return httpClient.delete<void>(`${ENDPOINT}/${id}`);
  },
};
