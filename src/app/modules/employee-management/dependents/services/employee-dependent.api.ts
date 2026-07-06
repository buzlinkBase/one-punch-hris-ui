import httpClient from "@/core/http/http-client";
import { API_PREFIX, buildApiUrl } from "@/core/http/api-url.util";
import type { EmployeeDependentResponse } from "../models/api/response/employee-dependent-response.model";
import type { CreateEmployeeDependent } from "../models/api/request/create-employee-dependent.model";
import type { UpdateEmployeeDependent } from "../models/api/request/update-employee-dependent.model";

const ENDPOINT = buildApiUrl(API_PREFIX.hrms, "employeedependents");

const RELATIONSHIPS = [
  "Spouse",
  "Son",
  "Daughter",
  "Father",
  "Mother",
  "Brother",
  "Sister",
];
const GENDERS = ["Male", "Female"];

const MOCK_DEPENDENTS: EmployeeDependentResponse[] = Array.from(
  { length: 20 },
  (_, i) => ({
    id: `dep-${i + 1}`,
    employeeId: `emp-${1001 + (i % 10)}`,
    fullName: [
      "Maria Santos",
      "Juan dela Cruz",
      "Ana Reyes",
      "Pedro Garcia",
      "Rosa Mendoza",
      "Carlos Bautista",
      "Luisa Torres",
      "Miguel Flores",
      "Elena Castro",
      "Roberto Ramos",
      "Celia Navarro",
      "Jose Hernandez",
      "Nora Villanueva",
      "Andres Morales",
      "Lita Gonzalez",
      "Eduardo Perez",
      "Carmelita Jimenez",
      "Fernando Lopez",
      "Teresita Ramirez",
      "Ernesto Cruz",
    ][i],
    relationship: RELATIONSHIPS[i % RELATIONSHIPS.length],
    gender: GENDERS[i % 2],
    dob: `${1970 + (i % 30)}-${String((i % 12) + 1).padStart(2, "0")}-${String((i % 28) + 1).padStart(2, "0")}`,
  }),
);

export const employeeDependentApi = {
  async getAll(): Promise<EmployeeDependentResponse[]> {
    try {
      const data =
        await httpClient.getUnwrapped<EmployeeDependentResponse[]>(ENDPOINT);
      return data.length ? data : MOCK_DEPENDENTS;
    } catch {
      return MOCK_DEPENDENTS;
    }
  },

  async getById(id: string): Promise<EmployeeDependentResponse> {
    try {
      return await httpClient.getUnwrapped<EmployeeDependentResponse>(
        `${ENDPOINT}/${id}`,
      );
    } catch {
      const match = MOCK_DEPENDENTS.find((d) => d.id === id);
      if (match) return match;
      throw new Error(`Dependent ${id} not found`);
    }
  },

  create(data: CreateEmployeeDependent): Promise<EmployeeDependentResponse> {
    return httpClient.postUnwrapped<EmployeeDependentResponse>(ENDPOINT, data);
  },

  update(data: UpdateEmployeeDependent): Promise<EmployeeDependentResponse> {
    return httpClient.put<EmployeeDependentResponse>(
      `${ENDPOINT}/${data.id}`,
      data,
    );
  },

  remove(id: string): Promise<void> {
    return httpClient.delete<void>(`${ENDPOINT}/${id}`);
  },
};
