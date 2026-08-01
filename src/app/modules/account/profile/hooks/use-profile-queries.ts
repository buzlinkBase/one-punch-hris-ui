import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { profileApi } from "../services/profile.api";
import type { UpdateProfileRequest } from "../models/api/request/update-profile-request.model";
import type { ChangePasswordRequest } from "../models/api/request/change-password-request.model";
import type { SetPasswordRequest } from "../models/api/request/set-password-request.model";

const PROFILE_QUERY_KEY = ["profile"] as const;

export function useProfileQuery() {
  return useQuery({
    queryKey: PROFILE_QUERY_KEY,
    queryFn: profileApi.getProfile,
  });
}

export function useUpdateProfileMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateProfileRequest) => profileApi.updateProfile(data),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: PROFILE_QUERY_KEY }),
  });
}

export function useChangePasswordMutation() {
  return useMutation({
    mutationFn: (data: ChangePasswordRequest) =>
      profileApi.changePassword(data),
  });
}

export function useSetPasswordMutation() {
  return useMutation({
    mutationFn: (data: SetPasswordRequest) => profileApi.setPassword(data),
  });
}
