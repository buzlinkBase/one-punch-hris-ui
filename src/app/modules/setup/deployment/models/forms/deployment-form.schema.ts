import { z } from "zod";

const date = z.string().min(1, "Date is required");
const optionalDate = z.string();

export const clientSiteFormSchema = z
  .object({
    code: z.string().trim().min(1, "Code is required").max(40),
    name: z.string().trim().min(1, "Name is required").max(200),
    areaId: z.string().min(1, "Project site is required"),
    subAreaLabel: z.string().max(100),
    startDate: optionalDate,
    endDate: optionalDate,
  })
  .refine((v) => !v.startDate || !v.endDate || v.endDate >= v.startDate, {
    message: "The end date is before the start date",
    path: ["endDate"],
  });

export type ClientSiteFormValues = z.infer<typeof clientSiteFormSchema>;

export const clientPostFormSchema = z.object({
  code: z.string().trim().min(1, "Code is required").max(40),
  name: z.string().trim().min(1, "Name is required").max(200),
  position: z.string().trim().min(1, "Position is required").max(100),
  armed: z.boolean(),
  notes: z.string().max(500),
});

export type ClientPostFormValues = z.infer<typeof clientPostFormSchema>;

export const postRequirementFormSchema = z
  .object({
    shiftLabel: z.string().trim().min(1, "Shift is required").max(60),
    timeShiftId: z.string(),
    requiredHeadcount: z
      .number({ error: "Headcount is required" })
      .int()
      .min(1, "At least 1")
      .max(500),
    daysOfWeek: z.array(z.string()),
    effectiveFrom: date,
    effectiveTo: optionalDate,
  })
  .refine((v) => !v.effectiveTo || v.effectiveTo >= v.effectiveFrom, {
    message: "The end date is before the start date",
    path: ["effectiveTo"],
  });

export type PostRequirementFormValues = z.infer<
  typeof postRequirementFormSchema
>;

export const assignDeploymentFormSchema = z
  .object({
    employeeId: z.string().min(1, "Choose the employee"),
    postId: z.string().min(1, "Choose the post"),
    role: z.enum(["Regular", "Reliever", "Augmentation"]),
    startDate: date,
    endDate: optionalDate,
    reason: z.string().max(500),
    eventTag: z.string().max(200),
  })
  .refine((v) => !v.endDate || v.endDate >= v.startDate, {
    message: "The end date is before the start date",
    path: ["endDate"],
  })
  .refine((v) => v.role !== "Augmentation" || !!v.endDate, {
    message: "Augmentation is temporary: enter its last day",
    path: ["endDate"],
  });

export type AssignDeploymentFormValues = z.infer<
  typeof assignDeploymentFormSchema
>;

export const endDeploymentFormSchema = z.object({
  endDate: date,
  reason: z.string().max(500),
});

export type EndDeploymentFormValues = z.infer<typeof endDeploymentFormSchema>;
