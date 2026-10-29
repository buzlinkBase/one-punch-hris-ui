import { useRouterState } from "@tanstack/react-router";
import { useRouteParams } from "@/shared/hooks/use-route-params";
import { useCompanyClosed } from "@/app/modules/billing/hooks/use-company-closed";

export type PortalFormMode = "create" | "edit" | "view";

/**
 * Which way a portal application page was opened -- `…/create`, `…/$id` (edit) or
 * `…/$id/view` (read-only). One page component serves all three routes (see portal.routes.tsx),
 * so the mode comes from the URL rather than a prop. While the company is closed (read-only,
 * suspended, on hold) nothing can be filed or changed: an existing application opens as a view
 * and `closed` tells a create page to lock its form.
 */
export function usePortalFormMode(): {
  id?: string;
  mode: PortalFormMode;
  closed: boolean;
} {
  const { id } = useRouteParams<{ id?: string }>();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const closed = useCompanyClosed();

  if (!id) return { mode: "create", closed };
  return {
    id,
    mode: closed || pathname.endsWith("/view") ? "view" : "edit",
    closed,
  };
}
