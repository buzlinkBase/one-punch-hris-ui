export interface InvitationPreviewResponse {
  email: string;
  tenantName: string;
  role: string;
  expiry: string;
  valid: boolean;
  accountExists: boolean;
}
