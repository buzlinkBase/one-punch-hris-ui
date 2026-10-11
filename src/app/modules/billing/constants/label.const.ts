import {
  FEATURE_KEYS,
  LIMIT_KEYS,
} from "@/shared/constants/entitlement-keys.const";
import type {
  PaymentDueReason,
  PaymentMethod,
  SubscriptionStatus,
} from "../models/api/response/subscription-response.model";

export const BILLING_LABEL = {
  TITLE: "Billing",
  SUBTITLE: "Your plan, what it includes, and your payments.",
  PLANS_TITLE: "Choose a plan",
  PLANS_SUBTITLE:
    "One price per plan for your whole account -- not per employee.",
  CURRENT_PLAN: "Current plan",
  STATUS: "Status",
  BILLING_CYCLE: "Billing",
  PERIOD_ENDS: "Current period ends",
  TRIAL_ENDS: "Trial ends",
  NEXT_AMOUNT: "Next payment",
  CHANGE_PLAN: "Change plan",
  CHOOSE_PLAN: "Choose a plan",
  CANCEL_SUBSCRIPTION: "Cancel subscription",
  RESUME_SUBSCRIPTION: "Keep my subscription",
  WITHDRAW_CHANGE: "Withdraw change",
  USAGE: "Usage",
  USAGE_HINT:
    "Employees are counted across all your companies together; admin users and biometric devices are limited per company.",
  COMPANIES: "Companies",
  PAYMENTS: "Payments",
  NO_PAYMENTS: "No payments recorded yet.",
  MONTHLY: "Monthly",
  ANNUAL: "Annual",
  ANNUAL_SAVING: "2 months free",
  PER_MONTH: "/ month",
  PER_YEAR: "/ year",
  VAT_INCLUSIVE: "Prices include 12% VAT.",
  VAT_EXCLUSIVE: "Prices exclude 12% VAT.",
  RECOMMENDED: "Recommended",
  BEST_FIT: "Best fit for you",
  OFFERED_TO_YOU: "Offered to you",
  CURRENT: "Current plan",
  SELECT: "Choose",
  UNLIMITED: "Unlimited",
  STORAGE_PAYMENT: "Storage",
  STORAGE_PACKAGE: "Storage package",
  STORAGE_PACKAGE_NOTE: "Included in plan, shared by all your companies",
  UNKNOWN: "--",
  PAYMENT_INSTRUCTIONS_TITLE: "How to pay",
  PAY: "Pay",
  PAY_LATER: "Pay later",
  PAY_ONLINE_HINT:
    "Pay online -- your plan is activated as soon as the payment goes through.",
  PAY_OTHER_WAYS: "Or pay by bank transfer:",
  CONTACT_ADMIN:
    "Your company's subscription needs attention. Contact your company admin.",
  NOT_IN_SUBSCRIPTION: "Not included in your subscription. Contact support.",
};

export const PAYMENT_DUE_TITLES: Record<PaymentDueReason, string> = {
  PlanChange: "Payment due for your new plan",
  Renewal: "Renew your plan",
  Reactivation: "Reactivate your plan",
};

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  BankTransfer: "Bank transfer",
  Cash: "Cash",
  Check: "Check",
  GCash: "GCash",
  Maya: "Maya",
  Card: "Card",
  Other: "Other",
  QrPh: "QR Ph",
  GrabPay: "GrabPay",
  ShopeePay: "ShopeePay",
  OnlineBanking: "Online banking",
  BillEase: "BillEase",
};

/** The return screen after the payment page (/billing/payment). */
export const PAYMENT_RESULT_LABEL = {
  CONFIRMING: "Confirming your payment...",
  CONFIRMING_HINT:
    "This usually takes a few seconds. Please keep this page open.",
  PAID: "Payment received",
  PAID_HINT: "Your plan is active. A receipt was sent to your email.",
  CANCELED: "Payment canceled",
  CANCELED_HINT:
    "Nothing was charged. You can pay any time from the Billing page.",
  CLOSED: "This payment page has closed",
  CLOSED_HINT:
    "Nothing was charged on it. Start the payment again from the Billing page.",
  WAITING: "Still waiting for confirmation",
  WAITING_HINT:
    "If you completed the payment, it will show on the Billing page within a few minutes.",
  NOT_FOUND: "We couldn't find this payment",
  NOT_FOUND_HINT: "Check the Billing page for your latest payments.",
  CHECK_AGAIN: "Check again",
  GO_TO_BILLING: "Go to billing",
};

export const STATUS_LABELS: Record<SubscriptionStatus, string> = {
  Trialing: "Free trial",
  Active: "Active",
  PastDue: "Payment overdue",
  Suspended: "Suspended",
  Expired: "Trial ended",
  Canceled: "Canceled",
  None: "No plan",
  Unrestricted: "Active",
  Unowned: "Active",
  Unavailable: "Active",
  Provisioning: "Setting up",
  Invalid: "Closed",
};

export const STATUS_COLORS: Record<SubscriptionStatus, string> = {
  Trialing: "processing",
  Active: "success",
  PastDue: "warning",
  Suspended: "error",
  Expired: "error",
  Canceled: "default",
  None: "default",
  Unrestricted: "success",
  Unowned: "success",
  Unavailable: "success",
  Provisioning: "processing",
  Invalid: "error",
};

/** Plain-language names for each feature, shown on plan cards and lock tooltips. */
export const FEATURE_LABELS: Record<string, string> = {
  [FEATURE_KEYS.TIMEKEEPING_CORE]: "Attendance, schedules & DTR",
  [FEATURE_KEYS.TIMEKEEPING_BIOMETRIC]: "Biometric auto sync",
  [FEATURE_KEYS.APPLICATIONS_CORE]: "Leave, overtime & other applications",
  [FEATURE_KEYS.PORTAL_SELF_SERVICE]: "Employee self-service portal",
  [FEATURE_KEYS.PAYROLL_CORE]: "Payroll, payslips & 13th month",
  [FEATURE_KEYS.PAYROLL_LOANS_INCOME]: "Loans, deductions & other income",
  [FEATURE_KEYS.REPORTS_STATUTORY]: "SSS, PhilHealth, Pag-IBIG & BIR reports",
  [FEATURE_KEYS.APPROVALS_MULTILEVEL]: "Multi-level approvals",
  [FEATURE_KEYS.ANALYTICS]: "Analytics",
  [FEATURE_KEYS.ANNOUNCEMENTS]: "Company announcements",
  [FEATURE_KEYS.AUDIT_TRAIL]: "Audit trail",
  [FEATURE_KEYS.CLIENTS_AGENCY]: "Clients & cost reports",
  [FEATURE_KEYS.TIMEKEEPING_MOBILE]: "Onepunch Mobile Attendance",
  [FEATURE_KEYS.PATROL_APP]: "One Patrol App",
};

export const LIMIT_LABELS: Record<string, string> = {
  [LIMIT_KEYS.COMPANIES_MAX]: "Companies",
  [LIMIT_KEYS.EMPLOYEES_MAX]: "Active employees (shared by all your companies)",
  [LIMIT_KEYS.ADMINS_MAX]: "Admin users per company",
  [LIMIT_KEYS.BIOMETRIC_DEVICES_MAX]: "Biometric devices per company",
  [LIMIT_KEYS.STORAGE_MAX_MB]: "File storage (shared by all your companies)",
};

/** Short names for the usage table's columns. */
export const LIMIT_SHORT_LABELS: Record<string, string> = {
  [LIMIT_KEYS.EMPLOYEES_MAX]: "Employees",
  [LIMIT_KEYS.ADMINS_MAX]: "Admin users",
  [LIMIT_KEYS.BIOMETRIC_DEVICES_MAX]: "Devices",
};

export const STORAGE_LABEL = {
  TITLE: "Storage",
  SUBTITLE:
    "File storage for your account, shared by all your companies: your plan's capacity plus any storage blocks you add.",
  BY_COMPANY: "Used by company",
  BASE_PLAN: "Plan storage",
  ADD_ONS: "Storage add-ons",
  TOTAL: "Total storage",
  NO_ADD_ONS: "No storage blocks yet.",
  UPGRADE: "Upgrade storage",
  FULL_TITLE: "Storage is full",
  BUY: "Add storage",
  REDUCE_TIP:
    "Keep fewer blocks. Nothing changes today: you keep the storage you paid for until this period ends.",
  UNKNOWN_USAGE: "Usage can't be shown right now.",
  FREE_GRANT: "Included at no charge",
  REDUCE: "Reduce",
  WITHDRAW_REDUCTION: "Keep these blocks",
  BILLING_SUMMARY: "Billing",
  PLAN_LINE: "Plan",
  ADD_ONS_LINE: "Storage add-ons",
  TOTAL_LINE: "Total",
  BUY_TITLE: "Add storage",
  BUY_BLOCK: "Storage block",
  BUY_QUANTITY: "Number of blocks",
  BUY_PRORATED: "Due today (prorated)",
  BUY_PRORATED_HINT:
    "You pay only for the days left in your current billing period. From your next renewal the blocks are billed with your plan, at the monthly or annual block price to match your billing cycle.",
  BUY_NEW_RECURRING: "Storage add-ons from your next renewal",
  UNIT_COST: "Unit cost",
  CYCLE_TOTAL_MONTHLY: "Monthly",
  CYCLE_TOTAL_ANNUAL: "Yearly",
  BUY_NEW_LIMIT: "Your storage after payment",
  BUY_CONFIRM: "Pay",
  BUY_UNAVAILABLE:
    "Storage can be added once your plan is paid and running. Choose or renew a plan first.",
  NO_OFFERINGS: "No storage blocks are available to your account right now.",
  REDUCE_TITLE: "Reduce storage blocks",
  REDUCE_HINT:
    "The change takes effect at the end of your current billing period. Until then you keep the storage you paid for.",
  REDUCE_OVER_LIMIT:
    "You're using more than your storage will be after the reduction. Free up space before your renewal date, or uploads will be blocked.",
  REDUCE_PENDING: "Reduces to {blocks} on {date}",
  BANNER_WARNING: "Your storage is {percent}% full.",
  BANNER_CRITICAL:
    "Your storage is almost full ({percent}% used). Uploads will be blocked when it runs out.",
  BANNER_ADMIN_HINT:
    "Ask your company's owner or billing admin to add storage.",
  PAID_HINT: "Your extra storage is active now.",
};

export const SUPPORT_TIER_LABELS: Record<string, string> = {
  email: "Email support",
  priority: "Priority support",
};
