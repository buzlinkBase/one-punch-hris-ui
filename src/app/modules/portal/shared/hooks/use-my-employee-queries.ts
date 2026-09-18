import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { meApi } from "../services/me.api";
import type { CreateLeaveApplication } from "@/app/modules/applications/leave-application/models/api/request/create-leave-application.model";
import type { CreateOvertimeApplication } from "@/app/modules/applications/overtime-application/models/api/request/create-overtime-application.model";
import type { CreateTravelOrderApplication } from "@/app/modules/applications/travel-order-application/models/api/request/create-travel-order-application.model";
import type { PortalCreatePassSlip } from "../models/api/request/portal-create-pass-slip.model";
import type { PortalRequestChangeRestDay } from "../models/api/request/portal-request-change-rest-day.model";
import type { CreateDeductionApplication } from "@/app/modules/applications/deduction-application/models/api/request/create-deduction-application.model";
import type { PortalCreateProfileUpdateRequest } from "../models/api/request/portal-create-profile-update-request.model";

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

// Setup > Payslip/13th Month/Last Pay > Received by Employee — covers all three document
// types uniformly (they're all just Payroll rows), so invalidate every screen that could be
// showing this same row: the Pay Slips list and the 13th Month Pay card.
export function useAcknowledgeMyPayroll() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => meApi.acknowledgeMyPayroll(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["me", "payrolls"] });
      queryClient.invalidateQueries({ queryKey: ["me", "13th-month"] });
    },
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

export function useWithdrawMyLeaveApplication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => meApi.withdrawMyLeaveApplication(id),
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

export function useWithdrawMyOvertimeApplication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => meApi.withdrawMyOvertimeApplication(id),
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

export function useWithdrawMyTravelOrderApplication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => meApi.withdrawMyTravelOrderApplication(id),
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

export function useWithdrawMyPassSlipApplication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => meApi.withdrawMyPassSlipApplication(id),
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

export function useWithdrawMyChangeRestDayRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (batchCode: string) =>
      meApi.withdrawMyChangeRestDayRequest(batchCode),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["me", "change-rest-day"] });
    },
  });
}

export function useMyLoanApplications() {
  return useQuery({
    queryKey: ["me", "loan-applications"],
    queryFn: () => meApi.getMyLoanApplications(),
  });
}

export function useCreateMyLoanApplication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateDeductionApplication) =>
      meApi.createMyLoanApplication(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["me", "loan-applications"] });
    },
  });
}

export function useWithdrawMyLoanApplication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => meApi.withdrawMyLoanApplication(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["me", "loan-applications"] });
    },
  });
}

export function useMyProfileUpdateRequests() {
  return useQuery({
    queryKey: ["me", "profile-update-requests"],
    queryFn: () => meApi.getMyProfileUpdateRequests(),
  });
}

export function useCreateMyProfileUpdateRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: PortalCreateProfileUpdateRequest) =>
      meApi.createMyProfileUpdateRequest(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["me", "profile-update-requests"],
      });
    },
  });
}

export function useWithdrawMyProfileUpdateRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => meApi.withdrawMyProfileUpdateRequest(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["me", "profile-update-requests"],
      });
    },
  });
}

export function useMyCashBond() {
  return useQuery({
    queryKey: ["me", "cash-bond"],
    queryFn: () => meApi.getMyCashBond(),
  });
}

export function useMy13thMonth(year: number) {
  return useQuery({
    queryKey: ["me", "13th-month", year],
    queryFn: () => meApi.getMy13thMonth(year),
  });
}
