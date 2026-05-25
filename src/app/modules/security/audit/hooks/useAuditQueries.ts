import { useQuery } from '@tanstack/react-query';
import { auditApi } from '../services/audit.api';

const QUERY_KEY = ['audit-logs'];

export function useAuditLogs() {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: () => auditApi.getAll(),
  });
}

export function useAuditLog(id: string | undefined) {
  return useQuery({
    queryKey: [...QUERY_KEY, id],
    queryFn: () => auditApi.getById(id!),
    enabled: !!id,
  });
}
