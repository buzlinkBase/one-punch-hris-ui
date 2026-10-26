import type { HelpArticle } from "../models/help-article.model";

// Anyone who can approve at least one kind of request.
const APPROVE_PERMISSIONS = [
  "Leave:Approve",
  "Overtime:Approve",
  "Official Business:Approve",
  "Pass Slip:Approve",
  "Loan/Deduction:Approve",
  "Profile Update:Approve",
  "DTR Master:Approve",
  "Payroll Run:Approve",
];

export const APPROVER_ARTICLES: HelpArticle[] = [
  {
    id: "approve-requests",
    title: "Approving or declining requests",
    audience: "approver",
    chapter: "Approving",
    summary:
      "Find what's waiting on you, approve or decline it with a note, and follow multi-step approvals.",
    permission: APPROVE_PERMISSIONS,
    sections: [
      {
        heading: "Know when something is waiting",
        steps: [
          {
            text: 'The bell shows a notice when a request is waiting on you, e.g. "Ben Cruz\'s Leave application is waiting on you (step 1 of 2)". Click it to open the request.',
          },
          {
            text: "Notices stay in the bell after you refresh or sign in later, until they expire after 90 days.",
          },
        ],
      },
      {
        heading: "Approve or decline",
        steps: [
          {
            text: "Open the application list (e.g. Applications › Leave). The Pending tab shows what's still waiting.",
            link: { label: "Leave", to: "/applications/leave" },
          },
          {
            text: "Click the ✓ icon on the row to approve, or the ✗ icon to decline.",
          },
          {
            text: "Add a note if asked. A step may require a note, especially for a decline so the applicant knows why. Then confirm.",
          },
        ],
        tips: [
          "Open a request to see Approval Progress: every step, who approved it, when, and their notes.",
          "If you don't see ✓ / ✗, the request isn't at your step yet, or your role can't approve that type.",
        ],
      },
      {
        heading: "Multi-step approvals",
        body: [
          "Some request types need several approvals in order, set up in Approval Workflows. When you approve your step, the next approver is notified and the applicant sees it moved forward. The request is only approved after the last step. A decline at any step ends it.",
          "If an approver is away, an Owner or Admin can reassign the current step to someone else from Approval Progress.",
        ],
      },
    ],
    related: ["approve-batches", "approval-workflows"],
  },
  {
    id: "approve-batches",
    title: "Approving DTR and payroll batches",
    audience: "approver",
    chapter: "Approving",
    summary:
      "Approve the saved DTR for a cutoff and the payroll run computed from it.",
    permission: ["DTR Master:Approve", "Payroll Run:Approve"],
    sections: [
      {
        heading: "DTR batches",
        steps: [
          {
            text: "Open Process DTR › Saved DTR.",
            link: {
              label: "Process DTR",
              to: "/daily-time-record/master",
            },
          },
          {
            text: "Check the batch with View, then use Approve or Decline on its row. History shows earlier actions.",
          },
        ],
      },
      {
        heading: "Payroll runs",
        steps: [
          {
            text: "Open Payroll Run › Saved Payroll Runs.",
            link: {
              label: "Payroll Run",
              to: "/daily-time-record/for-payroll",
            },
          },
          {
            text: "Check it with View in Payroll Summary, then Approve or Decline. Once approved, employees see their payslips.",
          },
        ],
        warning:
          "Deleting an approved batch also needs approval (Approve Deletion / Decline Deletion). A deleted DTR batch can't be used for payroll.",
      },
    ],
    related: ["payroll-cutoff"],
  },
];
