import { z } from "zod";

// Only the company name is required; everything else is optional and can be completed later
// in Company Settings.
export const createTenantFormSchema = z.object({
  tenantName: z.string().trim().min(1, "Company name is required"),
  address: z.string().optional(),
  contact: z.string().optional(),
  email: z.union([z.literal(""), z.email("Enter a valid email")]).optional(),
  tin: z.string().optional(),
  rdoCode: z.string().optional(),
  sssNumber: z.string().optional(),
  philHealthNumber: z.string().optional(),
  pagIbigNumber: z.string().optional(),
  authorizedSignatoryName: z.string().optional(),
  authorizedSignatoryTitle: z.string().optional(),
});

export type CreateTenantFormValues = z.infer<typeof createTenantFormSchema>;
