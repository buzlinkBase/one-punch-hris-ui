import { z } from "zod";

export const userFormSchema = z
  .object({
    fullName: z.string().min(1, "Full name is required"),
    username: z.string().min(1, "Username is required"),
    password: z.string().optional(),
    confirmPassword: z.string().optional(),
    userType: z.enum(["Administrator", "HR", "Employee"]),
    status: z.string().min(1, "Status is required"),
  })
  .superRefine((values, ctx) => {
    const hasPassword = Boolean(values.password?.trim());
    const hasConfirmPassword = Boolean(values.confirmPassword?.trim());

    if (!hasPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["password"],
        message: "Password is required",
      });
    }

    if (!hasConfirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["confirmPassword"],
        message: "Confirm password is required",
      });
    }

    if (
      hasPassword &&
      hasConfirmPassword &&
      values.password !== values.confirmPassword
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["confirmPassword"],
        message: "Passwords do not match",
      });
    }
  });

export type UserFormValues = z.infer<typeof userFormSchema>;
