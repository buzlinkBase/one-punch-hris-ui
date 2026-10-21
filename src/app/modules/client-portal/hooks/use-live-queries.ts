import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { liveApi } from "../services/live.api";

const KEY = ["client-portal", "live"] as const;

/** Refreshed every minute: shifts move from "not yet in" to "absent" with time even when nobody punches. */
const REFRESH_MS = 60_000;

export const useAgencyLive = () =>
  useQuery({
    queryKey: [...KEY, "agency"],
    queryFn: () => liveApi.agency(),
    refetchInterval: REFRESH_MS,
    refetchIntervalInBackground: false,
  });

export const useClientLive = (clientId: string | undefined) =>
  useQuery({
    queryKey: [...KEY, "today", clientId],
    queryFn: () => liveApi.today(clientId!),
    enabled: !!clientId,
    refetchInterval: REFRESH_MS,
    refetchIntervalInBackground: false,
  });

export const useCoverageAlertSettings = () =>
  useQuery({
    queryKey: [...KEY, "alert-settings"],
    queryFn: () => liveApi.alertSettings(),
  });

export const useSaveCoverageAlertSettings = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (emails: string) => liveApi.saveAlertSettings(emails),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: [...KEY, "alert-settings"] }),
  });
};
