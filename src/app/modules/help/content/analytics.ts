import type { HelpArticle } from "../models/help-article.model";

export const ANALYTICS_ARTICLES: HelpArticle[] = [
  {
    id: "analytics",
    title: "Reading Analytics",
    audience: "admin",
    chapter: "Analytics",
    summary:
      "Trends and breakdowns for your workforce, attendance, labor cost and requests, with Excel export.",
    permission: [
      "Workforce Analytics:View",
      "Attendance Analytics:View",
      "Payroll Analytics:View",
      "Request Analytics:View",
    ],
    paths: ["/analytics"],
    sections: [
      {
        heading: "What each page shows",
        steps: [
          {
            text: "Workforce: headcount at each month end, hires, separations, turnover rate and average tenure, plus who's on board by department, branch, status, tenure, age and gender.",
            link: { label: "Workforce", to: "/analytics/workforce" },
          },
          {
            text: "Attendance & Time: attendance rate, late and undertime hours, absences and overtime from approved DTRs, by department, with the 10 most late and most absent.",
            link: { label: "Attendance & Time", to: "/analytics/attendance" },
          },
          {
            text: "Payroll & Labor Cost: gross pay, net pay, the employer's SSS, PhilHealth, Pag-IBIG and EC share, and total labor cost from approved payroll runs, by department and run type.",
            link: {
              label: "Payroll & Labor Cost",
              to: "/analytics/payroll",
            },
          },
          {
            text: "Leave & Requests: how many requests are filed, how many are approved, how long a decision takes, what's still waiting, each approver's response time, and leave days taken by type.",
            link: { label: "Leave & Requests", to: "/analytics/requests" },
          },
        ],
      },
      {
        heading: "Filtering and comparing",
        steps: [
          {
            text: "1. Pick a date range. It opens on the last 12 months, and can cover up to 24 months.",
          },
          {
            text: "2. Narrow it to a department, branch, payroll group or employment status if you like. Clear filters puts everyone back.",
          },
          {
            text: "3. Each headline figure shows its change against the period of the same length just before. Green means better, red means worse, gray is neither.",
          },
          {
            text: "4. Hover a chart for exact values, or switch it to Table.",
          },
        ],
        tips: [
          "The page address keeps your filters, so you can bookmark a view or send the link to a colleague who has the same access.",
          "Export to Excel saves a Summary sheet, the monthly Trend, and one sheet per breakdown.",
        ],
      },
      {
        heading: "Dashboard and drill-down",
        body: [
          "The Dashboard shows today's attendance, headcount by department, branch and project site, length of service, pending requests, upcoming holidays and birthdays, DTR batches and a payroll snapshot.",
          "Click a figure on the Dashboard or on an Analytics page to open the list behind it, already filtered, such as the employees in a department or the pending leave requests. You only see figures that open screens your role can view and your plan includes.",
        ],
      },
      {
        heading: "How the numbers are counted",
        body: [
          "Only approved work counts: draft or declined DTR batches and payroll runs are left out. Payroll is counted by the month each pay period ends; requests by the date they were filed.",
          "Past headcount uses each employee's current department and branch, since earlier moves aren't recorded.",
        ],
        warning:
          "If you can't see confidential employees, they're left out of every figure, and the page says so.",
      },
      {
        heading: "Who can see Analytics",
        body: [
          "The Owner and Admins see all four pages. Anyone else needs the View permission of each page, and Export to download it. Grant these under Security > Roles.",
        ],
      },
    ],
    related: ["payroll-cutoff"],
  },
];
