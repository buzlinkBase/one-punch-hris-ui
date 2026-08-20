import { z } from "zod";

export const otherIncomeTypeFormSchema = z.object({
  description: z.string().min(1, "Description is required"),
});

export type OtherIncomeTypeFormValues = z.infer<
  typeof otherIncomeTypeFormSchema
>;
