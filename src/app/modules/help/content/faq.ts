import type { HelpArticle } from "../models/help-article.model";

export const FAQ_ARTICLES: HelpArticle[] = [
  {
    id: "faq",
    title: "Troubleshooting and common questions",
    audience: "start",
    chapter: "Troubleshooting",
    summary:
      "Sign-in problems, missing menus, missing employees in reports and other common issues.",
    sections: [
      {
        heading: "I can't sign in",
        body: [
          "Check your email and password. After 5 wrong attempts your account is locked for 5 minutes.",
          '"Too many requests. Please wait … seconds" means there were many attempts from your network in a short time. Wait for the time shown, then try again.',
          'Forgot your password? Use "Forgot password?" on the sign-in page.',
        ],
      },
      {
        heading: "A menu item or button is missing",
        body: [
          "The menu and buttons only show what your role is allowed to do. Ask your company admin to check your role in Security › Roles.",
        ],
      },
      {
        heading: "A report says confidential employees are excluded",
        body: [
          "Some employees are marked Confidential and hidden from roles without access to them, so the totals you see leave them out. Ask someone with confidential access to produce the report you submit.",
        ],
      },
      {
        heading: "My hours or pay look wrong",
        body: [
          "Check My Incomplete Logs for missing punches and make sure your leave, overtime and other requests were approved before the cutoff. Then contact HR. They can fix the attendance and recompute.",
        ],
      },
      {
        heading: "My invitation link doesn't work",
        body: [
          "Invitation links expire after 7 days and only work for the email they were sent to. Ask whoever invited you to send a new one.",
        ],
      },
      {
        heading:
          "Every menu item shows a lock and pages say they aren't included",
        body: [
          "Your company's plan doesn't include the HRMS system (or it was switched off). Every HRMS page is locked, even for the Owner, and the system refuses the actions behind them. Billing stays open so you can review or change the plan.",
          "Ask your company's owner or billing admin to open Billing and choose a plan that includes HRMS.",
        ],
        warning:
          "Biometric devices keep sending punches while HRMS is off, but the system discards them. Once HRMS is back on, they don't come back automatically, but you can upload those logs manually in Upload Attendance.",
      },
      {
        heading: "My changes aren't saving and a banner says read-only",
        body: [
          "Your company's trial ended or a payment is overdue, so it is in read-only mode. You can still view and export your data. Ask your company's owner or billing admin to open Billing and pay or renew.",
        ],
      },
      {
        heading: "I can't upload a photo or file",
        body: [
          "Your company's storage may be full. An owner or admin can free space or add storage in Security › Storage. Files can be PNG, JPG, WebP or PDF up to 5 MB, and the feature must have attachments switched on in Company Settings.",
        ],
      },
      {
        heading: "I don't get notifications",
        body: [
          "Open My Profile and check Notification Preferences. Push must be on for the request types you want in the bell.",
        ],
      },
    ],
    related: ["sign-in", "change-password"],
  },
];
