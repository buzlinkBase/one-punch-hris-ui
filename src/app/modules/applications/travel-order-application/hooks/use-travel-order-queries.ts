import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { travelOrderApi } from "../services/travel-order-application.api";
import type { CreateTravelOrderApplication } from "../models/api/request/create-travel-order-application.model";
import type { UpdateTravelOrderApplication } from "../models/api/request/update-travel-order-application.model";
import type { TravelOrderApplicationResponse } from "../models/api/response/travel-order-application-response.model";

const QUERY_KEY = ["travel-order-applications"];

export function useTravelOrders(params?: { from?: string; to?: string }) {
  return useQuery({
    queryKey: [...QUERY_KEY, params],
    queryFn: () => travelOrderApi.getAll(params),
  });
}

export function useTravelOrder(id: string | undefined) {
  return useQuery({
    queryKey: [...QUERY_KEY, id],
    queryFn: () => travelOrderApi.getById(id!),
    enabled: !!id,
  });
}

export function useCreateTravelOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateTravelOrderApplication) =>
      travelOrderApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}

export function useUpdateTravelOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateTravelOrderApplication) =>
      travelOrderApi.update(data),
    onSuccess: (updated) => {
      queryClient.setQueryData([...QUERY_KEY, updated.id], updated);
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}

export function useDeleteTravelOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => travelOrderApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}

export function useCreateTravelOrderBatch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateTravelOrderApplication[]) =>
      travelOrderApi.createBatch(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}

export function useChangeTravelOrderStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      record,
      status,
      note,
    }: {
      record: TravelOrderApplicationResponse;
      status: string;
      note?: string;
    }) => travelOrderApi.changeStatus(record, status, note),
    onSuccess: (updated) => {
      queryClient.setQueryData([...QUERY_KEY, updated.id], updated);
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      queryClient.invalidateQueries({
        queryKey: ["approval-instance", "OfficialBusiness", updated.id],
      });
    },
  });
}
