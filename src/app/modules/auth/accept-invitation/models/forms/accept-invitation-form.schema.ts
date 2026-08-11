import { z } from "zod";

export const acceptInvitationFormSchema = z
  .object({
    name: z.string().min(1, "Name is required"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Must contain at least 1 uppercase letter")
      .regex(/[a-z]/, "Must contain at least 1 lowercase letter")
      .regex(/[0-9]/, "Must contain at least 1 number")
      .regex(/[^a-zA-Z0-9]/, "Must contain at least 1 special character"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type AcceptInvitationFormValues = z.infer<
  typeof acceptInvitationFormSchema
>;
