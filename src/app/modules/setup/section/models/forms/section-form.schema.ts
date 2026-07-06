import { z } from "zod";

export const sectionFormSchema = z.object({
  departmentId: z.string().nullable().optional(),
  code: z.string().min(1, "Code is required"),
  name: z.string().min(1, "Name is required"),
  status: z.string().min(1, "Status is required"),
});

export type SectionFormValues = z.infer<typeof sectionFormSchema>;
