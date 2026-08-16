import { z } from "zod";

export const clientPolicyFormSchema = z.object({
  otEligibility: z.string().nullable().optional(),
  otInclusionPolicy: z.string().nullable().optional(),
});

export type ClientPolicyFormValues = z.infer<typeof clientPolicyFormSchema>;
