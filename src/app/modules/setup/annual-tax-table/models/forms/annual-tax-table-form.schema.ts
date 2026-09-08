import { z } from "zod";

const num = z.number({ error: "Must be a number" }).min(0, "Must be ≥ 0");

export const annualTaxTableFormSchema = z.object({
  rangeFrom: num,
  rangeTo: num,
  baseTaxDue: num,
  addOnPercentage: num,
});

export type AnnualTaxTableFormValues = z.infer<typeof annualTaxTableFormSchema>;
