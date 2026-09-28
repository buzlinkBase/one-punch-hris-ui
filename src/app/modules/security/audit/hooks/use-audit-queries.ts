import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { auditApi } from "../services/audit.api";
import type { AuditLogParams } from "../models/api/response/audit-response.model";

const QUERY_KEY = ["audit-logs"];

/**
 * One page of the company's trail; filters and paging are applied by the server.
 * `refetchIntervalMs` polls for new entries while set (false = off).
 */
export function useAuditLogs(
  params: AuditLogParams,
  refetchIntervalMs: number | false = false,
) {
  return useQuery({
    queryKey: [...QUERY_KEY, "page", params],
    queryFn: () => auditApi.getPage(params),
    // Keep the current page on screen while the next one loads.
    placeholderData: keepPreviousData,
    refetchInterval: refetchIntervalMs,
    // Don't poll a tab nobody is looking at.
    refetchIntervalInBackground: false,
  });
}

export function useAuditLog(id: string | undefined) {
  return useQuery({
    queryKey: [...QUERY_KEY, "detail", id],
    queryFn: () => auditApi.getById(id!),
    enabled: !!id,
  });
}

export function useAuditModules() {
  return useQuery({
    queryKey: [...QUERY_KEY, "modules"],
    queryFn: () => auditApi.getModules(),
    staleTime: Infinity,
  });
}
