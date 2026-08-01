export interface UserProfileResponse {
  id: string;
  defaultTenantName: string | null;
  defaultTenantId: string | null;
  defaultTenantRole: string | null;
  email: string | null;
  fullName: string | null;
  phoneNumber: string | null;
  status: string;
}
