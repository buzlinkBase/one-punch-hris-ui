import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { announcementApi } from "../services/announcement.api";
import type {
  AnnouncementListQuery,
  AnnouncementUpsertRequest,
  AudiencePreviewRequest,
  RecipientListQuery,
  RemindTarget,
} from "../models/api/request/announcement-request.model";

const QUERY_KEY = ["announcements"];

export function useAnnouncements(query: AnnouncementListQuery) {
  return useQuery({
    queryKey: [...QUERY_KEY, "list", query],
    queryFn: () => announcementApi.list(query),
    placeholderData: keepPreviousData,
  });
}

export function useAnnouncement(id: string | undefined) {
  return useQuery({
    queryKey: [...QUERY_KEY, "detail", id],
    queryFn: () => announcementApi.getById(id!),
    enabled: !!id,
  });
}

export function useAnnouncementStats(id: string | undefined) {
  return useQuery({
    queryKey: [...QUERY_KEY, "stats", id],
    queryFn: () => announcementApi.stats(id!),
    enabled: !!id,
    staleTime: 30 * 1000,
  });
}

export function useAnnouncementRecipients(
  id: string | undefined,
  query: RecipientListQuery,
) {
  return useQuery({
    queryKey: [...QUERY_KEY, "recipients", id, query],
    queryFn: () => announcementApi.recipients(id!, query),
    enabled: !!id,
    placeholderData: keepPreviousData,
    staleTime: 30 * 1000,
  });
}

// Every recipient on one page (limit 0), fetched on demand for the Excel export.
export function useFetchAllAnnouncementRecipients() {
  const queryClient = useQueryClient();
  return (id: string) => {
    const query: RecipientListQuery = { status: "All", page: 1, limit: 0 };
    return queryClient.fetchQuery({
      queryKey: [...QUERY_KEY, "recipients", id, query],
      queryFn: () => announcementApi.recipients(id, query),
      staleTime: 30 * 1000,
    });
  };
}

export function useAudiencePreview(request: AudiencePreviewRequest) {
  return useQuery({
    queryKey: [...QUERY_KEY, "audience-preview", request],
    queryFn: () => announcementApi.previewAudience(request),
    enabled: request.audienceRules.some((r) => !r.isExclusion),
    placeholderData: keepPreviousData,
  });
}

function useAnnouncementMutation<TVariables, TResult>(
  mutationFn: (variables: TVariables) => Promise<TResult>,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}

export const useCreateAnnouncementDraft = () =>
  useAnnouncementMutation((request: AnnouncementUpsertRequest) =>
    announcementApi.createDraft(request),
  );

export const useUpdateAnnouncement = () =>
  useAnnouncementMutation(
    ({ id, request }: { id: string; request: AnnouncementUpsertRequest }) =>
      announcementApi.update(id, request),
  );

export const useDuplicateAnnouncement = () =>
  useAnnouncementMutation((id: string) => announcementApi.duplicate(id));

export const usePublishAnnouncement = () =>
  useAnnouncementMutation((id: string) => announcementApi.publishNow(id));

export const useScheduleAnnouncement = () =>
  useAnnouncementMutation(
    ({ id, publishAtUtc }: { id: string; publishAtUtc: string }) =>
      announcementApi.schedule(id, publishAtUtc),
  );

export const useUnscheduleAnnouncement = () =>
  useAnnouncementMutation((id: string) => announcementApi.unschedule(id));

export const useUnpublishAnnouncement = () =>
  useAnnouncementMutation(
    ({ id, reason }: { id: string; reason: string | null }) =>
      announcementApi.unpublish(id, reason),
  );

export const useRepublishAnnouncement = () =>
  useAnnouncementMutation((id: string) => announcementApi.republish(id));

export const useRemindAnnouncement = () =>
  useAnnouncementMutation(
    ({ id, target }: { id: string; target: RemindTarget }) =>
      announcementApi.remind(id, target),
  );

export const usePinAnnouncement = () =>
  useAnnouncementMutation(
    ({ id, pinnedUntilUtc }: { id: string; pinnedUntilUtc: string | null }) =>
      announcementApi.pin(id, pinnedUntilUtc),
  );

export const useUnpinAnnouncement = () =>
  useAnnouncementMutation((id: string) => announcementApi.unpin(id));

export const useArchiveAnnouncement = () =>
  useAnnouncementMutation((id: string) => announcementApi.archive(id));

export const useRestoreAnnouncement = () =>
  useAnnouncementMutation((id: string) => announcementApi.restore(id));

export const useDeleteAnnouncement = () =>
  useAnnouncementMutation((id: string) => announcementApi.remove(id));

export const useRestoreDeletedAnnouncement = () =>
  useAnnouncementMutation((id: string) => announcementApi.restoreDeleted(id));
