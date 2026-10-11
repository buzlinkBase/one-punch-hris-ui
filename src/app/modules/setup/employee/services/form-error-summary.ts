import type { FieldErrors, FieldValues } from "react-hook-form";
import {
  EMPLOYEE_FIELD_SECTIONS,
  EMPLOYEE_FORM_TABS,
  type EmployeeFormTab,
} from "../constants/form-sections.const";

export interface FormErrorItem {
  /** The full field path, e.g. "email" or "sssRate.eE" -- what setFocus takes. */
  name: string;
  tab: EmployeeFormTab | null;
  tabLabel: string | null;
  label: string;
  message: string;
}

const FIELD_ORDER = Object.keys(EMPLOYEE_FIELD_SECTIONS);
const TAB_ORDER: readonly string[] = EMPLOYEE_FORM_TABS.map((t) => t.key);

/** "dailyRateMode" -> "Daily Rate Mode", for a field missing from the map. */
function readable(name: string): string {
  const spaced = name.replace(/([a-z0-9])([A-Z])/g, "$1 $2");
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

// react-hook-form nests errors like its values: { sssRate: { eE: { message } } }. A leaf is
// anything carrying a message (or a type, for a message-less rule).
function flatten(
  errors: Record<string, unknown>,
  prefix: string,
  out: { name: string; message: string }[],
) {
  for (const [key, value] of Object.entries(errors)) {
    if (!value || typeof value !== "object" || key === "ref") continue;
    const name = prefix ? `${prefix}.${key}` : key;
    const error = value as { message?: unknown; type?: unknown };
    if (typeof error.message === "string" || typeof error.type === "string") {
      out.push({
        name,
        message:
          typeof error.message === "string" && error.message
            ? error.message
            : "This value isn't valid.",
      });
    } else {
      flatten(value as Record<string, unknown>, name, out);
    }
  }
}

/**
 * Every invalid field with where it lives and what's wrong -- in tab order, then screen order --
 * so the page can list them and open the first one.
 */
export function summarizeFormErrors<T extends FieldValues>(
  errors: FieldErrors<T>,
): FormErrorItem[] {
  const flat: { name: string; message: string }[] = [];
  flatten(errors as Record<string, unknown>, "", flat);

  const items = flat.map(({ name, message }): FormErrorItem => {
    const top = name.split(".")[0];
    const section = EMPLOYEE_FIELD_SECTIONS[top];
    const tabLabel =
      EMPLOYEE_FORM_TABS.find((t) => t.key === section?.tab)?.label ?? null;
    // "sssRate.eE" -> "SSS Rate (EE)": short parts are abbreviations (EE, ER, EC).
    const nested = name.includes(".")
      ? ` (${name
          .split(".")
          .slice(1)
          .map((part) =>
            part.length <= 3 ? part.toUpperCase() : readable(part),
          )
          .join(" ")})`
      : "";
    return {
      name,
      tab: section?.tab ?? null,
      tabLabel,
      label: (section?.label ?? readable(top)) + nested,
      message,
    };
  });

  const rank = (item: FormErrorItem) => {
    const tab = item.tab ? TAB_ORDER.indexOf(item.tab) : TAB_ORDER.length;
    const field = FIELD_ORDER.indexOf(item.name.split(".")[0]);
    return tab * 1000 + (field < 0 ? 999 : field);
  };
  return items.sort((a, b) => rank(a) - rank(b));
}

/** How many invalid fields each tab has, for the badges on the tab titles. */
export function errorCountByTab(
  items: FormErrorItem[],
): Partial<Record<EmployeeFormTab, number>> {
  const counts: Partial<Record<EmployeeFormTab, number>> = {};
  for (const item of items) {
    if (item.tab) counts[item.tab] = (counts[item.tab] ?? 0) + 1;
  }
  return counts;
}
