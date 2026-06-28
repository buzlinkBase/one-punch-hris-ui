import { z } from "zod";

export const createTenantFormSchema = z.object({
  tenantName: z.string().min(1, "Organization name is required"),
});

export type CreateTenantFormValues = z.infer<typeof createTenantFormSchema>;
