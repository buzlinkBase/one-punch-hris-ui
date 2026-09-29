import { z } from "zod";

export const TITLE_MAX = 200;
export const BODY_MAX = 10000;

const RULE_KINDS = [
  "AllEmployees",
  "Department",
  "Position",
  "Branch",
  "ProjectSite",
  "Client",
  "Section",
  "EmploymentStatus",
  "Employee",
] as const;

export const audienceRuleFormSchema = z
  .object({
    kind: z.enum(RULE_KINDS),
    targetId: z.string().nullable(),
    targetValue: z.string().nullable(),
    targetLabel: z.string(),
    isExclusion: z.boolean(),
  })
  .superRefine((rule, ctx) => {
    if (rule.kind === "EmploymentStatus" && !rule.targetValue) {
      ctx.addIssue({
        code: "custom",
        path: ["targetValue"],
        message: "Pick a status",
      });
    }
    if (
      rule.kind !== "AllEmployees" &&
      rule.kind !== "EmploymentStatus" &&
      !rule.targetId
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["targetId"],
        message: "Pick who this rule targets",
      });
    }
  });

// Dates are ISO strings (UTC) or null -- DatePicker values are converted at the field.
export const announcementFormSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, "Title is required")
      .max(TITLE_MAX, `Keep the title under ${TITLE_MAX} characters`),
    body: z
      .string()
      .trim()
      .min(1, "Message is required")
      .max(BODY_MAX, `Keep the message under ${BODY_MAX} characters`),
    priority: z.enum(["Normal", "Important", "Urgent"]),
    requiresAcknowledgement: z.boolean(),
    acknowledgeByUtc: z.string().nullable(),
    isPinned: z.boolean(),
    pinnedUntilUtc: z.string().nullable(),
    expiresAtUtc: z.string().nullable(),
    excludeInactive: z.boolean(),
    audienceRules: z.array(audienceRuleFormSchema),
    requireReacknowledgement: z.boolean(),
  })
  .superRefine((values, ctx) => {
    const now = Date.now();
    if (values.expiresAtUtc && Date.parse(values.expiresAtUtc) <= now) {
      ctx.addIssue({
        code: "custom",
        path: ["expiresAtUtc"],
        message: "The expiry must be in the future",
      });
    }
    if (values.pinnedUntilUtc && Date.parse(values.pinnedUntilUtc) <= now) {
      ctx.addIssue({
        code: "custom",
        path: ["pinnedUntilUtc"],
        message: "Pin until a time in the future",
      });
    }
  });

export type AnnouncementFormValues = z.infer<typeof announcementFormSchema>;
export type AudienceRuleFormValues = z.infer<typeof audienceRuleFormSchema>;

export const EMPTY_ANNOUNCEMENT_FORM: AnnouncementFormValues = {
  title: "",
  body: "",
  priority: "Normal",
  requiresAcknowledgement: false,
  acknowledgeByUtc: null,
  isPinned: false,
  pinnedUntilUtc: null,
  expiresAtUtc: null,
  excludeInactive: true,
  audienceRules: [
    {
      kind: "AllEmployees",
      targetId: null,
      targetValue: null,
      targetLabel: "All employees",
      isExclusion: false,
    },
  ],
  requireReacknowledgement: false,
};
