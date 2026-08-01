import { z } from "zod";

export const updateProfileFormSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  phoneNumber: z.string().optional(),
});

export type UpdateProfileFormValues = z.infer<typeof updateProfileFormSchema>;
