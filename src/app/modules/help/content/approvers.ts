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
    purpose: [
      "Employees' leave, overtime and other requests only count once approved. As an approver you are the check that the request is legitimate before it affects attendance or pay.",
      "Example: Ben files 2 days of vacation leave. His supervisor approves at step 1, HR approves at step 2, and only then are the days deducted from his credits.",
    ],
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
        heading: "My Approvals: everything waiting on you in one place",
        steps: [
          {
            text: "Open My Approvals (under My Portal). The For Approval tab lists every request whose current step is yours, including the ones you cover for someone who is away. Each row shows the applicant, a short summary, when it was filed, its step and who it is pending with.",
            link: { label: "My Approvals", to: "/portal/approvals" },
          },
          {
            text: "Click Approve or Decline on the row. Add a note if asked, then confirm.",
          },
          {
            text: "The In Progress tab lists requests still with another approver. These are ones that will reach your step later, or ones you already approved, so only requests you take part in as an approver. Owners and Admins see every request still in flight. Everyone else can see the full list of a type on its own page under Applications. It's view only. A request moves to For Approval once it reaches your step.",
          },
        ],
        tips: [
          "A request on a later step doesn't appear under For Approval until the steps before it are approved.",
          'A purple "For <name>" tag means you are acting for someone who delegated their approvals to you. The request\'s Approval Progress then reads "Approved by you on behalf of <name>".',
          "My Approvals works even if your account only has the Employee role.",
          "Once a request is fully decided it leaves For Approval and In Progress. Find it under the History tab, which lists the requests you approved or declined (including ones you decided for someone else, or that your delegate decided for you), with how each one ended up. It opens on This month; use the quick date buttons (Current cutoff, Last month, Last 3 months, This year) or the date range to look further back.",
          "If you hold an Approve permission you also find the same page as Approvals under Applications in the main menu, so you don't have to go through My Portal.",
        ],
      },
      {
        heading: "Going away? Let someone approve for you",
        steps: [
          {
            text: "In My Approvals, click While I'm away. Or open your profile, find While I'm away, then click Delegate.",
            link: { label: "My Profile", to: "/profile" },
          },
          {
            text: "Choose who approves for you, which requests (or all), and the dates. Leave the dates empty to keep it on until you switch it off.",
          },
          {
            text: "Optionally turn on Only while on approved leave: it then switches on by itself on the days you have an approved leave.",
          },
        ],
        tips: [
          "The person you choose needs a login. They are notified of your requests too, and can approve or decline them in My Approvals -- they don't need the Approve permission for that.",
          "A request that was already decided -- by you or by them -- can't be decided twice. When a step needs several approvals, you and your delegate count as one.",
          "Switch it off any time from the same card. An Owner or Admin can also set one up for you under Setup › Approvals › Delegations.",
        ],
      },
      {
        heading: "Approve or decline",
        steps: [
          {
            text: "Open the application list (e.g. Applications › Time & Leave › Leave). The Pending tab shows what's still waiting.",
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
          "If an approver is away, an Owner or Admin can reassign the current step to someone else from Approval Progress. On the Approvals page, click the Status of a request in For Approval or In Progress to open it. An Owner or Admin can also approve or decline any step, even if they are not a member of the approver group or quorum for it. That counts as an override: it completes the whole step no matter how many approvals the step asks for, and the timeline marks it as an Owner override. Anyone else who isn't the approver gets a message naming who the request is waiting on.",
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
    purpose: [
      "A DTR batch is a whole cutoff's attendance for a payroll group, and a payroll run is the pay computed from it. Approving them is the last check before money is paid, so approvers look for anything unusual.",
      "Before approving a DTR, check: no unexpected absences, lates or overtime spikes, and every employee of the group is present. Before approving payroll, check: totals look reasonable compared with the last cutoff, no negative net pay and no missing employees.",
    ],
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
        example: {
          title: "Sample review before approving payroll",
          lines: [
            "Last cutoff: 48 employees, net pay ₱412,300. This cutoff: 48 employees, net pay ₱418,900. About the same, so nothing odd.",
            "One employee shows net pay ₱0 because deductions equal earnings. Ask HR before approving.",
            "Decline with a note such as 'Please recheck Maria's loan deduction' so HR knows what to fix.",
          ],
        },
      },
    ],
    related: ["payroll-cutoff"],
  },
];
