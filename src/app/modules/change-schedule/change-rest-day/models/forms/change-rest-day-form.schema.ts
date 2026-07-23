import { z } from "zod";

export const changeRestDayFormSchema = z.object({
  employeeId: z.string().min(1, "Employee is required"),
  fromDate: z.string().min(1, "Prior day-off from date is required"),
  toDate: z.string().min(1, "Prior day-off to date is required"),
  newDate: z.string().min(1, "New day-off date is required"),
});

export type ChangeRestDayFormValues = z.infer<typeof changeRestDayFormSchema>;
