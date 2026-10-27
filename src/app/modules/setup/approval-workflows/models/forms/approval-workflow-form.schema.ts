import { z } from "zod";

const approverTypeSchema = z.enum([
  "Person",
  "Department",
  "Position",
  "ApplicantManager",
  "ApplicantDepartment",
  "ApplicantManagerLevel",
  "ApplicantDepartmentHead",
  "ApplicantSectionHead",
  "ApplicantBranchHead",
  "ApplicantAreaHead",
  "ApplicantClientHead",
]);

// One extra pool of approvers on a step (see StepGroupEditor).
const groupSchema = z
  .object({
    approverType: approverTypeSchema,
    approverEmployeeId: z.string().optional(),
    approverDepartmentId: z.string().optional(),
    approverPositionId: z.string().optional(),
    approverLevel: z.number().int().min(1).max(10).optional(),
    onUnresolved: z.enum(["Block", "Skip", "FallbackPerson"]),
    fallbackEmployeeId: z.string().optional(),
    minApprovals: z.number().min(1, "Must be at least 1"),
  })
  .superRefine((group, ctx) => {
    if (group.approverType === "Person" && !group.approverEmployeeId)
      ctx.addIssue({
        code: "custom",
        message: "Select an employee",
        path: ["approverEmployeeId"],
      });
    if (group.approverType === "Department" && !group.approverDepartmentId)
      ctx.addIssue({
        code: "custom",
        message: "Select a department",
        path: ["approverDepartmentId"],
      });
    if (group.approverType === "Position" && !group.approverPositionId)
      ctx.addIssue({
        code: "custom",
        message: "Select a position",
        path: ["approverPositionId"],
      });
    if (group.onUnresolved === "FallbackPerson" && !group.fallbackEmployeeId)
      ctx.addIssue({
        code: "custom",
        message: "Select the person to use when no approver is found",
        path: ["fallbackEmployeeId"],
      });
  });

const stepSchema = z
  .object({
    approverType: approverTypeSchema,
    approverEmployeeId: z.string().optional(),
    approverDepartmentId: z.string().optional(),
    approverPositionId: z.string().optional(),
    minApprovals: z.number().min(1, "Must be at least 1"),
    approverLevel: z.number().int().min(1).max(10).optional(),
    onUnresolved: z.enum(["Block", "Skip", "FallbackPerson"]),
    fallbackEmployeeId: z.string().optional(),
    conditionMetric: z.enum(["None", "Days", "Hours", "Amount"]),
    conditionOperator: z.enum([
      "GreaterOrEqual",
      "GreaterThan",
      "LessOrEqual",
      "LessThan",
    ]),
    conditionValue: z.number().min(0).optional(),
    remindAfterHours: z.number().int().min(1).max(2160).optional(),
    remindRepeatHours: z.number().int().min(1).max(2160).optional(),
    escalateAfterHours: z.number().int().min(1).max(2160).optional(),
    escalateToEmployeeId: z.string().optional(),
    noteRequirement: z.enum(["None", "Optional", "Required"]),
    namedApproverEmployeeIds: z.array(z.string()),
    groups: z.array(groupSchema).max(5, "At most 5 extra groups"),
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
    if (step.onUnresolved === "FallbackPerson" && !step.fallbackEmployeeId) {
      ctx.addIssue({
        code: "custom",
        message: "Select the person to use when no approver is found",
        path: ["fallbackEmployeeId"],
      });
    }
    if (
      step.remindRepeatHours !== undefined &&
      step.remindAfterHours === undefined
    ) {
      ctx.addIssue({
        code: "custom",
        message: "Set when the first reminder goes out before repeating it",
        path: ["remindRepeatHours"],
      });
    }
    if (step.escalateAfterHours !== undefined && !step.escalateToEmployeeId) {
      ctx.addIssue({
        code: "custom",
        message: "Choose the person to escalate to",
        path: ["escalateToEmployeeId"],
      });
    }
    if (step.escalateToEmployeeId && step.escalateAfterHours === undefined) {
      ctx.addIssue({
        code: "custom",
        message: "Set how long to wait before escalating",
        path: ["escalateAfterHours"],
      });
    }
    if (step.conditionMetric !== "None" && step.conditionValue === undefined) {
      ctx.addIssue({
        code: "custom",
        message: "Enter the amount to compare with",
        path: ["conditionValue"],
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

const scopeConditionSchema = z.object({
  dimension: z.enum([
    "Branch",
    "Department",
    "Client",
    "Area",
    "PayrollGroup",
    "Position",
    "Section",
    "EmploymentStatus",
    "Employee",
    "LeaveType",
  ]),
  values: z.array(z.string()),
});

export const approvalWorkflowFormSchema = z
  .object({
    applicationType: z.enum([
      "Leave",
      "Overtime",
      "OfficialBusiness",
      "PassSlip",
      "Loan",
      "ProfileUpdate",
      "PayrollPosting",
      "Dtr",
      "DtrDeletion",
      "PayrollPostingDeletion",
    ]),
    name: z.string().min(1, "Name is required"),
    scopes: z
      .array(scopeConditionSchema)
      .refine((rows) => rows.every((r) => r.values.length > 0), {
        message: "Pick at least one value for every condition, or remove it",
      })
      .refine(
        (rows) => new Set(rows.map((r) => r.dimension)).size === rows.length,
        {
          message: "Each condition type can only be used once",
        },
      ),
    priority: z
      .number({ message: "Priority is required" })
      .int("Must be a whole number")
      .min(1, "Must be at least 1")
      .max(9999, "Must be at most 9999"),
    steps: z.array(stepSchema).min(1, "At least one step is required"),
  })
  .superRefine((values, ctx) => {
    // A skipped first step could finish the request without the module's own status update.
    if (values.steps[0]?.conditionMetric !== "None") {
      ctx.addIssue({
        code: "custom",
        message:
          "The first step can't be conditional; it applies to every request",
        path: ["steps", 0, "conditionMetric"],
      });
    }
    if (values.steps[0]?.onUnresolved === "Skip") {
      ctx.addIssue({
        code: "custom",
        message:
          "The first step can't be skipped; choose a fallback person or leave it waiting",
        path: ["steps", 0, "onUnresolved"],
      });
    }
  });

export type ApprovalWorkflowFormValues = z.infer<
  typeof approvalWorkflowFormSchema
>;
