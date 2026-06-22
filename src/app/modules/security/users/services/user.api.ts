import httpClient from "@/core/http/http-client";
import { API_PREFIX, buildApiUrl } from "@/core/http/api-url.util";
import type { UserResponse } from "../models/api/response/user-response.model";
import type { CreateUser } from "../models/api/request/create-user.model";
import type { UpdateUser } from "../models/api/request/update-user.model";

const ENDPOINT = buildApiUrl(API_PREFIX.hrms, "users");

const userTypes: UserResponse["userType"][] = ["Administrator", "HR", "Employee"];

const MOCK_USERS: UserResponse[] = Array.from({ length: 20 }, (_, i) => ({
  id: `user-${1001 + i}`,
  code: `USR-${1001 + i}`,
  fullName: `Sample User ${i + 1}`,
  username: `user${i + 1}`,
  userType: userTypes[i % userTypes.length],
  status: i % 5 === 0 ? "INACTIVE" : "ACTIVE",
}));

export const userApi = {
  async getAll(): Promise<UserResponse[]> {
    try {
      const data = await httpClient.getUnwrapped<UserResponse[]>(ENDPOINT);
      return data.length ? data : MOCK_USERS;
    } catch {
      return MOCK_USERS;
    }
  },

  async getById(id: string): Promise<UserResponse> {
    try {
      return await httpClient.getUnwrapped<UserResponse>(`${ENDPOINT}/${id}`);
    } catch {
      const match = MOCK_USERS.find((item) => item.id === id);
      if (match) return match;
      throw new Error(`User ${id} not found`);
    }
  },

  create(data: CreateUser): Promise<UserResponse> {
    return httpClient.postUnwrapped<UserResponse>(ENDPOINT, data);
  },

  update(data: UpdateUser): Promise<UserResponse> {
    return httpClient.put<UserResponse>(`${ENDPOINT}/${data.id}`, data);
  },

  remove(id: string): Promise<void> {
    return httpClient.delete<void>(`${ENDPOINT}/${id}`);
  },
};
