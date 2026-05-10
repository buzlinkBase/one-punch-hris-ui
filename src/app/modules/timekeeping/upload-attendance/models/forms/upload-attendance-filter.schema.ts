import { z } from "zod";

export const uploadAttendanceFilterSchema = z
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
      message: "To Date must be greater than or equal to From Date",
    },
  );

export type UploadAttendanceFilterValues = z.infer<
  typeof uploadAttendanceFilterSchema
>;
