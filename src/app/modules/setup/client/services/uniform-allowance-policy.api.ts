import httpClient from "@/core/http/http-client";
import { API_PREFIX, buildApiUrl } from "@/core/http/api-url.util";
import type {
  UniformAllowanceCreditLog,
  UniformAllowanceCreditLogFilter,
  UniformAllowancePolicy,
  UniformAllowancePolicyList,
  UniformAllowanceSchedule,
  UniformCreditPreview,
  UpsertUniformAllowancePolicy,
} from "../models/api/response/uniform-allowance-policy.model";

const CLIENTS_ENDPOINT = buildApiUrl(API_PREFIX.hrms, "clients");
const UNIFORM_ALLOWANCE_ENDPOINT = buildApiUrl(
  API_PREFIX.hrms,
  "uniformallowance",
);

const policies = (clientId: string) =>
  `${CLIENTS_ENDPOINT}/${clientId}/uniform-allowance-policies`;

export const uniformAllowancePolicyApi = {
  list(clientId: string): Promise<UniformAllowancePolicyList> {
    return httpClient.getUnwrapped<UniformAllowancePolicyList>(
      policies(clientId),
    );
  },

  preview(clientId: string, count = 3): Promise<UniformCreditPreview[]> {
    return httpClient
      .getUnwrapped<UniformCreditPreview[]>(`${policies(clientId)}/preview`, {
        params: { count },
      })
      .then((res) => res ?? []);
  },

  create(
    clientId: string,
    payload: UpsertUniformAllowancePolicy,
  ): Promise<UniformAllowancePolicy> {
    return httpClient.postUnwrapped<UniformAllowancePolicy>(
      policies(clientId),
      payload,
    );
  },

  update(
    clientId: string,
    policyId: string,
    payload: UpsertUniformAllowancePolicy,
  ): Promise<UniformAllowancePolicy> {
    return httpClient.putUnwrapped<UniformAllowancePolicy>(
      `${policies(clientId)}/${policyId}`,
      payload,
    );
  },

  remove(clientId: string, policyId: string): Promise<void> {
    return httpClient.delete<void>(`${policies(clientId)}/${policyId}`);
  },

  creditLog(
    filter: UniformAllowanceCreditLogFilter,
  ): Promise<UniformAllowanceCreditLog[]> {
    return httpClient
      .getUnwrapped<UniformAllowanceCreditLog[]>(
        `${UNIFORM_ALLOWANCE_ENDPOINT}/credit-log`,
        { params: filter },
      )
      .then((res) => res ?? []);
  },

  employeeSchedule(employeeId: string): Promise<UniformAllowanceSchedule> {
    return httpClient.getUnwrapped<UniformAllowanceSchedule>(
      `${UNIFORM_ALLOWANCE_ENDPOINT}/${employeeId}/schedule`,
    );
  },
};
