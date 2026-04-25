import { z } from 'zod';

export const holidayFormSchema = z.object({
  name: z.string().min(1, 'Holiday name is required'),
  date: z.string().min(1, 'Date is required'),
  type: z.enum(['Regular', 'Special Non-Working', 'Special Working']),
  status: z.string().min(1, 'Status is required'),
});

export type HolidayFormValues = z.infer<typeof holidayFormSchema>;
