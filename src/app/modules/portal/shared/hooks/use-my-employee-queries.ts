import { useQuery } from "@tanstack/react-query";
import { meApi } from "../services/me.api";

const QUERY_KEY = ["me", "employee"];

/** Resolves the logged-in user's own Employee record — null when not linked to one (no
 * error toast in that case, see meApi.getMyEmployee). Also drives whether "My Portal" nav
 * shows at all (see MainLayout). */
export function useMyEmployee() {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: () => meApi.getMyEmployee(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useMyPayrolls(params: { from?: string; to?: string }) {
  return useQuery({
    queryKey: ["me", "payrolls", params],
    queryFn: () => meApi.getMyPayrolls({ from: params.from!, to: params.to! }),
    enabled: !!params.from && !!params.to,
  });
}
