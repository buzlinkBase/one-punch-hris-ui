import type { KeyboardEvent } from "react";
import type { DrillAction } from "./use-drill-down";

/** How a figure that drills somewhere looks: a pointer and the primary color on hover. */
export const DRILL_CLASS =
  "cursor-pointer transition-colors hover:border-(--ant-color-primary)!";

/** The same for a row inside a card: a pointer and a light fill on hover. */
export const DRILL_ROW_CLASS =
  "cursor-pointer rounded-md transition-colors hover:bg-(--ant-color-fill-tertiary)";

/** Added to a chart's tooltip when its marks drill somewhere. */
export const DRILL_HINT = "Click to view";

/**
 * Makes a card or row open its drill target by mouse and keyboard (Enter/Space). Nothing at all
 * when there's no action, so a figure the person can't open stays plain.
 */
export function drillProps(action: DrillAction) {
  if (!action) return {};
  return {
    role: "button" as const,
    tabIndex: 0,
    onClick: action,
    onKeyDown: (e: KeyboardEvent) => {
      if (e.key !== "Enter" && e.key !== " ") return;
      e.preventDefault();
      action();
    },
  };
}
