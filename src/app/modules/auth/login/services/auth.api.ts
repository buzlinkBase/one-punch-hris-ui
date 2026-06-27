import httpClient from "@/core/http/http-client";
import { API_PREFIX, buildApiUrl } from "@/core/http/api-url.util";
import type { LoginRequest } from "../models/api/request/login-request.model";
import type { LoginResponse } from "../models/api/response/login-response.model";
import type { RegisterRequest } from "@/app/modules/auth/register/models/api/request/register-request.model";
import type { RegisterResponse } from "@/app/modules/auth/register/models/api/response/register-response.model";
import type { ForgotPasswordRequest } from "@/app/modules/auth/forgot-password/models/api/request/forgot-password-request.model";
import type { ForgotPasswordResponse } from "@/app/modules/auth/forgot-password/models/api/response/forgot-password-response.model";
import type { ResetPasswordRequest } from "@/app/modules/auth/reset-password/models/api/request/reset-password-request.model";
import type { ResetPasswordResponse } from "@/app/modules/auth/reset-password/models/api/response/reset-password-response.model";

const BASE_URL = buildApiUrl(API_PREFIX.auth, "users");

export const authApi = {
  login(data: LoginRequest): Promise<LoginResponse> {
    return httpClient.postUnwrapped<LoginResponse>(`${BASE_URL}/login`, data);
  },
  loginWithGoogle(code: string): Promise<LoginResponse> {
    return httpClient.postUnwrapped<LoginResponse>(
      `${BASE_URL}/login-google-callback`,
      { code },
    );
  },
  register(data: RegisterRequest): Promise<RegisterResponse> {
    return httpClient.postUnwrapped<RegisterResponse>(
      `${BASE_URL}/create-account`,
      data,
    );
  },
  forgotPassword(data: ForgotPasswordRequest): Promise<ForgotPasswordResponse> {
    console.log(data);
    return httpClient.postUnwrapped<ForgotPasswordResponse>(
      `${BASE_URL}/forgot-password`,
      data,
    );
  },
  resetPassword(data: ResetPasswordRequest): Promise<ResetPasswordResponse> {
    return httpClient.postUnwrapped<ResetPasswordResponse>(
      `${BASE_URL}/reset-password`,
      data,
    );
  },
};
