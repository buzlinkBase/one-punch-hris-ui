import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { profileUpdateRequestApi } from "../services/profile-update-request.api";

const QUERY_KEY = ["profile-update-requests"];

export function useProfileUpdateRequests(employeeId?: string) {
  return useQuery({
    queryKey: [...QUERY_KEY, employeeId],
    queryFn: () => profileUpdateRequestApi.getAll(employeeId),
  });
}

export function useProfileUpdateRequest(id: string | undefined) {
  return useQuery({
    queryKey: [...QUERY_KEY, id],
    queryFn: () => profileUpdateRequestApi.getById(id!),
    enabled: !!id,
  });
}

export function useApproveProfileUpdateRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      note,
      forceApply,
    }: {
      id: string;
      note?: string;
      forceApply?: boolean;
    }) => profileUpdateRequestApi.approve(id, note, forceApply),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      queryClient.invalidateQueries({
        queryKey: ["approval-instance", "ProfileUpdate", id],
      });
      queryClient.invalidateQueries({ queryKey: ["me", "employee"] });
    },
  });
}

export function useDeclineProfileUpdateRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, note }: { id: string; note?: string }) =>
      profileUpdateRequestApi.decline(id, note),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      queryClient.invalidateQueries({
        queryKey: ["approval-instance", "ProfileUpdate", id],
      });
    },
  });
}
