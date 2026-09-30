/**
 * What to do with a "RolesChanged" push. The push goes to every open session of the user, but
 * only the company they're working in affects this session:
 *
 * - `refresh-and-notify`: their access changed in the active company -- re-pull the token, reload
 *   data, and tell them what changed.
 * - `refresh-silently`: a company missing from their switcher (a reactivated membership) -- the
 *   refresh's fresh company list brings it back; nothing on screen changed, so no notice.
 * - `ignore`: another company they already have. A refresh would re-mint for their default
 *   company and could pull them out of the one they're in; switching there later fetches its
 *   current roles anyway.
 *
 * A push without a company id (an older AuthApi) keeps the old always-refresh behavior.
 */
export type RolesChangedAction =
  "refresh-and-notify" | "refresh-silently" | "ignore";

const same = (a: string, b: string) => a.toLowerCase() === b.toLowerCase();

export function rolesChangedAction(
  pushTenantId: string | null | undefined,
  activeTenantId: string | null | undefined,
  knownTenantIds: string[],
): RolesChangedAction {
  if (!pushTenantId || !activeTenantId) return "refresh-and-notify";
  if (same(pushTenantId, activeTenantId)) return "refresh-and-notify";
  return knownTenantIds.some((id) => same(id, pushTenantId))
    ? "ignore"
    : "refresh-silently";
}
