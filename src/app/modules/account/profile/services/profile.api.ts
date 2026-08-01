import httpClient from "@/core/http/http-client";
import { API_PREFIX, buildApiUrl } from "@/core/http/api-url.util";
import type { UserProfileResponse } from "../models/api/response/user-profile-response.model";
import type { UpdateProfileRequest } from "../models/api/request/update-profile-request.model";
import type { ChangePasswordRequest } from "../models/api/request/change-password-request.model";
import type { SetPasswordRequest } from "../models/api/request/set-password-request.model";

const USERS_URL = buildApiUrl(API_PREFIX.auth, "users");

export const profileApi = {
  getProfile(): Promise<UserProfileResponse> {
    return httpClient.getUnwrapped<UserProfileResponse>(`${USERS_URL}/profile`);
  },
  async updateProfile(data: UpdateProfileRequest): Promise<void> {
    await httpClient.patch(`${USERS_URL}/profile`, data);
  },
  async changePassword(data: ChangePasswordRequest): Promise<void> {
    await httpClient.post(`${USERS_URL}/change-password`, data);
  },
  async setPassword(data: SetPasswordRequest): Promise<void> {
    await httpClient.post(`${USERS_URL}/set-password`, data);
  },
};
