import httpClient from "@/core/http/http-client";
import { API_PREFIX, buildApiUrl } from "@/core/http/api-url.util";
import type { LoginRequest } from "../models/api/request/login-request.model";
import type { LoginResponse } from "../models/api/response/login-response.model";

const BASE_URL = buildApiUrl(API_PREFIX.auth, "users");

export const authApi = {
  login(data: LoginRequest): Promise<LoginResponse> {
    return httpClient.postUnwrapped<LoginResponse>(`${BASE_URL}/login`, data);
  },
};
