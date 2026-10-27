import { z } from "zod";

export const delegationFormSchema = z
  .object({
    /** Admin screen only: who is delegating. */
    delegatorEmployeeId: z.string().optional(),
    delegateEmployeeId: z.string().min(1, "Choose who will approve for you"),
    fromDate: z.string().optional(),
    toDate: z.string().optional(),
    applicationType: z.string().optional(),
    onlyWhileOnLeave: z.boolean(),
    reason: z.string().max(500, "Keep it under 500 characters").optional(),
  })
  .refine((v) => !v.fromDate || !v.toDate || v.toDate >= v.fromDate, {
    message: "The end date can't be before the start date",
    path: ["toDate"],
  });

export type DelegationFormValues = z.infer<typeof delegationFormSchema>;
