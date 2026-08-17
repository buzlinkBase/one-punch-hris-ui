import { z } from "zod";

export const inviteUserFormSchema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email"),
  roles: z.array(z.string()).min(1, "Select at least one role"),
});

export type InviteUserFormValues = z.infer<typeof inviteUserFormSchema>;
