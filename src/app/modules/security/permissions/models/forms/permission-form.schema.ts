import { z } from "zod";

const PERMISSION_ACTIONS = [
  "CREATE",
  "READ",
  "UPDATE",
  "DELETE",
  "EXPORT",
  "APPROVE",
  "REJECT",
] as const;

export const permissionFormSchema = z.object({
  code: z.string().min(1, "Code is required"),
  name: z.string().min(1, "Permission name is required"),
  module: z.string().min(1, "Module is required"),
  action: z.enum(PERMISSION_ACTIONS, {
    error: () => ({ message: "Action is required" }),
  }),
  description: z.string().min(1, "Description is required"),
  status: z.string().min(1, "Status is required"),
});

export type PermissionFormValues = z.infer<typeof permissionFormSchema>;
