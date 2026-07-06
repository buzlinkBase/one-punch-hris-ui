import { z } from "zod";

export const forgotPasswordFormSchema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email"),
});

export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordFormSchema>;
