import { describe, expect, it } from "vitest";
import {
  isCompleteRule,
  toPreviewRequest,
  toUpsertRequest,
} from "./announcement.mapper";
import {
  EMPTY_ANNOUNCEMENT_FORM,
  type AnnouncementFormValues,
} from "../models/forms/announcement-form.schema";

const base: AnnouncementFormValues = {
  ...EMPTY_ANNOUNCEMENT_FORM,
  title: "  Office closed  ",
  body: "Closed Friday.\n",
};

describe("toUpsertRequest", () => {
  it("trims the text and keeps the audience rules", () => {
    const request = toUpsertRequest({
      ...base,
      audienceRules: [
        {
          kind: "Department",
          targetId: "dept-1",
          targetValue: null,
          targetLabel: "Operations",
          isExclusion: false,
        },
        {
          kind: "Employee",
          targetId: "emp-9",
          targetValue: null,
          targetLabel: "Ben Tester",
          isExclusion: true,
        },
      ],
    });

    expect(request.title).toBe("Office closed");
    expect(request.body).toBe("Closed Friday.");
    expect(request.audienceRules).toEqual([
      {
        kind: "Department",
        targetId: "dept-1",
        targetValue: null,
        targetLabel: "Operations",
        isExclusion: false,
      },
      {
        kind: "Employee",
        targetId: "emp-9",
        targetValue: null,
        targetLabel: "Ben Tester",
        isExclusion: true,
      },
    ]);
  });

  it("drops dates and flags that don't apply", () => {
    const request = toUpsertRequest({
      ...base,
      requiresAcknowledgement: false,
      acknowledgeByUtc: "2026-10-01T00:00:00.000Z",
      requireReacknowledgement: true,
      isPinned: false,
      pinnedUntilUtc: "2026-10-01T00:00:00.000Z",
    });

    expect(request.acknowledgeByUtc).toBeNull();
    expect(request.requireReacknowledgement).toBe(false);
    expect(request.pinnedUntilUtc).toBeNull();
  });

  it("sends an employment status by name, never a stale target id", () => {
    const request = toUpsertRequest({
      ...base,
      audienceRules: [
        {
          kind: "EmploymentStatus",
          targetId: "left-over",
          targetValue: "Probationary",
          targetLabel: "Probationary",
          isExclusion: false,
        },
      ],
    });

    expect(request.audienceRules[0]).toMatchObject({
      targetId: null,
      targetValue: "Probationary",
    });
  });
});

describe("toPreviewRequest", () => {
  it("leaves out rules that have no target yet", () => {
    const request = toPreviewRequest(
      [
        {
          kind: "AllEmployees",
          targetId: null,
          targetValue: null,
          targetLabel: "",
          isExclusion: false,
        },
        {
          kind: "Department",
          targetId: null,
          targetValue: null,
          targetLabel: "",
          isExclusion: true,
        },
      ],
      true,
    );

    expect(request.audienceRules).toHaveLength(1);
    expect(request.audienceRules[0].targetLabel).toBe("All employees");
    expect(request.excludeInactive).toBe(true);
  });

  it("knows which rules are complete", () => {
    expect(
      isCompleteRule({
        kind: "EmploymentStatus",
        targetId: null,
        targetValue: null,
        targetLabel: "",
        isExclusion: false,
      }),
    ).toBe(false);
    expect(
      isCompleteRule({
        kind: "Branch",
        targetId: "b1",
        targetValue: null,
        targetLabel: "Main",
        isExclusion: false,
      }),
    ).toBe(true);
  });
});
