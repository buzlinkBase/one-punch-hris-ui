import httpClient from "@/core/http/http-client";
import { API_PREFIX, buildApiUrl } from "@/core/http/api-url.util";
import type { LoginRequest } from "../models/api/request/login-request.model";
import type { LoginResponse } from "../models/api/response/login-response.model";
import type { RegisterRequest } from "@/app/modules/auth/register/models/api/request/register-request.model";
import type { RegisterResponse } from "@/app/modules/auth/register/models/api/response/register-response.model";

const BASE_URL = buildApiUrl(API_PREFIX.auth, "users");

export const authApi = {
  login(data: LoginRequest): Promise<LoginResponse> {
    return httpClient.postUnwrapped<LoginResponse>(`${BASE_URL}/login`, data);
  },
  loginWithGoogle(code: string): Promise<LoginResponse> {
    return httpClient.postUnwrapped<LoginResponse>(`${BASE_URL}/login-google-callback`, { code });
  },
  register(data: RegisterRequest): Promise<RegisterResponse> {
    return httpClient.postUnwrapped<RegisterResponse>(`${BASE_URL}/create-account`, data);
  },
};
