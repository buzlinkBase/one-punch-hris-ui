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
    } else {
      const pw = values.password!;
      if (pw.length < 8) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["password"],
          message: "Password must be at least 8 characters",
        });
      }
      if (!/[A-Z]/.test(pw)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["password"],
          message: "Must contain at least 1 uppercase letter",
        });
      }
      if (!/[a-z]/.test(pw)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["password"],
          message: "Must contain at least 1 lowercase letter",
        });
      }
      if (!/[0-9]/.test(pw)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["password"],
          message: "Must contain at least 1 number",
        });
      }
      if (!/[^a-zA-Z0-9]/.test(pw)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["password"],
          message: "Must contain at least 1 special character",
        });
      }
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
