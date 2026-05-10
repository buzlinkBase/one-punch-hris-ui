import { z } from "zod";

export const changeRestDayFormSchema = z.object({
  fromDate: z.string().min(1, "From date is required"),
  toDate: z.string().min(1, "To date is required"),
});

export type ChangeRestDayFormValues = z.infer<typeof changeRestDayFormSchema>;
