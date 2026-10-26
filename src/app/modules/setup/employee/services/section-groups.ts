import type { SectionNavGroup } from "@/shared/components/section-nav/section-nav";

/**
 * The employee form's twelve sections, grouped under five headings so the navigation reads as a
 * short outline instead of a row of twelve tabs. Keys match the page's Tabs items.
 */
export const EMPLOYEE_SECTION_GROUPS = [
  { title: "Profile", sections: ["personal"] },
  { title: "Job", sections: ["employment", "fixedSchedule"] },
  { title: "Pay", sections: ["compensation", "govids", "settings"] },
  {
    title: "Background",
    sections: ["dependents", "education", "skills", "employment-history"],
  },
  { title: "Files", sections: ["doc-records", "assets"] },
] as const;

export const EMPLOYEE_SECTION_LABELS: Record<string, string> = {
  personal: "Personal Information",
  employment: "Employment Details",
  fixedSchedule: "Fixed Schedule",
  compensation: "Compensation",
  govids: "Gov't IDs & Rates",
  settings: "Eligibility",
  dependents: "Dependents",
  education: "Education",
  skills: "Skills",
  "employment-history": "Employment History",
  "doc-records": "Documents",
  assets: "Assets",
};

/** Sections that hold their own records, so they can't be used until the employee exists. */
export const RECORD_SECTIONS: readonly string[] = [
  "dependents",
  "education",
  "skills",
  "employment-history",
  "doc-records",
  "assets",
];

interface BuildOptions {
  isEdit: boolean;
  /** Section keys left out entirely (e.g. pay sections when the API hid pay figures). */
  hiddenKeys?: readonly string[];
  errorCounts?: Partial<Record<string, number>>;
}

/** Navigation groups for the current employee, dropping hidden sections and empty groups. */
export function buildSectionNav({
  isEdit,
  hiddenKeys = [],
  errorCounts = {},
}: BuildOptions): SectionNavGroup[] {
  return EMPLOYEE_SECTION_GROUPS.map((group) => ({
    title: group.title,
    items: group.sections
      .filter((key) => !hiddenKeys.includes(key))
      .map((key) => ({
        key,
        label: EMPLOYEE_SECTION_LABELS[key],
        errorCount: errorCounts[key] ?? 0,
        locked: !isEdit && RECORD_SECTIONS.includes(key),
      })),
  })).filter((group) => group.items.length > 0);
}
