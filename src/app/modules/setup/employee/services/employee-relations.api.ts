import httpClient from "@/core/http/http-client";
import { API_PREFIX, buildApiUrl } from "@/core/http/api-url.util";
import type {
  DependentResponse,
  EducationResponse,
  SkillResponse,
  DocRecordResponse,
  EmploymentHistoryResponse,
  AssignAssetResponse,
} from "../models/api/response/employee-relations-response.models";

const url = (resource: string) => buildApiUrl(API_PREFIX.hrms, resource);

// ── Dependents ────────────────────────────────────────────────────────────────

const DEP = url("EmployeeDependents");

export const dependentApi = {
  getByEmployee: (empId: string) =>
    httpClient.getUnwrapped<DependentResponse[]>(
      `${DEP}/employee?emp_id=${empId}`,
    ),
  create: (data: Omit<DependentResponse, "id">) =>
    httpClient.postUnwrapped<DependentResponse>(DEP, data),
  update: (data: DependentResponse) =>
    httpClient.put<DependentResponse>(`${DEP}/${data.id}`, data),
  remove: (id: string) => httpClient.delete<void>(`${DEP}/${id}`),
};

// ── Educations ────────────────────────────────────────────────────────────────

const EDU = url("EmployeeEducations");

export const educationApi = {
  getByEmployee: (empId: string) =>
    httpClient.getUnwrapped<EducationResponse[]>(
      `${EDU}/employee?emp_id=${empId}`,
    ),
  create: (data: Omit<EducationResponse, "id">) =>
    httpClient.postUnwrapped<EducationResponse>(EDU, data),
  update: (data: EducationResponse) =>
    httpClient.put<EducationResponse>(`${EDU}/${data.id}`, data),
  remove: (id: string) => httpClient.delete<void>(`${EDU}/${id}`),
};

// ── Skills ────────────────────────────────────────────────────────────────────

const SKL = url("EmployeeSkills");

export const skillApi = {
  getByEmployee: (empId: string) =>
    httpClient.getUnwrapped<SkillResponse[]>(`${SKL}/employee?emp_id=${empId}`),
  create: (data: Omit<SkillResponse, "id">) =>
    httpClient.postUnwrapped<SkillResponse>(SKL, data),
  update: (data: SkillResponse) =>
    httpClient.put<SkillResponse>(`${SKL}/${data.id}`, data),
  remove: (id: string) => httpClient.delete<void>(`${SKL}/${id}`),
};

// ── Document Records ──────────────────────────────────────────────────────────

const DOC = url("EmployeeDocRecords");

export const docRecordApi = {
  getByEmployee: (empId: string) =>
    httpClient.getUnwrapped<DocRecordResponse[]>(
      `${DOC}/employee?emp_id=${empId}`,
    ),
  create: (data: Omit<DocRecordResponse, "id">) =>
    httpClient.postUnwrapped<DocRecordResponse>(DOC, data),
  update: (data: DocRecordResponse) =>
    httpClient.put<DocRecordResponse>(`${DOC}/${data.id}`, data),
  remove: (id: string) => httpClient.delete<void>(`${DOC}/${id}`),
};

// ── Employment History ────────────────────────────────────────────────────────

const EMP_HIST = url("EmploymentHistories");

export const employmentHistoryApi = {
  getByEmployee: (empId: string) =>
    httpClient.getUnwrapped<EmploymentHistoryResponse[]>(
      `${EMP_HIST}/employee?emp_id=${empId}`,
    ),
  create: (data: Omit<EmploymentHistoryResponse, "id">) =>
    httpClient.postUnwrapped<EmploymentHistoryResponse>(EMP_HIST, data),
  update: (data: EmploymentHistoryResponse) =>
    httpClient.put<EmploymentHistoryResponse>(`${EMP_HIST}/${data.id}`, data),
  remove: (id: string) => httpClient.delete<void>(`${EMP_HIST}/${id}`),
};

// ── Assign Assets ─────────────────────────────────────────────────────────────

const ASSET = url("EmployeeAssignAssets");

export const assignAssetApi = {
  getByEmployee: (empId: string) =>
    httpClient.getUnwrapped<AssignAssetResponse[]>(
      `${ASSET}/employee?emp_id=${empId}`,
    ),
  create: (data: Omit<AssignAssetResponse, "id">) =>
    httpClient.postUnwrapped<AssignAssetResponse>(ASSET, data),
  update: (data: AssignAssetResponse) =>
    httpClient.put<AssignAssetResponse>(`${ASSET}/${data.id}`, data),
  remove: (id: string) => httpClient.delete<void>(`${ASSET}/${id}`),
};
