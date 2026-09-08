// Deliberately separate from the admin CreatePassSlip model — the admin form hardcodes
// destination to "" and stuffs a notes field into purpose (see pass-slip-detail.tsx), so its
// request shape isn't a good fit for a self-service filing that has to state a real
// destination/purpose. Same underlying backend fields, just used honestly here.
export interface PortalCreatePassSlip {
  employeeId: string;
  applicationDate: string;
  departureTime: string;
  returnTime?: string | null;
  destination: string;
  purpose: string;
  remarks: string;
}
