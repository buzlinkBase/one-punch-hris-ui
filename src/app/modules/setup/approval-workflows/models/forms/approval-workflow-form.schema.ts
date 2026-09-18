import { z } from "zod";

const stepSchema = z
  .object({
    approverType: z.enum([
      "Person",
      "Department",
      "Position",
      "ApplicantManager",
      "ApplicantDepartment",
    ]),
    approverEmployeeId: z.string().optional(),
    approverDepartmentId: z.string().optional(),
    approverPositionId: z.string().optional(),
    minApprovals: z.number().min(1, "Must be at least 1"),
    noteRequirement: z.enum(["None", "Optional", "Required"]),
    namedApproverEmployeeIds: z.array(z.string()),
  })
  .superRefine((step, ctx) => {
    if (step.approverType === "Person" && !step.approverEmployeeId) {
      ctx.addIssue({
        code: "custom",
        message: "Select an employee",
        path: ["approverEmployeeId"],
      });
    }
    if (step.approverType === "Department" && !step.approverDepartmentId) {
      ctx.addIssue({
        code: "custom",
        message: "Select a department",
        path: ["approverDepartmentId"],
      });
    }
    if (step.approverType === "Position" && !step.approverPositionId) {
      ctx.addIssue({
        code: "custom",
        message: "Select a position",
        path: ["approverPositionId"],
      });
    }
  });

export const approvalWorkflowFormSchema = z.object({
  applicationType: z.enum([
    "Leave",
    "Overtime",
    "OfficialBusiness",
    "PassSlip",
    "Loan",
    "ProfileUpdate",
  ]),
  name: z.string().min(1, "Name is required"),
  scopeDepartmentId: z.string().optional(),
  steps: z.array(stepSchema).min(1, "At least one step is required"),
});

export type ApprovalWorkflowFormValues = z.infer<
  typeof approvalWorkflowFormSchema
>;
