import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { deviceApi } from "../services/device.api";
import type { CreateBiometricDevice } from "../models/api/request/create-device.model";
import type { UpdateBiometricDevice } from "../models/api/request/update-device.model";

const QUERY_KEY = ["biometric-devices"];

export function useDevices() {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: () => deviceApi.getAll(),
  });
}

export function useDevice(id: string | undefined) {
  return useQuery({
    queryKey: [...QUERY_KEY, id],
    queryFn: () => deviceApi.getById(id!),
    enabled: !!id,
  });
}

export function useCreateDevice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateBiometricDevice) => deviceApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}

export function useUpdateDevice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateBiometricDevice) => deviceApi.update(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}

export function useDeleteDevice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deviceApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}
