import { z } from "zod";

// Deliberately fresh, not the admin changeRestDayFormSchema — that schema carries an unused
// third `toDate` field its own submit handler never actually sends (confirmed by reading
// change-rest-day-detail.tsx). Self-service only needs the two dates that matter.
export const portalChangeRestDayFormSchema = z.object({
  employeeId: z.string().min(1, "Employee is required"),
  fromDate: z.string().min(1, "Your current rest day is required"),
  newDate: z.string().min(1, "Your new rest day is required"),
});

export type PortalChangeRestDayFormValues = z.infer<
  typeof portalChangeRestDayFormSchema
>;
