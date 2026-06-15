import httpClient from "@/core/http/http-client";
import type { LoginRequest } from "../models/api/request/login-request.model";
import type { LoginResponse } from "../models/api/response/login-response.model";

const ENDPOINT = `${import.meta.env.VITE_PREFIX_AUTH}/api/${import.meta.env.VITE_API_VERSION}/users/login`;

export const authApi = {
  login(data: LoginRequest): Promise<LoginResponse> {
    return httpClient.postUnwrapped<LoginResponse>(ENDPOINT, data);
  },
};
