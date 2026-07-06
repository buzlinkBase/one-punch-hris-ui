import { z } from "zod";

export const holidayFormSchema = z.object({
  description: z.string().min(1, "Description is required"),
  holType: z.enum(["SPECIAL", "LEGAL"]),
  workType: z.enum(["Working", "NonWorking"]),
  holDate: z.string().min(1, "Date is required"),
  isRecuring: z.boolean().default(false),
  isPaid: z.boolean().default(false),
  areaId: z.string().nullable().optional(),
  status: z.string().min(1, "Status is required"),
});

export type HolidayFormValues = z.infer<typeof holidayFormSchema>;
