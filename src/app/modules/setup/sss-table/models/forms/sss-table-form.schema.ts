import { z } from "zod";

export const sssTableFormSchema = z.object({
  rangeFrom: z.number({ error: "Must be a number" }).min(0, "Must be ≥ 0"),
  rangeTo: z.number({ error: "Must be a number" }).min(0, "Must be ≥ 0"),
  msc: z.number({ error: "Must be a number" }).min(0, "Must be ≥ 0"),
  ee: z.number({ error: "Must be a number" }).min(0, "Must be ≥ 0"),
  er: z.number({ error: "Must be a number" }).min(0, "Must be ≥ 0"),
  ec: z.number({ error: "Must be a number" }).min(0, "Must be ≥ 0"),
});

export type SssTableFormValues = z.infer<typeof sssTableFormSchema>;
