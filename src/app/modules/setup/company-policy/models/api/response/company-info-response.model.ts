export interface CompanyInfoResponse {
  id?: string;
  code?: string;
  description: string;
  shortName?: string;
  address?: string;
  contact?: string;
  email?: string;
  tin?: string;
  rdoCode?: string;
  sssNumber?: string;
  philHealthNumber?: string;
  pagIbigNumber?: string;
  authorizedSignatoryName?: string;
  authorizedSignatoryTitle?: string;
  /** A short-lived link to the logo; empty when there's none. */
  logoUrl?: string;
}
