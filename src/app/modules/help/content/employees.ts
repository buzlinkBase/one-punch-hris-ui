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
    purpose: [
      "My Portal is your own HR self-service. Instead of asking HR, you check your attendance, payslips and leave credits and file your own requests.",
      "Example: wondering why your pay was lower? Open My Daily Time Record to see lates and absences, then My Payslips to see the deductions.",
    ],
    permission: PORTAL,
    paths: ["/portal/profile", "/portal/dashboard"],
    sections: [
      {
        heading: "What's in My Portal",
        steps: [
          {
            text: "My Dashboard: your remaining leaves, 13th month pay, cash bond, upcoming schedule, incomplete logs this month, loan balance, pending requests and latest announcements at a glance. Click a card to open its full page.",
            link: { label: "My Dashboard", to: "/portal/dashboard" },
          },
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
            link: { label: "My Payslips", to: "/portal/payslips" },
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
            text: "Coworkers: Today (birthdays from a week ahead, new teammates hired in the last 7 days, work anniversaries and who is out), the Directory (search by name or position, filter by department, email or call coworkers who shared their contact details) and the Org Chart (a tree of the company, its departments and sections, and who reports to whom, with pan and zoom, collapsible branches, search, and Find me to jump to your own spot).",
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
    purpose: [
      "Your pay is based on these records, so check them each cutoff while there is still time to fix anything.",
      "Example: your DTR for Oct 21 shows 8:02 time-in but no time-out. Open My Incomplete Logs and file a pass slip, or tell HR, before the cutoff closes.",
    ],
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
            text: "My Incomplete Logs: days with a missing time-in or time-out. Use New Pass Slip there if you were out on company business.",
            link: {
              label: "My Incomplete Logs",
              to: "/portal/incomplete-punches",
            },
          },
          {
            text: "My Attendance Logs: every punch the biometric device recorded.",
            link: { label: "My Attendance Logs", to: "/portal/raw-attendance" },
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
    purpose: [
      "A payslip is the breakdown of your pay: what you earned and what was deducted. Here you can also see how many leave days you have left and track loans, cash bond and 13th month.",
      "Sample payslip: Basic ₱10,400 + overtime ₱187.50 = gross ₱10,587.50; minus SSS, PhilHealth, Pag-IBIG and a loan payment = net pay ₱9,162.50.",
    ],
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
            text: "My Payslips: pick a period and open the payslip. Print opens it as a PDF in a new tab.",
            link: { label: "My Payslips", to: "/portal/payslips" },
          },
          {
            text: "My Leave Credits: your remaining balance for each leave type.",
            link: { label: "My Leave Credits", to: "/portal/leave-credits" },
          },
          {
            text: "My 13th Month Pay and My Cash Bond: your accumulated amounts. Your company can hide any My Portal page except My Dashboard and My Profile (for example these two, My Uniform Allowance, My Payslips or the application pages), so you may not see all of them.",
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
    purpose: [
      "Leave, overtime, official business, pass slips and loans only count after they are approved, so file them through the system rather than by message.",
      "Example: file a one-day vacation leave on Nov 3 with the reason 'family event'. It goes to your approver, you get a bell notice when it is approved, and your leave credit goes down by one day.",
    ],
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
            text: "Click the file button: New Leave Request, New Overtime Request, New Official Business, New Pass Slip or Request Loan.",
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
