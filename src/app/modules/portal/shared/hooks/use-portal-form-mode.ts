import { useRouterState } from "@tanstack/react-router";
import { useRouteParams } from "@/shared/hooks/use-route-params";

export type PortalFormMode = "create" | "edit" | "view";

/**
 * Which way a portal application page was opened -- `…/create`, `…/$id` (edit) or
 * `…/$id/view` (read-only). One page component serves all three routes (see portal.routes.tsx),
 * so the mode comes from the URL rather than a prop.
 */
export function usePortalFormMode(): { id?: string; mode: PortalFormMode } {
  const { id } = useRouteParams<{ id?: string }>();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  if (!id) return { mode: "create" };
  return { id, mode: pathname.endsWith("/view") ? "view" : "edit" };
}
