import { z } from "zod";

export const roleFormSchema = z.object({
  roleName: z.string().min(1, "Role name is required"),
  status: z.string().min(1, "Status is required"),
});

export type RoleFormValues = z.infer<typeof roleFormSchema>;
