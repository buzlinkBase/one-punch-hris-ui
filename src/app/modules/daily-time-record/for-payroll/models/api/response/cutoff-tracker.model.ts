// Cutoff Tracker -- see hrms-api's CutoffTrackerResult / PayrollsController.CutoffTracker. Per
// employee, the days worked for each client in the cutoff and which saved run carries their
// deductions (government contributions, tax, loans, general other income).
export interface CutoffTrackerClientDays {
  // null = days with no client stamped.
  clientId: string | null;
  // Days actually worked, any DTR status.
  workedDays: number;
  // Approved days no run has paid yet.
  unpaidApprovedDays: number;
  // Days already paid by a saved run.
  paidDays: number;
}

export interface CutoffTrackerCarrier {
  payrollBatchId: string;
  clientId?: string | null;
  periodStart: string;
  periodEnd: string;
  payDate?: string | null;
  remarks?: string | null;
}

export interface CutoffTrackerEmployee {
  employeeId: string;
  employeeNo?: string | null;
  fullName?: string | null;
  // The client on the employee's own record.
  homeClientId?: string | null;
  clients: CutoffTrackerClientDays[];
  // null = no saved run has taken this cutoff's deductions yet.
  carrier?: CutoffTrackerCarrier | null;
}

export interface CutoffTrackerResult {
  // "EveryRun" means the company doesn't gate deductions, so there is nothing to track.
  mode: string;
  employees: CutoffTrackerEmployee[];
}
