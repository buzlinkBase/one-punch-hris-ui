/** What the signed-in user may see of confidential employees (hrms-api GET me/data-access). */
export interface DataAccessResponse {
  /** True when some confidential employees are hidden from this user. */
  restricted: boolean;
  /** Confidential employees missing from pay figures and reports. */
  hiddenEmployeeCount: number;
  /** Partial clearances: day-to-day records / cash bond, allowances and loans. */
  canOperate: boolean;
  canEnter: boolean;
}
