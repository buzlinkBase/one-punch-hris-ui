import { z } from "zod";

export const batchInviteFormSchema = z
  .object({
    entityType: z.enum(["Employee", "Client"]),
    role: z.string().min(1, "Choose a role"),
    clientId: z.string().optional(),
  })
  .refine((v) => v.entityType === "Employee" || Boolean(v.clientId), {
    path: ["clientId"],
    message: "Choose the client these logins are for",
  });

export type BatchInviteFormValues = z.infer<typeof batchInviteFormSchema>;
