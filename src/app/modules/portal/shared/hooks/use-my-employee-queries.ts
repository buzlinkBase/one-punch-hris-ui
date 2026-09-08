import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { meApi } from "../services/me.api";
import type { CreateLeaveApplication } from "@/app/modules/applications/leave-application/models/api/request/create-leave-application.model";

const QUERY_KEY = ["me", "employee"];

/** Resolves the logged-in user's own Employee record — null when not linked to one (no
 * error toast in that case, see meApi.getMyEmployee). Also drives whether "My Portal" nav
 * shows at all (see MainLayout). */
export function useMyEmployee() {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: () => meApi.getMyEmployee(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useMyPayrolls(params: { from?: string; to?: string }) {
  return useQuery({
    queryKey: ["me", "payrolls", params],
    queryFn: () => meApi.getMyPayrolls({ from: params.from!, to: params.to! }),
    enabled: !!params.from && !!params.to,
  });
}

export function useMyDtrDetail(params: { from?: string; to?: string }) {
  return useQuery({
    queryKey: ["me", "dtr-detail", params],
    queryFn: () => meApi.getMyDtrDetail({ from: params.from!, to: params.to! }),
    enabled: !!params.from && !!params.to,
  });
}

export function useMyIncompletePunches(params: { from?: string; to?: string }) {
  return useQuery({
    queryKey: ["me", "incomplete-punches", params],
    queryFn: () =>
      meApi.getMyIncompletePunches({ from: params.from!, to: params.to! }),
    enabled: !!params.from && !!params.to,
  });
}

export function useMyFixedSchedule() {
  return useQuery({
    queryKey: ["me", "fixed-schedule"],
    queryFn: () => meApi.getMyFixedSchedule(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useMyLeaveCredits(year?: number) {
  return useQuery({
    queryKey: ["me", "leave-credits", year],
    queryFn: () => meApi.getMyLeaveCredits(year),
  });
}

export function useMyLeaveApplications() {
  return useQuery({
    queryKey: ["me", "leave-applications"],
    queryFn: () => meApi.getMyLeaveApplications(),
  });
}

export function useCreateMyLeaveApplication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateLeaveApplication) =>
      meApi.createMyLeaveApplication(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["me", "leave-applications"] });
      queryClient.invalidateQueries({ queryKey: ["me", "leave-credits"] });
    },
  });
}
