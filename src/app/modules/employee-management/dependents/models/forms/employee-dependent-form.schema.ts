import { z } from "zod";

export const employeeDependentFormSchema = z.object({
  employeeId: z.string().min(1, "Employee is required"),
  fullName: z.string().min(1, "Full name is required"),
  relationship: z.string().min(1, "Relationship is required"),
  gender: z.string().min(1, "Gender is required"),
  dob: z.string().min(1, "Date of birth is required"),
});

export type EmployeeDependentFormValues = z.infer<
  typeof employeeDependentFormSchema
>;
