import httpClient from "@/core/http/http-client";
import { API_PREFIX, buildApiUrl } from "@/core/http/api-url.util";
import type { CompanyInfoResponse } from "../models/api/response/company-info-response.model";
import type { UpdateCompanyInfo } from "../models/api/request/update-company-info.model";

const ENDPOINT = buildApiUrl(API_PREFIX.hrms, "companysettings");

export const companyInfoApi = {
  get(): Promise<CompanyInfoResponse> {
    return httpClient.getUnwrapped<CompanyInfoResponse>(ENDPOINT);
  },

  update(data: UpdateCompanyInfo): Promise<void> {
    return httpClient.put<void>(ENDPOINT, data);
  },

  /** Stores (or replaces) the logo; resolves to a link to show it. */
  async uploadLogo(file: File): Promise<string> {
    const form = new FormData();
    form.append("file", file);
    const result = await httpClient.postUnwrapped<{ url: string }>(
      `${ENDPOINT}/logo`,
      form,
      { headers: { "Content-Type": undefined } },
    );
    return result.url;
  },

  removeLogo(): Promise<void> {
    return httpClient.delete<void>(`${ENDPOINT}/logo`);
  },
};
