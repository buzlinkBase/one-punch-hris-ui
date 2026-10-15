import { z } from "zod";

export const deductionApplicationFormSchema = z.object({
  employeeId: z.string().min(1, "Employee is required"),
  deductionId: z.string().min(1, "Deduction is required"),
  encodeDate: z.string().min(1, "Encode date is required"),
  startDate: z.string().min(1, "Start date is required"),
  frequencyOfPayment: z.string().min(1, "Frequency is required"),
  terms: z.number().int().min(1, "Terms must be at least 1"),
  totalPrincipal: z.number().positive("Principal must be positive"),
  interestRate: z.number().min(0, "Interest rate cannot be negative"),
  note: z.string().optional(),
  remarks: z.string().optional(),
});

export type DeductionApplicationFormValues = z.infer<
  typeof deductionApplicationFormSchema
>;

// The admin form adds the attendance rules (see the Other Income form for the same shape). An
// attendance-based deduction is a flat charge, so principal, terms and interest don't apply to it.
export const deductionApplicationAdminFormSchema =
  deductionApplicationFormSchema
    .extend({
      totalPrincipal: z.number().min(0),
      endDate: z.string(),
      payMode: z.enum(["FixedSchedule", "PerQualifyingDay", "PeriodicGated"]),
      amountPerPeriod: z.number().min(0),
      attendanceBasis: z.enum(["None", "Worked", "WorkedOrPaidLeave"]),
      minHours: z.number().nullable(),
      maxLateMinutes: z.number().nullable(),
      maxUndertimeMinutes: z.number().nullable(),
      // Bit values of the selected weekdays / day types; combined into a mask on submit.
      applicableDays: z.array(z.number()),
      dayTypes: z.array(z.number()),
      requireAllDays: z.boolean(),
      minQualifyingDays: z.number().nullable(),
      onMiss: z.enum(["Skip", "Defer"]),
    })
    .superRefine((values, ctx) => {
      if (values.payMode === "FixedSchedule") {
        if (values.totalPrincipal <= 0) {
          ctx.addIssue({
            code: "custom",
            path: ["totalPrincipal"],
            message: "Principal must be positive",
          });
        }
        return;
      }

      if (!values.endDate) {
        ctx.addIssue({
          code: "custom",
          path: ["endDate"],
          message: "End date is required",
        });
      } else if (values.endDate < values.startDate) {
        ctx.addIssue({
          code: "custom",
          path: ["endDate"],
          message: "End date can't be before the start date",
        });
      }
      if (values.amountPerPeriod <= 0) {
        ctx.addIssue({
          code: "custom",
          path: ["amountPerPeriod"],
          message: "Amount must be positive",
        });
      }
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

export type DeductionApplicationAdminFormValues = z.infer<
  typeof deductionApplicationAdminFormSchema
>;
