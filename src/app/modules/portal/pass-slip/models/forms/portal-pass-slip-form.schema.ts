import { z } from "zod";

// Deliberately not shared with the admin pass-slip-form.schema.ts — that form has no real
// destination/purpose fields (it hardcodes destination and stuffs a notes field into purpose,
// see pass-slip-detail.tsx), which is wrong for a self-filed pass slip that needs to state
// where the employee is going and why. `entries` mirrors admin's multi-entry CreatePassSlip
// shape (one punch time + optional notes per entry, no return time) so an employee can file
// several pass slips in one submission the same way HR can — destination/purpose/remarks stay
// shared across every entry, since those are the honest fields this form collects that admin's
// doesn't.
export const portalPassSlipEntrySchema = z.object({
  punchTime: z.string().min(1, "Time is required"),
  notes: z.string().optional(),
});

export const portalPassSlipFormSchema = z.object({
  employeeId: z.string().min(1, "Employee is required"),
  applicationDate: z.string().min(1, "Date is required"),
  destination: z.string().min(1, "Destination is required"),
  purpose: z.string().min(1, "Purpose is required"),
  remarks: z.string().min(1, "Remarks are required"),
  entries: z.array(portalPassSlipEntrySchema).min(1, "Add at least one entry"),
});

export type PortalPassSlipEntryValues = z.infer<
  typeof portalPassSlipEntrySchema
>;
export type PortalPassSlipFormValues = z.infer<typeof portalPassSlipFormSchema>;
