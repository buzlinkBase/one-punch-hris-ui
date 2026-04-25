import { z } from 'zod';

export const departmentFormSchema = z.object({
  code: z.string().min(1, 'Code is required'),
  name: z.string().min(1, 'Department name is required'),
  branchId: z.string().min(1, 'Branch is required'),
  headId: z.string().min(1, 'Department head is required'),
  status: z.string().min(1, 'Status is required'),
});

export type DepartmentFormValues = z.infer<typeof departmentFormSchema>;
