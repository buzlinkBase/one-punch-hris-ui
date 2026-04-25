import { z } from 'zod';

export const fixedTimeShiftFormSchema = z.object({
  code: z.string().min(1, 'Code is required'),
  name: z.string().min(1, 'Name is required'),
  timeIn: z.string().min(1, 'Time In is required'),
  timeOut: z.string().min(1, 'Time Out is required'),
  breakDuration: z.number().min(0, 'Break duration must be 0 or more'),
  workDuration: z.number().min(1, 'Work duration is required'),
  status: z.string().min(1, 'Status is required'),
});

export type FixedTimeShiftFormValues = z.infer<typeof fixedTimeShiftFormSchema>;
