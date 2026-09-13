import { z } from "zod";

export const clientPolicyFormSchema = z.object({
  otEligibility: z.string().nullable().optional(),
  otInclusionPolicy: z.string().nullable().optional(),
  maxSSSCapping: z.number().min(0).nullable().optional(),
  maxPhilHealthCapping: z.number().min(0).nullable().optional(),
  maxPagIbigCapping: z.number().min(0).nullable().optional(),
});

export type ClientPolicyFormValues = z.infer<typeof clientPolicyFormSchema>;
