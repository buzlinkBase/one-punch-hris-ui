import { z } from 'zod';

const cutoffModelSchema = z.object({
  day: z.coerce.number().min(1, 'Min 1').max(31, 'Max 31'),
  isEndOfMonth: z.boolean().default(false),
  label: z.string().default(''),
});

export const payrollGroupFormSchema = z.object({
  code: z.string().min(1, 'Code is required'),
  name: z.string().min(1, 'Name is required'),
  payrollFrequency: z.string().min(1, 'Payroll frequency is required'),
  cutoffDays: z.array(cutoffModelSchema).optional(),
  status: z.string().min(1, 'Status is required'),
});

export type PayrollGroupFormValues = z.infer<typeof payrollGroupFormSchema>;
