import { z } from "zod";

export const deductionTypeFormSchema = z.object({
  code: z.string().min(1, "Code is required"),
  name: z.string().min(1, "Type name is required"),
  status: z.string().min(1, "Status is required"),
});

export type DeductionTypeFormValues = z.infer<typeof deductionTypeFormSchema>;
