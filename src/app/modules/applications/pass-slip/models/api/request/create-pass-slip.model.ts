export interface CreatePassSlip {
  employeeId: string;
  applicationDate: string;
  departureTime: string;
  returnTime?: string;
  destination: string;
  purpose: string;
  remarks?: string;
  /** Files the form uploaded before the pass slip existed; the server attaches them on save. */
  attachmentIds?: string[];
}
