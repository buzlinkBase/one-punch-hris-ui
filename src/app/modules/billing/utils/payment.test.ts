import { describe, expect, it } from "vitest";
import type {
  CheckoutResponse,
  PaymentDueResponse,
} from "../models/api/response/subscription-response.model";
import {
  checkoutScreen,
  cycleLabel,
  describeCheckout,
  describeDue,
  onlinePayable,
} from "./payment";

const due: PaymentDueResponse = {
  planCode: "payroll",
  planName: "Payroll",
  billingCycle: "Monthly",
  amount: 4999,
  reason: "PlanChange",
};

function checkout(overrides: Partial<CheckoutResponse> = {}): CheckoutResponse {
  return {
    id: "0199b6c2-0000-7000-8000-000000000001",
    status: "Open",
    planName: "Payroll",
    billingCycle: "Annual",
    amount: 49990,
    currency: "PHP",
    createdAtUtc: "2026-10-08T00:00:00Z",
    paidAtUtc: null,
    paymentMethod: null,
    ...overrides,
  };
}

describe("cycleLabel", () => {
  it("names the billing cycle", () => {
    expect(cycleLabel("Monthly")).toBe("Monthly");
    expect(cycleLabel("Annual")).toBe("Annual");
  });
});

describe("describeDue", () => {
  it("shows the plan, cycle and amount", () => {
    const text = describeDue(due, "PHP");
    expect(text).toContain("Payroll (Monthly)");
    expect(text).toContain("4,999.00");
  });
});

describe("describeCheckout", () => {
  it("names how it was paid, once paid", () => {
    expect(
      describeCheckout(checkout({ status: "Paid", paymentMethod: "GCash" })),
    ).toMatch(/^Payroll \(Annual\): .*49,990\.00 via GCash$/);
  });

  it("leaves the method out while unpaid", () => {
    expect(describeCheckout(checkout())).not.toContain("via");
  });

  it("uses readable names for online methods", () => {
    expect(
      describeCheckout(checkout({ paymentMethod: "OnlineBanking" })),
    ).toContain("via Online banking");
  });
});

describe("onlinePayable", () => {
  it("offers what's due to someone who can pay, when online payment is on", () => {
    expect(
      onlinePayable({ onlinePaymentEnabled: true, paymentDue: due }, true),
    ).toBe(due);
  });

  it("offers nothing when online payment is off", () => {
    expect(
      onlinePayable({ onlinePaymentEnabled: false, paymentDue: due }, true),
    ).toBeNull();
  });

  it("offers nothing to someone without billing rights", () => {
    expect(
      onlinePayable({ onlinePaymentEnabled: true, paymentDue: due }, false),
    ).toBeNull();
  });

  it("offers nothing when nothing is due", () => {
    expect(
      onlinePayable({ onlinePaymentEnabled: true, paymentDue: null }, true),
    ).toBeNull();
  });
});

describe("checkoutScreen", () => {
  const base = {
    checkoutId: "0199b6c2-0000-7000-8000-000000000001",
    isError: false,
    checkout: checkout(),
    canceled: false,
    timedOut: false,
  };

  it("can't show a payment it has no id for, or couldn't load", () => {
    expect(checkoutScreen({ ...base, checkoutId: undefined })).toBe(
      "not-found",
    );
    expect(checkoutScreen({ ...base, isError: true })).toBe("not-found");
  });

  it("confirms while loading and while the payment is still open", () => {
    expect(checkoutScreen({ ...base, checkout: undefined })).toBe("confirming");
    expect(checkoutScreen(base)).toBe("confirming");
  });

  it("shows a paid payment as paid, even if the payer came back by Cancel", () => {
    const paid = checkout({ status: "Paid" });
    expect(checkoutScreen({ ...base, checkout: paid })).toBe("paid");
    expect(checkoutScreen({ ...base, checkout: paid, canceled: true })).toBe(
      "paid",
    );
  });

  it("shows a page that can no longer be paid as closed", () => {
    expect(
      checkoutScreen({ ...base, checkout: checkout({ status: "Expired" }) }),
    ).toBe("closed");
    expect(
      checkoutScreen({ ...base, checkout: checkout({ status: "Failed" }) }),
    ).toBe("closed");
  });

  it("shows an unpaid page the payer backed out of as canceled", () => {
    expect(checkoutScreen({ ...base, canceled: true })).toBe("canceled");
  });

  it("says it's still waiting once it stops checking", () => {
    expect(checkoutScreen({ ...base, timedOut: true })).toBe("waiting");
  });
});
