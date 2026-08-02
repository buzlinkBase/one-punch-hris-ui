import { z } from "zod";

export const travelOrderFormSchema = z.object({
  employeeId: z.string().min(1, "Employee is required"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  travelDayType: z.string().min(1, "Day type is required"),
  destination: z.string().min(1, "Destination is required"),
  classification: z.string().min(1, "Classification is required"),
  purpose: z.string().min(1, "Purpose is required"),
  cost: z.number({ error: "Cost must be a number" }).min(0),
  applicationRemarks: z.string().optional(),
});

export type TravelOrderFormValues = z.infer<typeof travelOrderFormSchema>;
