export interface UnregisterEmployeeResponse {
  id: string;
  employeeId: string;
  employeeNo: string;
  employeeName: string;
  department: string;
  position: string;
  biometricId: string | null;
  status: "REGISTERED" | "UNREGISTERED";
  lastActionAt: string;
}
