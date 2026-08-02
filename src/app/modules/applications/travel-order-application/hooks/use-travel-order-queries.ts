import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { travelOrderApi } from "../services/travel-order-application.api";
import type { CreateTravelOrderApplication } from "../models/api/request/create-travel-order-application.model";
import type { UpdateTravelOrderApplication } from "../models/api/request/update-travel-order-application.model";

const QUERY_KEY = ["travel-order-applications"];

export function useTravelOrders() {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: () => travelOrderApi.getAll(),
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
