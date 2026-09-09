import { useQuery } from "@tanstack/react-query";
import { permissionApi } from "../services/permission.api";

const QUERY_KEY = ["permissions"];

export function usePermissions() {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: () => permissionApi.getAll(),
  });
}
