import { useMutation } from '@tanstack/react-query';
import { authApi } from '@/app/modules/auth/login/services/auth.api';
import type { RegisterRequest } from '../models/api/request/register-request.model';

export function useRegisterMutation() {
  return useMutation({
    mutationFn: (data: RegisterRequest) => authApi.register(data),
  });
}
