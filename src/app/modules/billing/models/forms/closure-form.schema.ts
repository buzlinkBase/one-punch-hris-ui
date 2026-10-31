import { z } from "zod";

/** The "Close my account" form. Whether the email is the owner's is checked against the session by the caller. */
export const closureFormSchema = z.object({
  confirmEmail: z.string().trim().min(1, "Type your email to confirm"),
  reason: z.string().trim().max(500, "At most 500 characters").optional(),
  exported: z.boolean().refine((value) => value, {
    message: "Please confirm you have exported what you need",
  }),
});

export type ClosureFormValues = z.infer<typeof closureFormSchema>;
