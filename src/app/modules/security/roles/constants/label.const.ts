export const ROLE_LABEL = {
  TITLE: "Role",
  ROLE: "Role",
  ROLE_NAME: "Role Name",
  DESCRIPTION: "Description",
  SCOPE: "Scope",
  PERMISSIONS: "Permissions",
  CREATE_TITLE: "Create Role",
  EDIT_TITLE: "Edit Role",
  VIEW_TITLE: "View Role",
  SYSTEM: "System",
};

/** The product a permission without one belongs to -- everything issued before products existed. */
export const DEFAULT_PERMISSION_PRODUCT = "hrms";

const PRODUCT_LABELS: Record<string, string> = {
  hrms: "HRMS",
  procurement: "Procurement",
  accounting: "Accounting",
  billing: "Billing",
  clientportal: "Client Portal",
};

export function productLabel(product: string): string {
  return (
    PRODUCT_LABELS[product] ??
    product.charAt(0).toUpperCase() + product.slice(1)
  );
}

/** HRMS first, then the other systems alphabetically. */
export function compareProducts(a: string, b: string): number {
  if (a === b) return 0;
  if (a === DEFAULT_PERMISSION_PRODUCT) return -1;
  if (b === DEFAULT_PERMISSION_PRODUCT) return 1;
  return a.localeCompare(b);
}
