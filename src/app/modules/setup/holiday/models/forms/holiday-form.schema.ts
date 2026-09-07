import { z } from "zod";

export const holidayFormSchema = z.object({
  description: z.string().min(1, "Description is required"),
  holType: z.enum(["SPECIAL", "LEGAL"]),
  workType: z.enum(["Working", "NonWorking"]),
  holDate: z.string().min(1, "Date is required"),
  isRecuring: z.boolean().default(false),
  weekOfMonth: z.number().nullable().optional(),
  dayOfWeek: z
    .enum([
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ])
    .nullable()
    .optional(),
  isPaid: z.boolean().default(false),
  areaId: z.string().nullable().optional(),
  status: z.string().min(1, "Status is required"),
});

export type HolidayFormValues = z.infer<typeof holidayFormSchema>;
