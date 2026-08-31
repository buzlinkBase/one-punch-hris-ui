import { z } from "zod";

export const companyInfoFormSchema = z.object({
  description: z.string().min(1, "Company name is required"),
  shortName: z.string().optional(),
  address: z.string().optional(),
  contact: z.string().optional(),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  tin: z.string().optional(),
  rdoCode: z.string().optional(),
  sssNumber: z.string().optional(),
  philHealthNumber: z.string().optional(),
  pagIbigNumber: z.string().optional(),
  authorizedSignatoryName: z.string().optional(),
  authorizedSignatoryTitle: z.string().optional(),
});

export type CompanyInfoFormValues = z.infer<typeof companyInfoFormSchema>;
