/**
 * Where a Dashboard or Analytics figure drills into: a list screen and the filters to open it
 * with. The screen reads them once on arrival (see useDrillSeed).
 */
export interface DrillTarget {
  to: string;
  search?: Record<string, unknown>;
  /**
   * The permission that opens `to`, for a screen outside the menu (which has none to look up).
   * Menu screens leave it out and use the menu's own permission.
   */
  permission?: string;
}
