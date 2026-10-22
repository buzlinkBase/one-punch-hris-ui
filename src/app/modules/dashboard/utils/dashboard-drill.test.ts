import { describe, expect, it } from "vitest";
import dayjs from "dayjs";
import {
  attendanceDayDrill,
  branchDrill,
  pendingRequestDrill,
  statDrill,
  tenureDrill,
} from "./dashboard-drill";

const TODAY = dayjs("2026-10-22");

describe("dashboard drill targets", () => {
  it("opens today's DTR from the attendance tiles and approved leave from On Leave", () => {
    expect(statDrill("absentToday", TODAY)?.search).toMatchObject({
      fromDate: "2026-10-22",
      toDate: "2026-10-22",
    });
    expect(statDrill("onLeaveToday", TODAY)).toMatchObject({
      to: "/applications/leave",
      search: { from: "2026-10-22", to: "2026-10-22", tab: "processed" },
    });
    expect(statDrill("newHiresThisMonth", TODAY)?.search).toMatchObject({
      hireDateFrom: "2026-10-01",
    });
    expect(statDrill("pendingRequests", TODAY)).toBeNull();
  });

  it("drills a bar only when the API gave it a key", () => {
    expect(
      branchDrill({ label: "Manila", count: 2, key: "b1" })?.search,
    ).toEqual({ drill: 1, statuses: ["Active"], branchIds: ["b1"] });
    expect(branchDrill({ label: "No branch", count: 1, key: null })).toBeNull();
    expect(branchDrill({ label: "Manila", count: 2 })).toBeNull();
  });

  it("turns a tenure band into hire dates", () => {
    expect(
      tenureDrill({ label: "1 to 3 years", count: 1, key: "1-3" }, TODAY)
        ?.search,
    ).toMatchObject({ hireDateFrom: "2023-10-23", hireDateTo: "2025-10-22" });
  });

  it("opens one day of the trend, and nothing without a date", () => {
    expect(attendanceDayDrill("2026-10-20")?.search).toMatchObject({
      fromDate: "2026-10-20",
      toDate: "2026-10-20",
    });
    expect(attendanceDayDrill(undefined)).toBeNull();
  });

  it("opens a pending request's list, but not one the app has no list for", () => {
    const request = {
      id: "1",
      employeeName: "Ana",
      submittedAt: "2026-10-21T00:00:00Z",
      status: "pending" as const,
    };
    expect(pendingRequestDrill({ ...request, type: "overtime" })?.to).toBe(
      "/applications/overtime",
    );
    expect(pendingRequestDrill({ ...request, type: "undertime" })).toBeNull();
  });
});
