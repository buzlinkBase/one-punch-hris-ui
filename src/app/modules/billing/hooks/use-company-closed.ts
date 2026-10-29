import { isCompanyClosed } from "../utils/company-lock";
import { useEntitlements } from "./use-subscription-queries";

/**
 * True while the current company takes no changes (read-only, suspended or on legal hold) --
 * write actions hide and forms open as View. Follows the entitlements query, so paying (or an
 * operator lifting a block) brings everything back without a reload.
 */
export function useCompanyClosed(): boolean {
  const { data } = useEntitlements();
  return isCompanyClosed(data?.entitlements);
}
