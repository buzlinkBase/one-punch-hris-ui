import { z } from "zod";

export const clientPolicyFormSchema = z.object({
  otEligibility: z.string().nullable().optional(),
  otInclusionPolicy: z.string().nullable().optional(),
  maxSSSCapping: z.coerce.number().min(0).nullable().optional(),
  maxPhilHealthCapping: z.coerce.number().min(0).nullable().optional(),
  maxPagIbigCapping: z.coerce.number().min(0).nullable().optional(),
});

export type ClientPolicyFormValues = z.infer<typeof clientPolicyFormSchema>;
