import { z } from "zod";

export const operationAreaFormSchema = z.object({
  code: z.string().min(1, "Code is required"),
  name: z.string().min(1, "Name is required"),
  status: z.string().min(1, "Status is required"),
});

export type OperationAreaFormValues = z.infer<typeof operationAreaFormSchema>;
