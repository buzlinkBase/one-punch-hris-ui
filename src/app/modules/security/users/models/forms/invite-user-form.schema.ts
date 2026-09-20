import { z } from "zod";

export const inviteUserFormSchema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email"),
  roles: z.array(z.string()).min(1, "Select at least one role"),
});

export type InviteUserFormValues = z.infer<typeof inviteUserFormSchema>;

export const buildInviteUserFormSchema = (
  existingMembers: Array<{ email: string }>,
) =>
  inviteUserFormSchema.refine(
    (values) => {
      if (!values.email) {
        return true;
      }

      const normalized = values.email.trim().toLowerCase();
      return !existingMembers.some(
        (member) => member.email.trim().toLowerCase() === normalized,
      );
    },
    {
      message:
        "This user is already a member of this company. Change their roles instead in the users settings.",
      path: ["email"],
    },
  );
