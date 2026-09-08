import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { meApi } from "../services/me.api";
import type { CreateLeaveApplication } from "@/app/modules/applications/leave-application/models/api/request/create-leave-application.model";
import type { CreateOvertimeApplication } from "@/app/modules/applications/overtime-application/models/api/request/create-overtime-application.model";
import type { CreateTravelOrderApplication } from "@/app/modules/applications/travel-order-application/models/api/request/create-travel-order-application.model";
import type { PortalCreatePassSlip } from "../models/api/request/portal-create-pass-slip.model";
import type { PortalRequestChangeRestDay } from "../models/api/request/portal-request-change-rest-day.model";

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

export function useMyOvertimeApplications() {
  return useQuery({
    queryKey: ["me", "overtime-applications"],
    queryFn: () => meApi.getMyOvertimeApplications(),
  });
}

export function useCreateMyOvertimeApplication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateOvertimeApplication) =>
      meApi.createMyOvertimeApplication(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["me", "overtime-applications"],
      });
    },
  });
}

export function useMyTravelOrderApplications() {
  return useQuery({
    queryKey: ["me", "travel-order-applications"],
    queryFn: () => meApi.getMyTravelOrderApplications(),
  });
}

export function useCreateMyTravelOrderApplication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateTravelOrderApplication) =>
      meApi.createMyTravelOrderApplication(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["me", "travel-order-applications"],
      });
    },
  });
}

export function useMyPassSlipApplications() {
  return useQuery({
    queryKey: ["me", "pass-slip-applications"],
    queryFn: () => meApi.getMyPassSlipApplications(),
  });
}

export function useCreateMyPassSlipApplication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: PortalCreatePassSlip) =>
      meApi.createMyPassSlipApplication(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["me", "pass-slip-applications"],
      });
    },
  });
}

export function useMyChangeRestDayRequests() {
  return useQuery({
    queryKey: ["me", "change-rest-day"],
    queryFn: () => meApi.getMyChangeRestDayRequests(),
  });
}

export function useCreateMyChangeRestDayRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: PortalRequestChangeRestDay) =>
      meApi.createMyChangeRestDayRequest(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["me", "change-rest-day"] });
    },
  });
}
