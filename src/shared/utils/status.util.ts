/** Master-file `status` fields are stored as "ACTIVE"/"INACTIVE" in most
 * modules but "Active"/"Inactive" in a few (e.g. Other Income) — compare
 * case-insensitively so callers don't need to know which convention applies. */
export function isActiveStatus(status?: string | null): boolean {
  return (status ?? "").trim().toUpperCase() === "ACTIVE";
}
