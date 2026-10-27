import { z } from "zod";
import type { Dayjs } from "dayjs";

const baseSchema = z.object({
  employeeId: z.string().optional(),
  direction: z.enum(["add", "remove"]),
  amount: z.number({ error: "Required" }).min(0.0001, "Must be more than 0"),
  particulars: z.string().trim().min(1, "Required"),
  entryDate: z.custom<Dayjs>().optional(),
});

export type BalanceAdjustFormValues = z.infer<typeof baseSchema>;

/**
 * The employee is only picked when the modal isn't opened on one already, and the entry date is
 * only asked for on reports that date their entries.
 */
export const buildBalanceAdjustFormSchema = ({
  pickEmployee,
  askEntryDate,
}: {
  pickEmployee: boolean;
  askEntryDate: boolean;
}) =>
  baseSchema.superRefine((values, ctx) => {
    if (pickEmployee && !values.employeeId) {
      ctx.addIssue({
        code: "custom",
        message: "Required",
        path: ["employeeId"],
      });
    }
    if (askEntryDate && !values.entryDate) {
      ctx.addIssue({
        code: "custom",
        message: "Required",
        path: ["entryDate"],
      });
    }
  });
