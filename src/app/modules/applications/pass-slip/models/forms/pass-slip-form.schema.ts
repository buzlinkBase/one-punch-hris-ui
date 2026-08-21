import { z } from "zod";

export const passSlipEntrySchema = z.object({
  punchTime: z.string().min(1, "Time is required"),
  notes: z.string().optional(),
});

export const passSlipCreateFormSchema = z.object({
  employeeId: z.string().min(1, "Employee is required"),
  applicationDate: z.string().min(1, "Application date is required"),
  remarks: z.string().optional(),
  entries: z.array(passSlipEntrySchema).min(1, "Add at least one entry"),
});

export const passSlipFormSchema = z.object({
  employeeId: z.string().min(1, "Employee is required"),
  applicationDate: z.string().min(1, "Application date is required"),
  departureTime: z.string().min(1, "Punch time is required"),
  notes: z.string().optional(),
  remarks: z.string().optional(),
});

export type PassSlipEntryValues = z.infer<typeof passSlipEntrySchema>;
export type PassSlipCreateFormValues = z.infer<typeof passSlipCreateFormSchema>;
export type PassSlipFormValues = z.infer<typeof passSlipFormSchema>;
