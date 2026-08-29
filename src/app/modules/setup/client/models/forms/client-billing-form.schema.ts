import { z } from "zod";

export const clientBillingFormSchema = z.object({
  tin: z.string(),
  billingAddress: z.string(),
  billingContactName: z.string(),
  billingEmail: z.string().email("Invalid email").or(z.literal("")),
  billingPhone: z.string(),
  paymentTermsDays: z.number().min(0, "Must be 0 or greater"),
  billingCycle: z.string().min(1, "Required"),
  currency: z.string().min(1, "Required"),
  notes: z.string().nullable(),
});

export type ClientBillingFormValues = z.infer<typeof clientBillingFormSchema>;
