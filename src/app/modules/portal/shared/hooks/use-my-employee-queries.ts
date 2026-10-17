import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { meApi } from "../services/me.api";
import type { EmployeeFullResponse } from "@/app/modules/setup/employee/models/api/response/employee-response.model";
import type { CreateLeaveApplication } from "@/app/modules/applications/leave-application/models/api/request/create-leave-application.model";
import type { CreateOvertimeApplication } from "@/app/modules/applications/overtime-application/models/api/request/create-overtime-application.model";
import type { CreateTravelOrderApplication } from "@/app/modules/applications/travel-order-application/models/api/request/create-travel-order-application.model";
import type { PortalCreatePassSlip } from "../models/api/request/portal-create-pass-slip.model";
import type { PortalRequestChangeRestDay } from "../models/api/request/portal-request-change-rest-day.model";
import type { CreateDeductionApplication } from "@/app/modules/applications/deduction-application/models/api/request/create-deduction-application.model";
import type { UpdateDeductionApplication } from "@/app/modules/applications/deduction-application/models/api/request/update-deduction-application.model";
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

/** Opted-in coworkers whose birthday is today. */
export function useTodayBirthdays() {
  return useQuery({
    queryKey: ["me", "birthdays", "today"],
    queryFn: () => meApi.getTodayBirthdays(),
    staleTime: 10 * 60 * 1000,
  });
}

const COWORKER_STALE_MS = 10 * 60 * 1000;

export function useCoworkerSettings() {
  return useQuery({
    queryKey: ["me", "coworkers", "settings"],
    queryFn: () => meApi.getCoworkerSettings(),
    staleTime: COWORKER_STALE_MS,
  });
}

/** Each widget is fetched only once the company has switched it on (`enabled`). */
export function useNewHires(enabled: boolean) {
  return useQuery({
    queryKey: ["me", "coworkers", "new-hires"],
    queryFn: () => meApi.getNewHires(),
    enabled,
    staleTime: COWORKER_STALE_MS,
  });
}

export function useAnniversaries(enabled: boolean) {
  return useQuery({
    queryKey: ["me", "coworkers", "anniversaries"],
    queryFn: () => meApi.getAnniversaries(),
    enabled,
    staleTime: COWORKER_STALE_MS,
  });
}

export function useOutToday(enabled: boolean) {
  return useQuery({
    queryKey: ["me", "coworkers", "out-today"],
    queryFn: () => meApi.getOutToday(),
    enabled,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCoworkerDirectory(params: {
  q?: string;
  departmentId?: string;
  page: number;
  enabled: boolean;
}) {
  const { enabled, ...query } = params;
  return useQuery({
    queryKey: ["me", "coworkers", "directory", query],
    queryFn: () => meApi.getDirectory(query),
    enabled,
    staleTime: COWORKER_STALE_MS,
  });
}

export function useOrgChart(enabled: boolean) {
  return useQuery({
    queryKey: ["me", "coworkers", "org-chart"],
    queryFn: () => meApi.getOrgChart(),
    enabled,
    staleTime: COWORKER_STALE_MS,
  });
}

type SharingFlag = "shareBirthday" | "shareContact";

/** Flips the flag in the cached employee right away so the switch responds instantly, rolls
 * back if the PUT fails, and refetches either way to settle on the server's value. */
function useSharingMutation(
  flag: SharingFlag,
  request: (share: boolean) => Promise<void>,
  extraInvalidateKeys: string[][] = [],
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: request,
    onMutate: async (share: boolean) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEY });
      const previous = queryClient.getQueryData<EmployeeFullResponse | null>(
        QUERY_KEY,
      );
      if (previous) {
        queryClient.setQueryData<EmployeeFullResponse>(QUERY_KEY, {
          ...previous,
          [flag]: share,
        });
      }
      return { previous };
    },
    onError: (_error, _share, context) => {
      queryClient.setQueryData(QUERY_KEY, context?.previous);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      extraInvalidateKeys.forEach((queryKey) =>
        queryClient.invalidateQueries({ queryKey }),
      );
    },
  });
}

export function useSetContactSharing() {
  return useSharingMutation(
    "shareContact",
    (share) => meApi.setContactSharing(share),
    [["me", "coworkers"]],
  );
}

export function useSetBirthdaySharing() {
  return useSharingMutation("shareBirthday", (share) =>
    meApi.setBirthdaySharing(share),
  );
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

export function useMyRawAttendance(params: { from?: string; to?: string }) {
  return useQuery({
    queryKey: ["me", "raw-attendance", params],
    queryFn: () =>
      meApi.getMyRawAttendance({ from: params.from!, to: params.to! }),
    enabled: !!params.from && !!params.to,
  });
}

export function useMySchedule(from: string, to: string) {
  return useQuery({
    queryKey: ["me", "schedule", from, to],
    queryFn: () => meApi.getMySchedule({ from, to }),
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

export function useUpdateMyLeaveApplication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CreateLeaveApplication }) =>
      meApi.updateMyLeaveApplication(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["me", "leave-applications"] });
      queryClient.invalidateQueries({
        queryKey: ["approval-instance", "Leave", id],
      });
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

export function useUpdateMyOvertimeApplication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: CreateOvertimeApplication;
    }) => meApi.updateMyOvertimeApplication(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({
        queryKey: ["me", "overtime-applications"],
      });
      queryClient.invalidateQueries({
        queryKey: ["approval-instance", "Overtime", id],
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

export function useUpdateMyTravelOrderApplication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: CreateTravelOrderApplication;
    }) => meApi.updateMyTravelOrderApplication(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({
        queryKey: ["me", "travel-order-applications"],
      });
      queryClient.invalidateQueries({
        queryKey: ["approval-instance", "OfficialBusiness", id],
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

export function useUpdateMyPassSlipApplication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: PortalCreatePassSlip }) =>
      meApi.updateMyPassSlipApplication(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({
        queryKey: ["me", "pass-slip-applications"],
      });
      queryClient.invalidateQueries({
        queryKey: ["approval-instance", "PassSlip", id],
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

export function useUpdateMyLoanApplication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateDeductionApplication) =>
      meApi.updateMyLoanApplication(data),
    onSuccess: (_, data) => {
      queryClient.invalidateQueries({ queryKey: ["me", "loan-applications"] });
      queryClient.invalidateQueries({
        queryKey: ["approval-instance", "Loan", data.id],
      });
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
