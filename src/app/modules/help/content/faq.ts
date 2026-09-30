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
        heading: "I don't get notifications",
        body: [
          "Open My Profile and check Notification Preferences. Push must be on for the request types you want in the bell.",
        ],
      },
    ],
    related: ["sign-in", "change-password"],
  },
];
