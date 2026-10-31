import type { AccountClosureStatus } from "../models/api/response/closure-response.model";

export const CLOSURE_LABEL = {
  LINK_TITLE: "Close my account",
  LINK_TEXT:
    "No longer need One Punch HRIS? You can ask to close your account. Nothing is deleted straight away.",
  LINK_BUTTON: "Close my account…",
  PAGE_TITLE: "Close my account",
  PAGE_SUBTITLE:
    "Ask to close your account. Nothing is deleted straight away, and you can change your mind.",
  OWNERS_ONLY:
    "Only the owner of the account can close it. Ask the account owner to do this.",
  WHAT_HAPPENS_TITLE: "What happens",
  WHAT_HAPPENS: [
    "We email you a link. Nothing happens until you confirm it.",
    "After you confirm, you have a few days to change your mind. You can cancel here or from the email at any time.",
    "Then our team reviews the request. Once approved, your account becomes read-only. You can still view and export your data until the date we tell you.",
    "After that date, your company records are removed from the live system. Records the law requires us to keep are held in a read-only archive, as described in our Terms of Service.",
    "Fees already paid are not refunded.",
    "If you pay for a plan again before the removal date, your account is restored.",
  ],
  EXPORT_HINT:
    "Export what you need first: payroll reports, DTR and employee records are under Reports.",
  COMPANIES: "Companies in this account",
  COMPANY: "Company",
  EMPLOYEES: "Employees",
  CONFIRM_EMAIL: "Type your email to confirm",
  REASON: "Why are you leaving? (optional)",
  EXPORTED: "I have exported everything I need.",
  SUBMIT: "Send me the confirmation email",
  EMAIL_MISMATCH: "That isn't the email you signed in with.",
  REQUESTED: "Check your email. We sent you a link to confirm.",
  CANCEL_REQUEST: "Cancel the request",
  CANCELED: "The request was canceled. Nothing was changed.",
  DECIDED_BY_US: "Our team is reviewing your request.",
  PURGE_ON: "Your company records are removed on",
  REJECTED_PREFIX: "We couldn't close your account yet:",
  LINK_CONFIRM_TITLE: "Confirm closing your account?",
  LINK_CONFIRM_TEXT:
    "You will have a few days to change your mind before our team reviews the request. Nothing is deleted straight away.",
  LINK_CONFIRM_BUTTON: "Yes, confirm",
  LINK_CANCEL_TITLE: "Cancel the closure request?",
  LINK_CANCEL_TEXT:
    "If you didn't ask to close the account, cancel the request. Your account stays as it is.",
  LINK_CANCEL_BUTTON: "Cancel the request",
  LINK_CONFIRMED: "Confirmed. We'll email you what happens next.",
  LINK_CANCELED: "Done. The request was canceled and nothing was changed.",
  LINK_INVALID:
    "This link isn't valid any more. It may have been used, or it expired. If you still want to close your account, sign in and ask again under Billing.",
  LINK_MISSING: "This link is incomplete.",
  GO_TO_SIGN_IN: "Go to sign in",
} as const;

export const CLOSURE_STATUS_LABELS: Record<AccountClosureStatus, string> = {
  PendingConfirmation: "Waiting for your confirmation",
  CoolingOff: "Confirmed. You can still change your mind",
  ReadyForReview: "With our team for review",
  Approved: "Approved",
  Rejected: "Not approved",
  Canceled: "Canceled",
  Expired: "Expired",
};
