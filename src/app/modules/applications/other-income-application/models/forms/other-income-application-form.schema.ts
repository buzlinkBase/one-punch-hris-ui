import { z } from "zod";

export const otherIncomeApplicationFormSchema = z
  .object({
    employeeId: z.string().min(1, "Employee is required"),
    incomeId: z.string().min(1, "Income type is required"),
    encodeDate: z.string().min(1, "Encode date is required"),
    startDate: z.string().min(1, "Start date is required"),
    endDate: z.string().min(1, "End date is required"),
    frequencyOfPayment: z.string().min(1, "Frequency is required"),
    amount: z.number().positive("Amount must be positive"),
    remarks: z.string().optional(),
    payMode: z.enum(["FixedSchedule", "PerQualifyingDay", "PeriodicGated"]),
    attendanceBasis: z.enum(["None", "Worked", "WorkedOrPaidLeave"]),
    minHours: z.number().nullable(),
    maxLateMinutes: z.number().nullable(),
    maxUndertimeMinutes: z.number().nullable(),
    // Bit values of the selected weekdays / day types; combined into a mask on submit.
    applicableDays: z.array(z.number()),
    dayTypes: z.array(z.number()),
    requireAllDays: z.boolean(),
    minQualifyingDays: z.number().nullable(),
  })
  .superRefine((values, ctx) => {
    if (
      values.startDate &&
      values.endDate &&
      values.endDate < values.startDate
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["endDate"],
        message: "End date can't be before the start date",
      });
    }

    if (values.payMode === "FixedSchedule") return;

    if (values.attendanceBasis === "None") {
      ctx.addIssue({
        code: "custom",
        path: ["attendanceBasis"],
        message: "Choose what counts as present",
      });
    }
    if (
      values.minHours !== null &&
      !(values.minHours > 0 && values.minHours <= 24)
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["minHours"],
        message: "Must be between 0 and 24 hours",
      });
    }
    if (values.applicableDays.length === 0) {
      ctx.addIssue({
        code: "custom",
        path: ["applicableDays"],
        message: "Select at least one day",
      });
    }
    if (values.dayTypes.length === 0) {
      ctx.addIssue({
        code: "custom",
        path: ["dayTypes"],
        message: "Select at least one day type",
      });
    }
    if (
      values.payMode === "PeriodicGated" &&
      !["Weekly", "Monthly"].includes(values.frequencyOfPayment)
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["frequencyOfPayment"],
        message: "Choose weekly or monthly",
      });
    }
    if (
      values.payMode === "PeriodicGated" &&
      !values.requireAllDays &&
      (values.minQualifyingDays === null || values.minQualifyingDays < 1)
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["minQualifyingDays"],
        message: "Enter at least 1 day",
      });
    }
  });

export type OtherIncomeApplicationFormValues = z.infer<
  typeof otherIncomeApplicationFormSchema
>;
