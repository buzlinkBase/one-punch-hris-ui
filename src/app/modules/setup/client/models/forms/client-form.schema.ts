import { z } from "zod";

export const clientFormSchema = z.object({
  code: z.string().min(1, "Code is required"),
  name: z.string().min(1, "Name is required"),
  status: z.string().min(1, "Status is required"),
  email: z.string().email("Invalid email").or(z.literal("")),
  phone: z.string(),
  address: z.string(),
  contactPerson: z.string(),
});

export type ClientFormValues = z.infer<typeof clientFormSchema>;
