import { z } from "zod";

export const roleFormSchema = z.object({
  name: z.string().min(1, "Role name is required"),
  description: z.string(),
});

export type RoleFormValues = z.infer<typeof roleFormSchema>;
