import { useRouterState } from "@tanstack/react-router";

/** True when the current route is a "duplicate this record" form (`.../duplicate/$id`). */
export function useIsDuplicateRoute(): boolean {
  return useRouterState({
    select: (state) => state.location.pathname.includes("/duplicate/"),
  });
}
