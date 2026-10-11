export interface EmptyMessage {
  title: string;
  hint: string;
}

export interface EmptyState {
  hasBatches: boolean;
  batchSelected: boolean;
  /** Records loaded for the selected batch, before the status filter. */
  loadedCount: number;
  statusLabel: string;
  statusFiltered: boolean;
}

/**
 * What the Payroll Summary tables say when they have no rows -- tells the user what to do
 * next instead of a bare "No data".
 */
export function getEmptyMessage(state: EmptyState): EmptyMessage {
  if (!state.hasBatches && !state.batchSelected) {
    return {
      title: "No payroll batches in this date range",
      hint: "Try a different date range, or generate a payroll first.",
    };
  }
  if (!state.batchSelected) {
    return {
      title: "Select a payroll batch to view its records",
      hint: "Choose a batch from the list above.",
    };
  }
  if (state.loadedCount > 0 && state.statusFiltered) {
    return {
      title: `No ${state.statusLabel.toLowerCase()} payroll records in this batch`,
      hint: "Try changing the status filter to All.",
    };
  }
  return {
    title: "This payroll batch has no records",
    hint: "Regenerate the payroll or choose another batch.",
  };
}
