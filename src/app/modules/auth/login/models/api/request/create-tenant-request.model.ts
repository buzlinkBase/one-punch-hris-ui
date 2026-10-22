export interface CreateTenantRequest {
  tenantName: string;
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
  industryCode?: string;
  subIndustryCode?: string;
  businessType?: string;
  companySize?: string;
  acquisitionSource?: string;
  acquisitionSourceOther?: string;
}
