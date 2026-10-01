import {
  FEATURE_KEYS,
  LIMIT_KEYS,
} from "@/shared/constants/entitlement-keys.const";
import type { SubscriptionStatus } from "../models/api/response/subscription-response.model";

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
  USAGE_HINT: "Limits apply to each company separately.",
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
  CURRENT: "Current plan",
  SELECT: "Choose",
  UNLIMITED: "Unlimited",
  UNKNOWN: "--",
  PAYMENT_INSTRUCTIONS_TITLE: "How to pay",
  CONTACT_ADMIN:
    "Your company's subscription needs attention. Contact your company admin.",
  NOT_IN_SUBSCRIPTION: "Not included in your subscription. Contact support.",
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
  [FEATURE_KEYS.TIMEKEEPING_BIOMETRIC]: "Biometric devices",
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
};

export const LIMIT_LABELS: Record<string, string> = {
  [LIMIT_KEYS.COMPANIES_MAX]: "Companies",
  [LIMIT_KEYS.EMPLOYEES_MAX]: "Active employees per company",
  [LIMIT_KEYS.ADMINS_MAX]: "Admin users per company",
  [LIMIT_KEYS.BIOMETRIC_DEVICES_MAX]: "Biometric devices per company",
};

/** Short names for the usage table's columns. */
export const LIMIT_SHORT_LABELS: Record<string, string> = {
  [LIMIT_KEYS.EMPLOYEES_MAX]: "Employees",
  [LIMIT_KEYS.ADMINS_MAX]: "Admin users",
  [LIMIT_KEYS.BIOMETRIC_DEVICES_MAX]: "Devices",
};

export const SUPPORT_TIER_LABELS: Record<string, string> = {
  email: "Email support",
  priority: "Priority support",
};
