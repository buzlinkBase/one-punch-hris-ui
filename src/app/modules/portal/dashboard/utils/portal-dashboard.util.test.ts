import dayjs from "dayjs";
import { describe, expect, it } from "vitest";
import type { PortalVisibilityResponse } from "../../shared/models/api/response/portal-visibility-response.model";
import {
  countPending,
  firstVisibleRequestPath,
  monthToDateRange,
  nextWeekRange,
} from "./portal-dashboard.util";

describe("portal dashboard util", () => {
  it("builds the month-to-date range", () => {
    expect(monthToDateRange(dayjs("2026-10-25"))).toEqual({
      from: "2026-10-01",
      to: "2026-10-25",
    });
  });

  it("builds a seven day window starting today", () => {
    expect(nextWeekRange(dayjs("2026-10-25"))).toEqual({
      from: "2026-10-25",
      to: "2026-10-31",
    });
  });

  it("counts only requests waiting for approval", () => {
    expect(
      countPending([
        { approvalStatus: "ForApproval" },
        { approvalStatus: "Approved" },
        { approvalStatus: "ForApproval" },
      ]),
    ).toBe(2);
  });

  describe("firstVisibleRequestPath", () => {
    const off = {
      showLeaveApplications: false,
      showOvertime: false,
      showOfficialBusiness: false,
      showPassSlip: false,
    } as PortalVisibilityResponse;

    it("prefers leave applications while the setting is loading", () => {
      expect(firstVisibleRequestPath(undefined)).toBe(
        "/portal/leave-applications",
      );
    });

    it("skips request pages the company switched off", () => {
      expect(
        firstVisibleRequestPath({
          ...off,
          showOfficialBusiness: true,
        }),
      ).toBe("/portal/official-business");
    });

    it("has no path once every request page is off", () => {
      expect(firstVisibleRequestPath(off)).toBeUndefined();
    });
  });
});
