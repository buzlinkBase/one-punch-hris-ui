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
import type { TenantStatusResponse } from "../models/api/response/tenant-status-response.model";
import type { InvitationPreviewResponse } from "../models/api/response/invitation-preview-response.model";
import type { AcceptInvitationByTokenRequest } from "../models/api/request/accept-invitation-by-token-request.model";
import type { SendInvitationRequest } from "@/app/modules/security/users/models/api/request/send-invitation-request.model";
import { authStorage } from "@/core/auth/auth-storage";

const USERS_URL = buildApiUrl(API_PREFIX.auth, "users");
const TENANTS_URL = buildApiUrl(API_PREFIX.auth, "workspace");
const INVITATIONS_URL = buildApiUrl(API_PREFIX.auth, "invitation");
const TENANT_REQUEST_URL = buildApiUrl(API_PREFIX.auth, "tenantrequest");

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
    return httpClient.postUnwrapped<LoginResponse>(`${USERS_URL}/login`, data, {
      _skipErrorNotification: true,
    });
  },
  loginWithGoogle(code: string): Promise<LoginResponse> {
    return httpClient.postUnwrapped<LoginResponse>(
      `${USERS_URL}/login-google-callback`,
      { code },
      { _skipErrorNotification: true },
    );
  },
  signUpWithGoogle(code: string): Promise<LoginResponse> {
    return httpClient.postUnwrapped<LoginResponse>(
      `${USERS_URL}/signup-google-callback`,
      { code },
      { _skipErrorNotification: true },
    );
  },
  selectTenant(tenantId: string): Promise<LoginResponse> {
    return httpClient.postUnwrapped<LoginResponse>(
      `${USERS_URL}/set-default-tenant`,
      { tenantId },
      { _skipErrorNotification: true },
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
        tenants: [],
        email: user?.email ?? "",
        name: user?.name ?? "",
        roles: user?.roles ?? [],
        permissions: user?.permissions ?? [],
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
  acceptInvitation(
    data: AcceptInvitationRequest,
  ): Promise<AcceptInvitationResponse> {
    return httpClient.postUnwrapped<AcceptInvitationResponse>(
      `${INVITATIONS_URL}/accept`,
      data,
    );
  },
  getTenantCreationStatus(tenantId: string): Promise<TenantStatusResponse> {
    return httpClient.getUnwrapped<TenantStatusResponse>(
      `${TENANT_REQUEST_URL}/status/${tenantId}`,
    );
  },
  getInvitationPreview(token: string): Promise<InvitationPreviewResponse> {
    return httpClient.getUnwrapped<InvitationPreviewResponse>(
      `${INVITATIONS_URL}/preview?token=${encodeURIComponent(token)}`,
      { _skipErrorNotification: true },
    );
  },
  acceptInvitationByToken(
    data: AcceptInvitationByTokenRequest,
  ): Promise<LoginResponse> {
    return httpClient.postUnwrapped<LoginResponse>(
      `${INVITATIONS_URL}/accept-by-token`,
      data,
      { _skipErrorNotification: true },
    );
  },
  sendInvitation(data: SendInvitationRequest): Promise<void> {
    return httpClient.postUnwrapped<void>(
      `${INVITATIONS_URL}/send-invite`,
      data,
    );
  },
};
