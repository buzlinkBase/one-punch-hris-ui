import { z } from "zod";

export const attendanceEntryFilterSchema = z
  .object({
    fromDate: z.string().optional(),
    toDate: z.string().optional(),
    employeeId: z.string().optional(),
  })
  .refine(
    (value) => {
      if (!value.fromDate || !value.toDate) return true;
      return new Date(value.fromDate) <= new Date(value.toDate);
    },
    {
      path: ["toDate"],
      message: "To date must be on or after From date",
    },
  );

export type AttendanceEntryFilterValues = z.infer<
  typeof attendanceEntryFilterSchema
>;
