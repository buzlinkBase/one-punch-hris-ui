import { useMutation } from "@tanstack/react-query";
import { authApi } from "@/app/modules/auth/login/services/auth.api";
import type { ResetPasswordRequest } from "../models/api/request/reset-password-request.model";

export function useResetPasswordMutation() {
  return useMutation({
    mutationFn: (data: ResetPasswordRequest) => authApi.resetPassword(data),
  });
}
