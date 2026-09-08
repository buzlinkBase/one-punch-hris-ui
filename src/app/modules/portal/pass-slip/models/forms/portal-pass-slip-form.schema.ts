import { z } from "zod";

// Deliberately not shared with the admin pass-slip-form.schema.ts — that form has no real
// destination/purpose fields (it hardcodes destination and stuffs a notes field into purpose,
// see pass-slip-detail.tsx), which is wrong for a self-filed pass slip that needs to state
// where the employee is going and why.
export const portalPassSlipFormSchema = z.object({
  employeeId: z.string().min(1, "Employee is required"),
  applicationDate: z.string().min(1, "Date is required"),
  departureTime: z.string().min(1, "Departure time is required"),
  returnTime: z.string().optional(),
  destination: z.string().min(1, "Destination is required"),
  purpose: z.string().min(1, "Purpose is required"),
  remarks: z.string().min(1, "Remarks are required"),
});

export type PortalPassSlipFormValues = z.infer<typeof portalPassSlipFormSchema>;
