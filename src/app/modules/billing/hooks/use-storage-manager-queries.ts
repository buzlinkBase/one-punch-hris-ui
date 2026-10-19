import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authStorage } from "@/core/auth/auth-storage";
import { useAuthUser } from "@/core/auth/use-auth-user";
import { storageManagerApi } from "../services/storage-manager.api";
import type { StorageDeleteRequest } from "../models/api/request/storage-manager-request.model";
import { SUBSCRIPTION_QUERY_KEY } from "./use-subscription-queries";

export const STORAGE_MANAGER_QUERY_KEY = ["storage-manager"] as const;

/** The current company's files by category and year. Re-keyed when the session switches company. */
export function useStorageBreakdown(enabled = true) {
  useAuthUser();
  const tenantId = authStorage.getTenantId();
  return useQuery({
    queryKey: [...STORAGE_MANAGER_QUERY_KEY, "breakdown", tenantId],
    queryFn: () => storageManagerApi.getBreakdown(),
    enabled: enabled && !!tenantId,
  });
}

export interface StorageGroup {
  category: string;
  label: string;
  year: number;
}

/** One page of a category's files for a year, oldest first. */
export function useStoredFiles(
  group: StorageGroup | null,
  page: number,
  pageSize: number,
) {
  const tenantId = authStorage.getTenantId();
  return useQuery({
    queryKey: [
      ...STORAGE_MANAGER_QUERY_KEY,
      "files",
      tenantId,
      group?.category,
      group?.year,
      page,
      pageSize,
    ],
    queryFn: () =>
      storageManagerApi.getFiles(
        group?.category ?? "",
        group?.year ?? 0,
        page,
        pageSize,
      ),
    enabled: !!group && !!tenantId,
  });
}

/** What a delete would remove -- shown before the user confirms. Always asked fresh. */
export function useStorageDeletePreview(request: StorageDeleteRequest | null) {
  const tenantId = authStorage.getTenantId();
  return useQuery({
    queryKey: [...STORAGE_MANAGER_QUERY_KEY, "preview", tenantId, request],
    queryFn: () => storageManagerApi.previewDelete(request ?? {}),
    enabled: !!request && !!tenantId,
    staleTime: 0,
    gcTime: 0,
  });
}

/** Deletes the files, then refreshes the breakdown and every storage gauge. */
export function useDeleteStoredFiles() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: StorageDeleteRequest) =>
      storageManagerApi.deleteFiles(payload),
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: STORAGE_MANAGER_QUERY_KEY }),
        queryClient.invalidateQueries({ queryKey: SUBSCRIPTION_QUERY_KEY }),
      ]),
  });
}
