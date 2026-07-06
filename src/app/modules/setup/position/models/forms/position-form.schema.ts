import { z } from "zod";

export const positionFormSchema = z.object({
  code: z.string().min(1, "Code is required"),
  name: z.string().min(1, "Name is required"),
  rate: z.number().min(0, "Rate must be 0 or greater").default(0),
  status: z.string().min(1, "Status is required"),
});

export type PositionFormValues = z.infer<typeof positionFormSchema>;
