import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { notificationPreferenceApi } from "../services/notification-preference.api";
import type { ApprovalApplicationType } from "@/shared/types/approval.model";

const NOTIFICATION_PREFERENCES_QUERY_KEY = [
  "notification-preferences",
  "mine",
] as const;

export function useNotificationPreferencesQuery() {
  return useQuery({
    queryKey: NOTIFICATION_PREFERENCES_QUERY_KEY,
    queryFn: notificationPreferenceApi.getMine,
  });
}

export function useUpdateNotificationPreferenceMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      applicationType,
      emailEnabled,
      pushEnabled,
    }: {
      applicationType: ApprovalApplicationType;
      emailEnabled: boolean;
      pushEnabled: boolean;
    }) =>
      notificationPreferenceApi.updateMine(applicationType, {
        emailEnabled,
        pushEnabled,
      }),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: NOTIFICATION_PREFERENCES_QUERY_KEY,
      }),
  });
}
