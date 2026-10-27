import { z } from "zod";

export const cashBondRateFormSchema = z.object({
  newRate: z.number({ error: "Required" }).min(0, "Must be ≥ 0"),
  reason: z.string().trim().min(1, "Required"),
});

export type CashBondRateFormValues = z.infer<typeof cashBondRateFormSchema>;
