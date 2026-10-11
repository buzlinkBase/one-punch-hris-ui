import { describe, expect, it } from "vitest";
import {
  describeAccessChange,
  type AccessSnapshot,
} from "./describe-access-change";

const snapshot = (overrides: Partial<AccessSnapshot>): AccessSnapshot => ({
  tenantId: "t1",
  tenantName: "Acme Corp",
  roles: ["Employee"],
  permissions: ["Employee Self-Service Portal:View"],
  ...overrides,
});

describe("describeAccessChange", () => {
  it("names the company in the title, never 'tenant'", () => {
    const notice = describeAccessChange(
      snapshot({}),
      snapshot({ roles: ["HR"] }),
    );

    expect(notice.title).toBe("Your access in Acme Corp was updated");
    expect(`${notice.title} ${notice.description}`).not.toMatch(/tenant/i);
  });

  it("describes a role swap", () => {
    expect(
      describeAccessChange(snapshot({}), snapshot({ roles: ["HR"] }))
        .description,
    ).toBe(
      "Your role changed from Employee to HR. Your menu has been updated.",
    );
  });

  it("describes roles gained and lost", () => {
    expect(
      describeAccessChange(
        snapshot({}),
        snapshot({ roles: ["Employee", "HR", "Approver"] }),
      ).description,
    ).toBe(
      "You now have the Approver and HR roles. Your menu has been updated.",
    );
    expect(
      describeAccessChange(
        snapshot({ roles: ["Employee", "HR"] }),
        snapshot({ roles: ["Employee"] }),
      ).description,
    ).toBe("You no longer have the HR role. Your menu has been updated.");
  });

  it("names a few changed permissions when only the role itself was edited", () => {
    expect(
      describeAccessChange(
        snapshot({
          roles: ["HR"],
          permissions: ["Leave Analytics:Export", "Leave:View"],
        }),
        snapshot({
          roles: ["HR"],
          permissions: ["Leave:View", "Payroll Analytics:View"],
        }),
      ).description,
    ).toBe(
      "You can now view Payroll Analytics. You can no longer export Leave Analytics. Your menu has been updated.",
    );
  });

  it("counts many changed permissions", () => {
    expect(
      describeAccessChange(
        snapshot({ roles: ["HR"], permissions: ["A:View"] }),
        snapshot({
          roles: ["HR"],
          permissions: ["B:View", "C:View", "D:View"],
        }),
      ).description,
    ).toBe(
      "An admin changed what your HR role can do: 3 permissions added, 1 permission removed. Your menu has been updated.",
    );
  });

  it("says so when the refresh moved the session to another company", () => {
    expect(
      describeAccessChange(
        snapshot({}),
        snapshot({ tenantId: "t2", tenantName: "Home Co", roles: ["Admin"] }),
      ).description,
    ).toBe("You're now working in Home Co. Your menu has been updated.");
  });

  it("just says the menu was refreshed when nothing visible changed", () => {
    expect(describeAccessChange(snapshot({}), snapshot({})).description).toBe(
      "Your menu has been refreshed.",
    );
  });
});
