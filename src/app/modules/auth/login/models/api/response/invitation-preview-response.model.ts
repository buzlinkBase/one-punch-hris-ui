export interface InvitationPreviewResponse {
  email: string;
  tenantName: string;
  role: string;
  roles?: string[];
  employeeId?: string;
  name?: string;
  expiry: string;
  valid: boolean;
  accountExists: boolean;
}
