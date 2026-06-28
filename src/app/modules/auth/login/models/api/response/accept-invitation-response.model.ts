export interface AcceptInvitationResponse {
  accessToken: string;
  tenants: string[];
  email: string;
  name: string;
  role: string;
}
