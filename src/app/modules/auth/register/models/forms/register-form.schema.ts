import { z } from "zod";

const baseRegisterFormSchema = z
  .object({
    name: z.string().min(1, "name is required"),
    email: z.string().min(1, "Email is required").email("Enter a valid email"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Must contain at least 1 uppercase letter")
      .regex(/[a-z]/, "Must contain at least 1 lowercase letter")
      .regex(/[0-9]/, "Must contain at least 1 number")
      .regex(/[^a-zA-Z0-9]/, "Must contain at least 1 special character"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
    agreeToTerms: z.boolean(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

/** The Terms box is required only while the Terms of Service are live (useTermsLive). */
export function registerFormSchema(termsRequired: boolean) {
  return baseRegisterFormSchema.refine(
    (data) => !termsRequired || data.agreeToTerms,
    {
      message: "Please agree to the Terms of Service to continue.",
      path: ["agreeToTerms"],
    },
  );
}

export type RegisterFormValues = z.infer<typeof baseRegisterFormSchema>;
