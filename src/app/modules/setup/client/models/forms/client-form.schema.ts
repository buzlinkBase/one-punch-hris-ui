import { z } from "zod";

export const clientFormSchema = z.object({
  code: z.string().min(1, "Code is required"),
  name: z.string().min(1, "Name is required"),
  status: z.string().min(1, "Status is required"),
});

export type ClientFormValues = z.infer<typeof clientFormSchema>;
