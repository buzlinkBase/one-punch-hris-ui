import { z } from "zod";

export const payrollInclusionDefaultsFormSchema = z.object({
  defaultRestDayPaid: z.boolean(),
  defaultRegularHolidayIncluded: z.boolean(),
  defaultSpecialNonWorkingIncluded: z.boolean(),
  defaultNightDiffIncluded: z.boolean(),
});

export type PayrollInclusionDefaultsFormValues = z.infer<
  typeof payrollInclusionDefaultsFormSchema
>;
