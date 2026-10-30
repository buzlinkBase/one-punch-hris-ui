import httpClient from "@/core/http/http-client";
import { withDeviationAck } from "@/core/http/deviation-ack";
import { API_PREFIX, buildApiUrl } from "@/core/http/api-url.util";
import type { CompanyPolicyResponse } from "../models/api/response/company-policy-response.model";
import type { UpdateCompanyPolicy } from "../models/api/request/update-company-policy.model";

const ENDPOINT = buildApiUrl(API_PREFIX.hrms, "generalsettings/company");

export const companyPolicyApi = {
  get(): Promise<CompanyPolicyResponse> {
    return httpClient.getUnwrapped<CompanyPolicyResponse>(ENDPOINT);
  },

  /** Asks for an acknowledgment first when it brings in a DOLE deviation (withDeviationAck). */
  update(data: UpdateCompanyPolicy): Promise<void> {
    return withDeviationAck((config) =>
      httpClient.put<void>(ENDPOINT, data, config),
    );
  },
};
