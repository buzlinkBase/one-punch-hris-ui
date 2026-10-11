import type {
  AnnouncementPriority,
  AnnouncementState,
  AudienceRuleKind,
} from "@/shared/types/announcement.model";
import type { AnnouncementListTab } from "../models/api/request/announcement-request.model";

export const ANNOUNCEMENT_PERMISSION = {
  VIEW: "Announcements:View",
  CREATE: "Announcements:Create",
  EDIT: "Announcements:Edit",
  DELETE: "Announcements:Delete",
  PUBLISH: "Announcements:Publish",
} as const;

export const ANNOUNCEMENT_PATH = {
  LIST: "/communication/announcements",
  CREATE: "/communication/announcements/create",
  edit: (id: string) => `/communication/announcements/${id}/edit`,
  report: (id: string) => `/communication/announcements/${id}`,
} as const;

export const ANNOUNCEMENT_LABEL = {
  TITLE: "Announcements",
  SUBTITLE:
    "Send notices to the whole company, departments, positions or specific people — and see who has read and acknowledged them.",
  CREATE_TITLE: "New Announcement",
  EDIT_TITLE: "Edit Announcement",
  NEW: "New Announcement",
};

export const LIST_TAB_OPTIONS: { value: AnnouncementListTab; label: string }[] =
  [
    { value: "Active", label: "Active" },
    { value: "Unpublished", label: "Unpublished" },
    { value: "Archived", label: "Archived" },
    { value: "Deleted", label: "Recently deleted" },
  ];

export const STATE_TAG: Record<
  AnnouncementState,
  { label: string; color: string }
> = {
  Draft: { label: "Draft", color: "default" },
  Scheduled: { label: "Scheduled", color: "purple" },
  Published: { label: "Published", color: "success" },
  Unpublished: { label: "Unpublished", color: "warning" },
  Archived: { label: "Archived", color: "default" },
  Deleted: { label: "Deleted", color: "error" },
};

export const PRIORITY_OPTIONS: {
  value: AnnouncementPriority;
  label: string;
}[] = [
  { value: "Normal", label: "Normal" },
  { value: "Important", label: "Important" },
  { value: "Urgent", label: "Urgent" },
];

export const RULE_KIND_OPTIONS: { value: AudienceRuleKind; label: string }[] = [
  { value: "AllEmployees", label: "All employees" },
  { value: "Department", label: "Department" },
  { value: "Position", label: "Position" },
  { value: "Branch", label: "Branch" },
  { value: "ProjectSite", label: "Project site" },
  { value: "Client", label: "Client" },
  { value: "Section", label: "Section" },
  { value: "EmploymentStatus", label: "Employment status" },
  { value: "Employee", label: "Specific employee" },
];
