/**
 * Every feature and limit a subscription plan can grant. Mirrors the backend's
 * Onepunch.Common.Lib.Subscriptions.EntitlementKeys -- keep the two in sync. The UI checks
 * these keys, never a plan's name.
 */
export const FEATURE_KEYS = {
  TIMEKEEPING_CORE: "timekeeping.core",
  TIMEKEEPING_BIOMETRIC: "timekeeping.biometric",
  APPLICATIONS_CORE: "applications.core",
  PORTAL_SELF_SERVICE: "portal.self_service",
  PAYROLL_CORE: "payroll.core",
  PAYROLL_LOANS_INCOME: "payroll.loans_income",
  REPORTS_STATUTORY: "reports.statutory",
  APPROVALS_MULTILEVEL: "approvals.multilevel",
  ANALYTICS: "analytics",
  ANNOUNCEMENTS: "announcements",
  AUDIT_TRAIL: "audit.trail",
  CLIENTS_AGENCY: "clients.agency",
} as const;

export type FeatureKey = (typeof FEATURE_KEYS)[keyof typeof FEATURE_KEYS];

export const LIMIT_KEYS = {
  COMPANIES_MAX: "companies.max",
  EMPLOYEES_MAX: "employees.max",
  ADMINS_MAX: "admins.max",
  BIOMETRIC_DEVICES_MAX: "biometric_devices.max",
} as const;

export type LimitKey = (typeof LIMIT_KEYS)[keyof typeof LIMIT_KEYS];

/** A limit with no maximum. */
export const UNLIMITED = -1;

/** Marks a page every plan includes -- see navigation.const.ts. */
export const BASE_FEATURE = "base";

export type NavFeature = FeatureKey | typeof BASE_FEATURE;

/** ProblemDetails.type values the backend returns (403) when a subscription refuses a request. */
export const SUBSCRIPTION_PROBLEM_TYPES = {
  PLAN_REQUIRED: "plan-required",
  PLAN_LIMIT_REACHED: "plan-limit-reached",
  READ_ONLY: "subscription-read-only",
  /** The owner's plan lapsed and this member isn't the owner or a billing admin. */
  LOCKED: "subscription-locked",
} as const;

export type SubscriptionProblemType =
  (typeof SUBSCRIPTION_PROBLEM_TYPES)[keyof typeof SUBSCRIPTION_PROBLEM_TYPES];

/** Where an entitlement's value came from -- an override is an exception, not an upsell. */
export const ENTITLEMENT_SOURCES = {
  PLAN: "plan",
  ACCOUNT_OVERRIDE: "account-override",
  COMPANY_OVERRIDE: "company-override",
} as const;
