export interface LoginResponse {
  errorMessage: string;
  accessToken: string;
  tenants: string[];
  expiry: string;
  email: string;
  name: string;
  role: string;
}
