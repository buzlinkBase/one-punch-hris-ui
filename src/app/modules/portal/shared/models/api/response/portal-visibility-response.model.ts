/** Which optional My Pay & Benefits pages the company switched on for the Employee Portal. */
export interface PortalVisibilityResponse {
  showThirteenthMonth: boolean;
  showCashBond: boolean;
  showUniformAllowance: boolean;
}

export type PortalVisibilityKey = keyof PortalVisibilityResponse;
