import { z } from 'zod';

export const flexiTimeShiftFormSchema = z.object({
  code: z.string().min(1, 'Code is required'),
  name: z.string().min(1, 'Name is required'),
  coreTimeStart: z.string().min(1, 'Core time start is required'),
  coreTimeEnd: z.string().min(1, 'Core time end is required'),
  workDuration: z.number().min(1, 'Work duration is required'),
  status: z.string().min(1, 'Status is required'),
});

export type FlexiTimeShiftFormValues = z.infer<typeof flexiTimeShiftFormSchema>;
