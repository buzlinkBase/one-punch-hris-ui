import { z } from "zod";

// day is ignored server-side once isEndOfMonth is checked (CutoffPolicyResolver recomputes
// it as the actual last day of the reference month), but the field always carries a value
// so the row stays valid — the UI disables the Day input instead of clearing it.
const cutoffModelSchema = z.object({
  day: z.number().min(1, "Min 1").max(31, "Max 31"),
  isEndOfMonth: z.boolean(),
  label: z.string(),
});

export const payrollGroupFormSchema = z
  .object({
    code: z.string().min(1, "Code is required"),
    name: z.string().min(1, "Name is required"),
    payrollFrequency: z.enum(["DAILY", "WEEKLY", "SEMI_MONTHLY", "MONTHLY"]),
    statutoryDeductionSchedule: z.enum([
      "PerPayroll",
      "FirstHalfMonth",
      "SecondHalfMonth",
    ]),
    // At least one cutoff is required for every frequency — CutoffPolicyResolver throws
    // CutoffMismatchException when a payroll group has none, even for MONTHLY/DAILY.
    cutoffDays: z
      .array(cutoffModelSchema)
      .min(1, "At least one cutoff day is required"),
    status: z.string().min(1, "Status is required"),
  })
  // Mirrors PayrollGroupService.CreateValidatorAsync on the backend — same rules, checked
  // here first so the user sees them before submitting instead of after a round-trip.
  .superRefine((values, ctx) => {
    const { cutoffDays, payrollFrequency } = values;

    const eomCount = cutoffDays.filter((c) => c.isEndOfMonth).length;
    if (eomCount > 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["cutoffDays"],
        message: "Only one cutoff day can be marked as End of Month.",
      });
    }

    const seenDays = new Map<number, number>();
    cutoffDays.forEach((c, i) => {
      if (c.isEndOfMonth) return;
      if (seenDays.has(c.day)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["cutoffDays", i, "day"],
          message: `Day ${c.day} is already used by another cutoff.`,
        });
      }
      seenDays.set(c.day, i);
    });

    // Semi-Monthly and Weekly rely on a genuine "first" and "second" cutoff — a single
    // cutoff throws CutoffMismatchException server-side once a Fixed/PerPayroll statutory
    // calculator runs for the group.
    if (
      (payrollFrequency === "SEMI_MONTHLY" || payrollFrequency === "WEEKLY") &&
      cutoffDays.length < 2
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["cutoffDays"],
        message: `${payrollFrequency === "SEMI_MONTHLY" ? "Semi-Monthly" : "Weekly"} payroll requires at least two cutoff days.`,
      });
    }
  });

export type PayrollGroupFormValues = z.infer<typeof payrollGroupFormSchema>;
