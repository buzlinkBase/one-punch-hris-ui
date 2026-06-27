import { useMutation } from '@tanstack/react-query';
import { authApi } from '@/app/modules/auth/login/services/auth.api';
import type { ForgotPasswordRequest } from '../models/api/request/forgot-password-request.model';

export function useForgotPasswordMutation() {
  return useMutation({
    mutationFn: (data: ForgotPasswordRequest) => authApi.forgotPassword(data),
  });
}
