import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { workRotationApi } from "../services/work-rotation.api";
import type { CreateWorkRotation } from "../models/api/request/create-work-rotation.model";
import type { UpdateWorkRotation } from "../models/api/request/update-work-rotation.model";
import type {
  ApplyScheduleGrid,
  ScheduleGridFilter,
} from "../models/api/request/apply-schedule-grid.model";
import { supervisorSiteGrantsApi } from "../services/supervisor-site-grants.api";
import type { WorkRotationFilter } from "../models/api/request/work-rotation-filter.model";

const QUERY_KEY = ["change-schedule", "work-rotation"];

export function useWorkRotations(
  filter: WorkRotationFilter = {},
  searchKey = 0,
) {
  return useQuery({
    queryKey: [...QUERY_KEY, filter, searchKey],
    queryFn: () => workRotationApi.getAll(filter),
  });
}

export function useWorkRotation(id: string | undefined) {
  return useQuery({
    queryKey: [...QUERY_KEY, id],
    queryFn: () => workRotationApi.getById(id!),
    enabled: !!id,
  });
}

export function useCreateWorkRotation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateWorkRotation) => workRotationApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}

export function useUpdateWorkRotation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateWorkRotation) => workRotationApi.update(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}

export function useDeleteWorkRotation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => workRotationApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}

export function useDeleteWorkRotationBatch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (batchCode: string) => workRotationApi.removeByBatch(batchCode),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}

export function useScheduleGrid(filter: ScheduleGridFilter, enabled: boolean) {
  return useQuery({
    queryKey: [...QUERY_KEY, "grid", filter],
    queryFn: () => workRotationApi.queryGrid(filter),
    enabled,
  });
}

export function useApplyScheduleGrid() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ApplyScheduleGrid) => workRotationApi.applyGrid(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}

// One-off read of another date range -- "copy previous period" -- that shouldn't be cached or
// re-fetched with the grid's own query.
export function useFetchScheduleGrid() {
  return useMutation({
    mutationFn: (filter: ScheduleGridFilter) =>
      workRotationApi.queryGrid(filter),
  });
}

// The employees and project sites a team-scoped supervisor can schedule.
export function useScheduleScope(enabled: boolean) {
  return useQuery({
    queryKey: [...QUERY_KEY, "scope"],
    queryFn: () => workRotationApi.getScope(),
    enabled,
  });
}

const GRANTS_KEY = ["change-schedule", "supervisor-site-grants"];

export function useSupervisorSiteGrants(employeeId: string | undefined) {
  return useQuery({
    queryKey: [...GRANTS_KEY, employeeId],
    queryFn: () => supervisorSiteGrantsApi.getAreaIds(employeeId!),
    enabled: !!employeeId,
  });
}

export function useSetSupervisorSiteGrants() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { employeeId: string; areaIds: string[] }) =>
      supervisorSiteGrantsApi.setAreaIds(data.employeeId, data.areaIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: GRANTS_KEY });
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}
