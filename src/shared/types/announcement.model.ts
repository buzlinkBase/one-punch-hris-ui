/** Mirrors hrms-api's AnnouncementState/AnnouncementPriority/AudienceRuleKind (serialized as names). */
export type AnnouncementState =
  "Draft" | "Scheduled" | "Published" | "Unpublished" | "Archived" | "Deleted";

export type AnnouncementPriority = "Normal" | "Important" | "Urgent";

export type AudienceRuleKind =
  | "AllEmployees"
  | "Department"
  | "Position"
  | "Branch"
  | "ProjectSite"
  | "Client"
  | "Section"
  | "EmploymentStatus"
  | "Employee";

/** Pushed on NotificationHub whenever something changes for a recipient. */
export type AnnouncementPushKind =
  "Published" | "Updated" | "Reminder" | "Unpublished" | "Archived" | "Removed";

export const ANNOUNCEMENT_PRIORITY_COLOR: Record<AnnouncementPriority, string> =
  {
    Normal: "default",
    Important: "orange",
    Urgent: "red",
  };
