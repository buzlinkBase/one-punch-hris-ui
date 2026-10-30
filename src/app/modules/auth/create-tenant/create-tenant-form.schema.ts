import { z } from "zod";

// Only the company name is required; everything else is optional and can be completed later
// in Company Settings.
const baseCreateTenantFormSchema = z.object({
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
  industryCode: z.string().optional(),
  subIndustryCode: z.string().optional(),
  businessType: z.string().optional(),
  companySize: z.string().optional(),
  acquisitionSource: z.string().optional(),
  acquisitionSourceOther: z.string().max(200).optional(),
  // The owner agrees to the Terms of Service for the company being created (never sent with it:
  // see toRequest; the acceptance is recorded once the company exists -- TermsAcceptanceGate).
  agreeToTerms: z.boolean(),
});

/** The Terms box is required only while the Terms of Service are live (useTermsLive). */
export function createTenantFormSchema(termsRequired: boolean) {
  return baseCreateTenantFormSchema.refine(
    (data) => !termsRequired || data.agreeToTerms,
    {
      message: "Please agree to the Terms of Service to continue.",
      path: ["agreeToTerms"],
    },
  );
}

export type CreateTenantFormValues = z.infer<typeof baseCreateTenantFormSchema>;
