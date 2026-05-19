import { z } from "zod";

export const clientFormSchema = z.object({
  clientCode: z.string().min(1, "Client code is required"),
  clientName: z.string().min(1, "Client name is required"),
  contactPerson: z.string().min(1, "Contact person is required"),
  contactNumber: z.string().min(1, "Contact number is required"),
  email: z.string().email("Invalid email address"),
  address: z.string().min(1, "Address is required"),
  unpaidDues: z.coerce.number().min(0, "Unpaid dues cannot be negative"),
});

export type ClientFormValues = z.infer<typeof clientFormSchema>;
