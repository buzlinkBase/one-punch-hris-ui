export const PERMISSION_LABEL = {
  TITLE: "Permissions",
  MODULE: "Module",
  FEATURE: "Feature",
  ACTION: "Action",
  CODE: "Code",
  DESCRIPTION: "Description",
};

// Standard, reusable verb set (Rbac.md §5.2) — every Permission's action comes from this fixed
// list, never free text.
export const PERMISSION_ACTION_OPTIONS = [
  { value: "View", label: "View" },
  { value: "Create", label: "Create" },
  { value: "Edit", label: "Edit" },
  { value: "Delete", label: "Delete" },
  { value: "Approve", label: "Approve" },
  { value: "Export", label: "Export" },
  { value: "Import", label: "Import" },
  { value: "Manage", label: "Manage" },
] as const;

export const PERMISSION_ACTION_COLORS: Record<string, string> = {
  View: "blue",
  Create: "green",
  Edit: "orange",
  Delete: "red",
  Approve: "success",
  Export: "purple",
  Import: "cyan",
  Manage: "gold",
};
