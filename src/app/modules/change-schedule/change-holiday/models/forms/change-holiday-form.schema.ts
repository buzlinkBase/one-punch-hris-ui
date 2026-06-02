import { z } from "zod";

export const changeHolidayFormSchema = z
  .object({
    targetType: z.enum(["employee", "payroll-group", "employee-group"]),
    employeeId: z.string().optional(),
    payrollGroupId: z.string().optional(),
    employeeIds: z.array(z.string()).default([]),
    holidayId: z.string().min(1, "Holiday is required"),
    fromDate: z.string().min(1, "From date is required"),
    toDate: z.string().min(1, "To date is required"),
  })
  .superRefine((value, ctx) => {
    if (value.targetType === "employee" && !value.employeeId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["employeeId"],
        message: "Employee is required",
      });
    }

    if (value.targetType === "payroll-group" && !value.payrollGroupId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["payrollGroupId"],
        message: "Payroll group is required",
      });
    }

    if (
      (value.targetType === "payroll-group" ||
        value.targetType === "employee-group") &&
      value.employeeIds.length < 1
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["employeeIds"],
        message: "Select at least one employee",
      });
    }
  });

export type ChangeHolidayFormInput = z.input<typeof changeHolidayFormSchema>;
export type ChangeHolidayFormValues = z.infer<typeof changeHolidayFormSchema>;
