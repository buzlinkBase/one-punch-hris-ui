import { z } from 'zod';

export const payrollGroupFormSchema = z.object({
  code: z.string().min(1, 'Code is required'),
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  status: z.string().min(1, 'Status is required'),
});

export type PayrollGroupFormValues = z.infer<typeof payrollGroupFormSchema>;
