export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  /** The Terms of Service version the person agreed to (absent when none is published yet). */
  termsVersion?: number;
}
