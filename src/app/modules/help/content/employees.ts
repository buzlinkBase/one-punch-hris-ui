import type { HelpArticle } from "../models/help-article.model";

const PORTAL = "Employee Self-Service Portal:View";

export const EMPLOYEE_ARTICLES: HelpArticle[] = [
  {
    id: "portal-overview",
    title: "My Portal: your own records",
    audience: "employee",
    chapter: "My Portal",
    summary:
      "Your profile, time records, payslips and leave credits, all in one place.",
    permission: PORTAL,
    paths: ["/portal/profile"],
    sections: [
      {
        heading: "What's in My Portal",
        steps: [
          {
            text: "My Profile: your personal and employment details. To change something, submit a profile update request. HR approves it before it changes.",
            link: { label: "My Profile", to: "/portal/profile" },
          },
          {
            text: "My Time: your Daily Time Record, incomplete logs, raw attendance and shift schedule.",
            link: { label: "My Daily Time Record", to: "/portal/dtr" },
          },
          {
            text: "My Pay & Benefits: payslips, leave credits, 13th month pay, deductions and cash bond.",
            link: { label: "My Pay Slips", to: "/portal/payslips" },
          },
          {
            text: "My Applications: file and track leave, overtime, official business, pass slips and loans.",
            link: { label: "Leave", to: "/portal/leave-applications" },
          },
          {
            text: "Announcements: notices from your company. Some ask you to acknowledge; an urgent one must be acknowledged before you continue.",
            link: { label: "Announcements", to: "/portal/announcements" },
          },
          {
            text: "Coworkers: Today (who is in, on leave or celebrating a birthday), the Directory and the Org Chart.",
            link: { label: "Coworkers", to: "/portal/coworkers" },
          },
        ],
      },
    ],
    related: ["portal-time", "portal-pay", "file-request"],
  },
  {
    id: "portal-time",
    title: "Checking your attendance",
    audience: "employee",
    chapter: "My Portal",
    summary:
      "See your time records, fix missing punches and check your schedule.",
    permission: PORTAL,
    paths: [
      "/portal/dtr",
      "/portal/incomplete-punches",
      "/portal/raw-attendance",
      "/portal/shift-schedule",
    ],
    sections: [
      {
        heading: "Steps",
        steps: [
          {
            text: "My Daily Time Record: your computed hours, lates, undertime and overtime per day.",
            link: { label: "My Daily Time Record", to: "/portal/dtr" },
          },
          {
            text: "My Incomplete Logs: days with a missing time-in or time-out. Use File Pass Slip there if you were out on company business.",
            link: {
              label: "My Incomplete Logs",
              to: "/portal/incomplete-punches",
            },
          },
          {
            text: "My Raw Attendance: every punch the biometric device recorded.",
            link: { label: "My Raw Attendance", to: "/portal/raw-attendance" },
          },
          {
            text: "My Shift Schedule: the shift you're scheduled for each day.",
            link: { label: "My Shift Schedule", to: "/portal/shift-schedule" },
          },
        ],
        tips: [
          "Missing punch? Tell HR or file the right request (pass slip, official business) before the cutoff so your pay isn't affected.",
        ],
      },
    ],
    related: ["file-request"],
  },
  {
    id: "portal-pay",
    title: "Payslips, leave credits and benefits",
    audience: "employee",
    chapter: "My Portal",
    summary:
      "View and print payslips and check your leave credits and benefits.",
    permission: PORTAL,
    paths: [
      "/portal/payslips",
      "/portal/leave-credits",
      "/portal/thirteenth-month",
      "/portal/cash-bond",
      "/portal/uniform-allowance",
      "/portal/deductions",
    ],
    sections: [
      {
        heading: "Steps",
        steps: [
          {
            text: "My Deductions: your active loans and deductions with the balance left. Tap a deduction's name to open its ledger: every installment, what is paid, what is next and the running balance. Fully paid or pending loans are not listed.",
            link: { label: "My Deductions", to: "/portal/deductions" },
          },
          {
            text: "My Pay Slips: pick a period and open the payslip. Print opens it as a PDF in a new tab.",
            link: { label: "My Pay Slips", to: "/portal/payslips" },
          },
          {
            text: "My Leave Credits: your remaining balance for each leave type.",
            link: { label: "My Leave Credits", to: "/portal/leave-credits" },
          },
          {
            text: "My 13th Month Pay and My Cash Bond: your accumulated amounts.",
            link: {
              label: "My 13th Month Pay",
              to: "/portal/thirteenth-month",
            },
          },
          {
            text: "My Uniform Allowance: your balance, when the next credit lands, and why a month was skipped (for example, too few present days).",
            link: {
              label: "My Uniform Allowance",
              to: "/portal/uniform-allowance",
            },
          },
        ],
        tips: ["A payslip appears only after that payroll is approved."],
      },
    ],
  },
  {
    id: "file-request",
    title: "Filing leave, overtime, official business, pass slips and loans",
    audience: "employee",
    chapter: "Requests",
    summary:
      "Submit a request, follow its approval, and edit or withdraw it while it's still pending.",
    permission: PORTAL,
    paths: [
      "/portal/leave-applications",
      "/portal/overtime",
      "/portal/official-business",
      "/portal/pass-slip",
      "/portal/loan-applications",
    ],
    sections: [
      {
        heading: "File a request",
        steps: [
          {
            text: "Open the request type under My Applications, e.g. Leave.",
            link: { label: "Leave", to: "/portal/leave-applications" },
          },
          {
            text: "Click the file button: File Leave Application, File Overtime Application, File Official Business, File Pass Slip or Request Loan.",
          },
          {
            text: "Fill in the dates, times and reason, then click Submit Application.",
          },
        ],
        tips: [
          "For leave, check My Leave Credits first so you know how many paid days you have left.",
        ],
      },
      {
        heading: "Attach a document",
        body: [
          "If your company allows it, leave, pass slip and official business forms have an attachment field, for example for a medical certificate. Add up to 5 images or PDFs, each up to 5 MB.",
        ],
      },
      {
        heading: "Follow it",
        steps: [
          {
            text: "The list shows each request's status: Pending until every approver has acted, then Approved or Declined.",
          },
          {
            text: "Open it to see Approval Progress: which step it's on and who approved it.",
          },
          {
            text: "The bell tells you when it moves to the next approver, and when it's approved or declined. Click the notice to open the request.",
          },
        ],
      },
      {
        heading: "Change or withdraw it",
        steps: [
          {
            text: "While it's still pending, use Edit to change it or Withdraw to cancel it.",
          },
        ],
        warning:
          "Once an approver has acted, you can't edit or withdraw it. Ask HR if something needs to change.",
      },
    ],
    related: ["portal-overview"],
  },
];
