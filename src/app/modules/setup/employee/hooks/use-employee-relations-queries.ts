import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  dependentApi,
  educationApi,
  skillApi,
  docRecordApi,
  employmentHistoryApi,
  assignAssetApi,
  priorEmployerTaxRecordApi,
  payrollOpeningBalanceApi,
  type PayrollOpeningBalanceInput,
} from "../services/employee-relations.api";
import type {
  DependentResponse,
  EducationResponse,
  SkillResponse,
  DocRecordResponse,
  EmploymentHistoryResponse,
  AssignAssetResponse,
  PriorEmployerTaxRecordResponse,
} from "../models/api/response/employee-relations-response.models";

// ── Dependents ────────────────────────────────────────────────────────────────

const DEP_KEY = (empId: string) => ["employee-dependents", empId];

export function useDependentsByEmployee(empId: string) {
  return useQuery({
    queryKey: DEP_KEY(empId),
    queryFn: () => dependentApi.getByEmployee(empId),
    enabled: !!empId,
  });
}

export function useCreateDependent(empId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<DependentResponse, "id">) =>
      dependentApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: DEP_KEY(empId) }),
  });
}

export function useUpdateDependent(empId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: DependentResponse) => dependentApi.update(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: DEP_KEY(empId) }),
  });
}

export function useDeleteDependent(empId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => dependentApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: DEP_KEY(empId) }),
  });
}

// ── Educations ────────────────────────────────────────────────────────────────

const EDU_KEY = (empId: string) => ["employee-educations", empId];

export function useEducationsByEmployee(empId: string) {
  return useQuery({
    queryKey: EDU_KEY(empId),
    queryFn: () => educationApi.getByEmployee(empId),
    enabled: !!empId,
  });
}

export function useCreateEducation(empId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<EducationResponse, "id">) =>
      educationApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: EDU_KEY(empId) }),
  });
}

export function useUpdateEducation(empId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: EducationResponse) => educationApi.update(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: EDU_KEY(empId) }),
  });
}

export function useDeleteEducation(empId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => educationApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: EDU_KEY(empId) }),
  });
}

// ── Skills ────────────────────────────────────────────────────────────────────

const SKL_KEY = (empId: string) => ["employee-skills", empId];

export function useSkillsByEmployee(empId: string) {
  return useQuery({
    queryKey: SKL_KEY(empId),
    queryFn: () => skillApi.getByEmployee(empId),
    enabled: !!empId,
  });
}

export function useCreateSkill(empId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<SkillResponse, "id">) => skillApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: SKL_KEY(empId) }),
  });
}

export function useUpdateSkill(empId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: SkillResponse) => skillApi.update(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: SKL_KEY(empId) }),
  });
}

export function useDeleteSkill(empId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => skillApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: SKL_KEY(empId) }),
  });
}

// ── Document Records ──────────────────────────────────────────────────────────

const DOC_KEY = (empId: string) => ["employee-doc-records", empId];

export function useDocRecordsByEmployee(empId: string) {
  return useQuery({
    queryKey: DOC_KEY(empId),
    queryFn: () => docRecordApi.getByEmployee(empId),
    enabled: !!empId,
  });
}

export function useCreateDocRecord(empId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<DocRecordResponse, "id">) =>
      docRecordApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: DOC_KEY(empId) }),
  });
}

export function useUpdateDocRecord(empId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: DocRecordResponse) => docRecordApi.update(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: DOC_KEY(empId) }),
  });
}

export function useDeleteDocRecord(empId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => docRecordApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: DOC_KEY(empId) }),
  });
}

// ── Employment History ────────────────────────────────────────────────────────

const HIST_KEY = (empId: string) => ["employment-histories", empId];

export function useEmploymentHistoriesByEmployee(empId: string) {
  return useQuery({
    queryKey: HIST_KEY(empId),
    queryFn: () => employmentHistoryApi.getByEmployee(empId),
    enabled: !!empId,
  });
}

export function useCreateEmploymentHistory(empId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<EmploymentHistoryResponse, "id">) =>
      employmentHistoryApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: HIST_KEY(empId) }),
  });
}

export function useUpdateEmploymentHistory(empId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: EmploymentHistoryResponse) =>
      employmentHistoryApi.update(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: HIST_KEY(empId) }),
  });
}

export function useDeleteEmploymentHistory(empId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => employmentHistoryApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: HIST_KEY(empId) }),
  });
}

// ── Prior Employer Tax Records (BIR 2316) ────────────────────────────────────

const PRIOR_TAX_KEY = (empId: string) => [
  "employee-prior-employer-tax-records",
  empId,
];

export function usePriorEmployerTaxRecordsByEmployee(empId: string) {
  return useQuery({
    queryKey: PRIOR_TAX_KEY(empId),
    queryFn: () => priorEmployerTaxRecordApi.getByEmployee(empId),
    enabled: !!empId,
  });
}

export function useCreatePriorEmployerTaxRecord(empId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<PriorEmployerTaxRecordResponse, "id">) =>
      priorEmployerTaxRecordApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: PRIOR_TAX_KEY(empId) }),
  });
}

export function useUpdatePriorEmployerTaxRecord(empId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: PriorEmployerTaxRecordResponse) =>
      priorEmployerTaxRecordApi.update(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: PRIOR_TAX_KEY(empId) }),
  });
}

export function useDeletePriorEmployerTaxRecord(empId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => priorEmployerTaxRecordApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: PRIOR_TAX_KEY(empId) }),
  });
}

// ── Payroll Opening Balances (mid-year cutover) ──────────────────────────────

const OPENING_BALANCE_KEY = (empId: string) => [
  "payroll-opening-balances",
  empId,
];

export function useOpeningBalancesByEmployee(empId: string) {
  return useQuery({
    queryKey: OPENING_BALANCE_KEY(empId),
    queryFn: () => payrollOpeningBalanceApi.getByEmployee(empId),
    enabled: !!empId,
  });
}

export function useCreateOpeningBalance(empId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: PayrollOpeningBalanceInput) =>
      payrollOpeningBalanceApi.create(data),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: OPENING_BALANCE_KEY(empId) }),
  });
}

export function useUpdateOpeningBalance(empId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: PayrollOpeningBalanceInput & { id: string }) =>
      payrollOpeningBalanceApi.update(data),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: OPENING_BALANCE_KEY(empId) }),
  });
}

export function useDeleteOpeningBalance(empId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => payrollOpeningBalanceApi.remove(id),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: OPENING_BALANCE_KEY(empId) }),
  });
}

// ── Assign Assets ─────────────────────────────────────────────────────────────

const ASSET_KEY = (empId: string) => ["employee-assign-assets", empId];

export function useAssignAssetsByEmployee(empId: string) {
  return useQuery({
    queryKey: ASSET_KEY(empId),
    queryFn: () => assignAssetApi.getByEmployee(empId),
    enabled: !!empId,
  });
}

export function useCreateAssignAsset(empId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<AssignAssetResponse, "id">) =>
      assignAssetApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ASSET_KEY(empId) }),
  });
}

export function useUpdateAssignAsset(empId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: AssignAssetResponse) => assignAssetApi.update(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ASSET_KEY(empId) }),
  });
}

export function useDeleteAssignAsset(empId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => assignAssetApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ASSET_KEY(empId) }),
  });
}
