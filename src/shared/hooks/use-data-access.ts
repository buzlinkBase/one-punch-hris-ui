import { useQuery } from "@tanstack/react-query";
import { authStorage } from "@/core/auth/auth-storage";
import { useAuthUser } from "@/core/auth/use-auth-user";
import { dataAccessApi } from "../services/data-access.api";

// Keyed by company and clearance: either one changes which employees are hidden.
export function useDataAccess() {
  const user = useAuthUser();
  const cleared = authStorage.hasConfidentialClearance();
  return useQuery({
    queryKey: ["data-access", user?.tenantId, cleared],
    queryFn: () => dataAccessApi.get(),
    enabled: !!user?.tenantId,
  });
}
