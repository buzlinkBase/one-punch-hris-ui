export interface LoginResponse {
  errorMessage: string;
  accessToken: string;
  refreshToken: string;
  tenants: string[];
  expiry: string;
}
