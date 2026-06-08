import { z } from "zod";

export const employeeDocRecordFormSchema = z.object({
  employeeId: z.string().min(1, "Employee is required"),
  recordType: z.string().min(1, "Record type is required"),
  description: z.string().min(1, "Description is required"),
  file: z.string().optional().default(""),
});

export type EmployeeDocRecordFormValues = z.infer<typeof employeeDocRecordFormSchema>;
