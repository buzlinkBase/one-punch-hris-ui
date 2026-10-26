export type StatusTone = "success" | "warning" | "error" | "default";

const SUCCESS = new Set(["approved", "active", "paid", "completed", "posted"]);
const WARNING = new Set([
  "forapproval",
  "pending",
  "processing",
  "partial",
  "draft",
]);
const ERROR = new Set(["declined", "rejected", "failed", "overdue", "locked"]);

/** Maps any status string ("ForApproval", "For Approval", "ACTIVE") to a display tone. */
export function statusTone(status?: string | null): StatusTone {
  const key = (status ?? "").replace(/[\s_-]/g, "").toLowerCase();
  if (SUCCESS.has(key)) return "success";
  if (WARNING.has(key)) return "warning";
  if (ERROR.has(key)) return "error";
  return "default";
}
