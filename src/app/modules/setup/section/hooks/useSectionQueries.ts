import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { sectionApi } from "../services/section.api";
import type { CreateSection } from "../models/api/request/create-section.model";
import type { UpdateSection } from "../models/api/request/update-section.model";

const QUERY_KEY = ["sections"];

export function useSections() {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: () => sectionApi.getAll(),
  });
}

export function useSection(id: string | undefined) {
  return useQuery({
    queryKey: [...QUERY_KEY, id],
    queryFn: () => sectionApi.getById(id!),
    enabled: !!id,
  });
}

export function useCreateSection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateSection) => sectionApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}

export function useUpdateSection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateSection) => sectionApi.update(data),
    onSuccess: (updated) => {
      queryClient.setQueryData([...QUERY_KEY, updated.id], updated);
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}

export function useDeleteSection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => sectionApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}
