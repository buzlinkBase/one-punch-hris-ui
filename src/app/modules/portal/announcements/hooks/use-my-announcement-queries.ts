import {
  useMutation,
  useQuery,
  useQueryClient,
  type QueryClient,
} from "@tanstack/react-query";
import { myAnnouncementApi } from "../services/my-announcement.api";
import type {
  MyAnnouncementDetail,
  MyAnnouncementFilter,
} from "../models/api/response/my-announcement-response.model";

export const MY_ANNOUNCEMENTS_QUERY_KEY = ["me", "announcements"];

export const myAnnouncementDetailKey = (id: string) => [
  ...MY_ANNOUNCEMENTS_QUERY_KEY,
  "detail",
  id,
];

// Live pushes do the real work; this only catches anything missed while disconnected.
const BACKGROUND_REFRESH_MS = 5 * 60 * 1000;

/**
 * Refreshes the feed, unread count and pending acknowledgements -- but not an open
 * announcement, since fetching one records another view.
 */
export function refreshMyAnnouncementSummaries(queryClient: QueryClient) {
  for (const part of ["list", "unread-count", "pending-acknowledgement"]) {
    queryClient.invalidateQueries({
      queryKey: [...MY_ANNOUNCEMENTS_QUERY_KEY, part],
    });
  }
}

export function useMyAnnouncements(
  filter: MyAnnouncementFilter,
  page: number,
  limit = 20,
) {
  return useQuery({
    queryKey: [...MY_ANNOUNCEMENTS_QUERY_KEY, "list", filter, page, limit],
    queryFn: () => myAnnouncementApi.getMine({ filter, page, limit }),
  });
}

export function useMyUnreadAnnouncementCount() {
  return useQuery({
    queryKey: [...MY_ANNOUNCEMENTS_QUERY_KEY, "unread-count"],
    queryFn: () => myAnnouncementApi.getUnreadCount(),
    refetchInterval: BACKGROUND_REFRESH_MS,
  });
}

export function useMyLatestAnnouncements(limit = 5) {
  return useMyAnnouncements("All", 1, limit);
}

export function useMyPendingAcknowledgements() {
  return useQuery({
    queryKey: [...MY_ANNOUNCEMENTS_QUERY_KEY, "pending-acknowledgement"],
    queryFn: () => myAnnouncementApi.getPendingAcknowledgement(),
    refetchInterval: BACKGROUND_REFRESH_MS,
  });
}

/** Opening records a view, so the unread count and feed refresh once it has loaded. */
export function useOpenMyAnnouncement(id: string | undefined) {
  const queryClient = useQueryClient();
  return useQuery({
    queryKey: myAnnouncementDetailKey(id ?? ""),
    queryFn: async () => {
      const detail = await myAnnouncementApi.open(id!);
      refreshMyAnnouncementSummaries(queryClient);
      return detail;
    },
    enabled: !!id,
    refetchOnWindowFocus: false,
  });
}

export function useAcknowledgeAnnouncement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => myAnnouncementApi.acknowledge(id),
    onSuccess: (_, id) => {
      queryClient.setQueryData<MyAnnouncementDetail>(
        myAnnouncementDetailKey(id),
        (current) =>
          current && {
            ...current,
            acknowledgedAt: new Date().toISOString(),
            needsAcknowledgement: false,
            needsReacknowledgement: false,
            isOverdue: false,
          },
      );
      refreshMyAnnouncementSummaries(queryClient);
    },
  });
}
