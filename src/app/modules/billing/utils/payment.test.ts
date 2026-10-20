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
  paymentDueAmounts,
} from "./payment";

const due: PaymentDueResponse = {
  planCode: "payroll",
  planName: "Payroll",
  billingCycle: "Monthly",
  amount: 4999,
  reason: "PlanChange",
  creditAmount: 0,
  unusedDays: 0,
};

function checkout(overrides: Partial<CheckoutResponse> = {}): CheckoutResponse {
  return {
    id: "0199b6c2-0000-7000-8000-000000000001",
    status: "Open",
    kind: "Plan",
    planName: "Payroll",
    billingCycle: "Annual",
    amount: 49990,
    currency: "PHP",
    createdAtUtc: "2026-10-08T00:00:00Z",
    paidAtUtc: null,
    paymentMethod: null,
    autoRenew: false,
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

  it("never mentions storage -- it is billed on its own", () => {
    expect(describeDue(due, "PHP")).not.toContain("storage");
  });

  it("says how much an upgrade's credit took off", () => {
    const text = describeDue(
      { ...due, amount: 7418.87, creditAmount: 2580.13, unusedDays: 16 },
      "PHP",
    );
    expect(text).toContain("7,418.87");
    expect(text).toContain("after");
    expect(text).toContain("2,580.13 credit");
  });

  it("stays quiet about credit when there is none", () => {
    expect(describeDue(due, "PHP")).not.toContain("credit");
  });
});

describe("paymentDueAmounts", () => {
  it("shows an upgrade's plan at its full price, with the credit apart", () => {
    expect(
      paymentDueAmounts({
        ...due,
        amount: 7418.87,
        creditAmount: 2580.13,
        unusedDays: 16,
      }),
    ).toEqual({ plan: 9999, credit: 2580.13, total: 7418.87 });
  });

  it("keeps the full amount as the plan charge when there is no credit", () => {
    expect(paymentDueAmounts(due)).toEqual({
      plan: 4999,
      credit: 0,
      total: 4999,
    });
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

  it("describes a storage purchase by what was bought, with no billing cycle", () => {
    const text = describeCheckout(
      checkout({
        kind: "StorageAddOn",
        planName: "2 x 50 GB storage block",
        amount: 400,
        paymentMethod: "GCash",
      }),
    );
    expect(text).toMatch(/^2 x 50 GB storage block: .*400\.00 via GCash$/);
  });

  it("describes a storage renewal by its own name, which already says the cycle", () => {
    const text = describeCheckout(
      checkout({
        kind: "StorageRenewal",
        planName: "Storage renewal (monthly), 2 blocks",
        billingCycle: "Monthly",
        amount: 800,
      }),
    );
    expect(text).toMatch(/^Storage renewal \(monthly\), 2 blocks: .*800\.00$/);
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
