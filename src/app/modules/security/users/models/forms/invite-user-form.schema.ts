import { z } from "zod";

export const inviteUserFormSchema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email"),
  role: z.string().min(1, "Role is required"),
});

export type InviteUserFormValues = z.infer<typeof inviteUserFormSchema>;
