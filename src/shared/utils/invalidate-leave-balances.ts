import type { QueryClient } from "@tanstack/react-query";

// Every cached view of leave credits. Posting, unposting or deleting a DTR (and approving,
// declining or deleting a leave) changes those balances server-side, so refetch all of them
// right away instead of waiting out their staleTime.
const LEAVE_BALANCE_QUERY_KEYS = [
  ["leave-balance"],
  ["payroll-reports", "leave-ledger"],
  ["me", "leave-credits"],
] as const;

export function invalidateLeaveBalances(queryClient: QueryClient) {
  LEAVE_BALANCE_QUERY_KEYS.forEach((queryKey) =>
    queryClient.invalidateQueries({ queryKey: [...queryKey] }),
  );
}
