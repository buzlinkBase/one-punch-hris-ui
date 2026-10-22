import {
  APPLICATION_DRILL_KEYS,
  DTR_DRILL_KEYS,
  EMPLOYEE_DRILL_KEYS,
  readApplicationDrill,
  readDtrDrill,
  readEmployeeDrill,
} from "./drill-screens";
import { useDrillSeed } from "./use-drill-seed";

/** The employee list's drill-down filters, or null when it was opened normally. */
export function useEmployeeDrill() {
  return readEmployeeDrill(useDrillSeed(EMPLOYEE_DRILL_KEYS));
}

/** The DTR screen's drill-down range and scope, or null when it was opened normally. */
export function useDtrDrill() {
  return readDtrDrill(useDrillSeed(DTR_DRILL_KEYS));
}

/** A request list's drill-down date range and approval tab (both optional). */
export function useApplicationDrill() {
  return readApplicationDrill(useDrillSeed(APPLICATION_DRILL_KEYS));
}
