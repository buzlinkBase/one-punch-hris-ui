/** A coworker celebrating today or within the next week who opted in to be greeted. No birth year
 * or age on purpose -- only how many days away it is (0 = today). */
export interface CoworkerBirthdayResponse {
  id: string;
  daysUntil: number;
  fullName: string;
  profileImg: string;
  departmentName: string;
  positionName: string;
}
