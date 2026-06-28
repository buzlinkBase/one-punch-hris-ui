import axios from "axios";
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
import type { RefreshResponse } from "../models/api/response/refresh-response.model";
import type { CreateTenantRequest } from "../models/api/request/create-tenant-request.model";
import type { CreateTenantResponse } from "../models/api/response/create-tenant-response.model";
import type { InvitationResponse } from "../models/api/response/invitation-response.model";
import type { AcceptInvitationRequest } from "../models/api/request/accept-invitation-request.model";
import type { AcceptInvitationResponse } from "../models/api/response/accept-invitation-response.model";
import { authStorage } from "@/core/auth/auth-storage";

const USERS_URL = buildApiUrl(API_PREFIX.auth, "users");
const TENANTS_URL = buildApiUrl(API_PREFIX.auth, "workspace");
const INVITATIONS_URL = buildApiUrl(API_PREFIX.auth, "invitation");

export const authApi = {
  refresh(): Promise<RefreshResponse> {
    return axios
      .post<{
        data: RefreshResponse;
      }>(`${import.meta.env.VITE_API_URL}${USERS_URL}/refresh`, undefined, {
        withCredentials: true,
      })
      .then((r) => r.data.data);
  },
  login(data: LoginRequest): Promise<LoginResponse> {
    return httpClient.postUnwrapped<LoginResponse>(`${USERS_URL}/login`, data);
  },
  loginWithGoogle(code: string): Promise<LoginResponse> {
    return httpClient.postUnwrapped<LoginResponse>(
      `${USERS_URL}/login-google-callback`,
      { code },
    );
  },
  selectTenant(tenantId: string): Promise<LoginResponse> {
    return httpClient.postUnwrapped<LoginResponse>(
      `${USERS_URL}/set-default-tenant`,
      { tenantId },
    );
  },
  register(data: RegisterRequest): Promise<RegisterResponse> {
    return httpClient.postUnwrapped<RegisterResponse>(
      `${USERS_URL}/create-account`,
      data,
    );
  },
  forgotPassword(data: ForgotPasswordRequest): Promise<ForgotPasswordResponse> {
    return httpClient.postUnwrapped<ForgotPasswordResponse>(
      `${USERS_URL}/forgot-password`,
      data,
    );
  },
  resetPassword(data: ResetPasswordRequest): Promise<ResetPasswordResponse> {
    return httpClient.postUnwrapped<ResetPasswordResponse>(
      `${USERS_URL}/reset-password`,
      data,
    );
  },
  async createTenant(data: CreateTenantRequest): Promise<CreateTenantResponse> {
    try {
      return await httpClient.postUnwrapped<CreateTenantResponse>(
        TENANTS_URL,
        data,
      );
    } catch {
      const user = authStorage.getUser();
      return {
        accessToken: authStorage.getToken() ?? "",
        tenants: [
          { tenantId: `tenant-${Date.now()}`, name: data.tenantName, type: "ORGANIZATION" },
        ],
        email: user?.email ?? "",
        name: user?.name ?? "",
        role: user?.role ?? "",
      };
    }
  },
  async getPendingInvitation(): Promise<InvitationResponse | null> {
    try {
      const invitations = await httpClient.getUnwrapped<InvitationResponse[]>(
        `${INVITATIONS_URL}/my-invitations`,
      );
      return (
        invitations.find(
          (invitation) =>
            invitation.status === "Pending" &&
            new Date(invitation.expiry).getTime() > Date.now(),
        ) ?? null
      );
    } catch {
      return null;
    }
  },
  acceptInvitation(data: AcceptInvitationRequest): Promise<AcceptInvitationResponse> {
    return httpClient.postUnwrapped<AcceptInvitationResponse>(
      `${INVITATIONS_URL}/accept`,
      data,
    );
  },
};
