import type { HelpArticle } from "../models/help-article.model";

export const HR_PAYROLL_ARTICLES: HelpArticle[] = [
  {
    id: "payroll-cutoff",
    title: "The payroll cutoff, end to end",
    audience: "hr",
    chapter: "Payroll cutoff",
    summary:
      "Everything from raw attendance to released payslips and remittances for one cutoff, in order.",
    permission: ["DTR Master:View", "Payroll Run:View"],
    sections: [
      {
        heading: "Overview",
        body: [
          "Each cutoff follows the same path: get the attendance in, fix gaps, make sure requests are approved, calculate the DTR and get it approved, run payroll and get that approved, then release payslips and file remittances. Each step below links to its own guide.",
        ],
      },
      {
        heading: "The steps",
        steps: [
          {
            text: "1. Bring in attendance: devices send punches automatically, or upload a device file.",
            link: {
              label: "Upload Attendance",
              to: "/timekeeping/upload-attendance",
            },
          },
          {
            text: "2. Tag punches with an unknown Bio ID to their employee.",
            link: {
              label: "Unregistered Employees",
              to: "/timekeeping/unregistered-employees",
            },
          },
          {
            text: "3. Fix missing time-ins and time-outs.",
            link: {
              label: "Incomplete Logs",
              to: "/timekeeping/incomplete-punches",
            },
          },
          {
            text: "4. Apply schedule changes (rotations, rest day and holiday changes) for the period.",
            link: {
              label: "Work Rotation Plan",
              to: "/change-schedule/work-rotation",
            },
          },
          {
            text: "5. Make sure every leave, overtime, official business and pass slip for the period is approved. Pending ones aren't counted.",
            link: { label: "Leave", to: "/applications/leave" },
          },
          {
            text: "6. Calculate the DTR for the payroll group and period, review it and Save Draft. It goes for approval.",
            link: {
              label: "Calculate Daily Time Record",
              to: "/daily-time-record/master",
            },
          },
          {
            text: "7. Once the DTR batch is approved, run payroll on it, review it and Save Payroll. It goes for approval.",
            link: {
              label: "Payroll Run",
              to: "/daily-time-record/for-payroll",
            },
          },
          {
            text: "8. Once payroll is approved, check the Payroll Summary. Employees then see their payslips in My Portal.",
            link: { label: "Payroll Summary", to: "/payroll/summary" },
          },
          {
            text: "9. Produce remittances and reports: SSS, PhilHealth, Pag-IBIG, BIR and bank disbursement.",
            link: {
              label: "SSS Remittance",
              to: "/payroll/reports/sss-remittance",
            },
          },
        ],
        warning:
          "Anything you change after step 6, such as a late approval or a corrected punch, isn't in the DTR until you calculate and save it again.",
      },
    ],
    related: [
      "attendance-upload",
      "incomplete-logs",
      "dtr-calculate",
      "payroll-run",
    ],
  },
  {
    id: "attendance-upload",
    title: "Attendance: uploads, logs and unregistered IDs",
    audience: "hr",
    chapter: "Attendance",
    summary:
      "Upload a device file, review raw attendance logs, and link unknown Bio IDs to employees.",
    permission: [
      "Upload Attendance:View",
      "Raw Logs:View",
      "Unregistered Employees:View",
    ],
    paths: [
      "/timekeeping/upload-attendance",
      "/timekeeping/raw-logs",
      "/timekeeping/unregistered-employees",
    ],
    sections: [
      {
        heading: "Upload a device file",
        steps: [
          {
            text: "Open Upload Attendance.",
            link: {
              label: "Upload Attendance",
              to: "/timekeeping/upload-attendance",
            },
          },
          {
            text: "Choose the Branch (and Project Site, Client or Department if needed) whose device produced the file.",
          },
          {
            text: "Enter the Reason / Remarks for this Upload, then drag in the .dat file exported from the device.",
          },
          { text: "Click Upload." },
        ],
        warning:
          "Logs are tagged to the branch you choose. Pick the branch whose device generated the file.",
      },
      {
        heading: "Review logs",
        steps: [
          {
            text: "Attendance Logs shows every raw punch from all sources, for checking what came in.",
            link: { label: "Attendance Logs", to: "/timekeeping/raw-logs" },
          },
        ],
      },
      {
        heading: "Unregistered employees",
        steps: [
          {
            text: "Unregistered Employees lists punches whose Bio ID isn't linked to any employee. Tag each one to the right employee (or set that Bio ID on the employee record) so the punches count.",
            link: {
              label: "Unregistered Employees",
              to: "/timekeeping/unregistered-employees",
            },
          },
        ],
      },
    ],
    related: ["incomplete-logs"],
  },
  {
    id: "incomplete-logs",
    title: "Incomplete logs and manual attendance entry",
    audience: "hr",
    chapter: "Attendance",
    summary:
      "Find days with a missing time-in or time-out and fix them before calculating the DTR.",
    permission: ["Incomplete Punches:View", "Attendance Manual Entry:View"],
    paths: ["/timekeeping/incomplete-punches", "/timekeeping/attendance-entry"],
    sections: [
      {
        heading: "Steps",
        steps: [
          {
            text: "Open Incomplete Logs and filter by the cutoff dates.",
            link: {
              label: "Incomplete Logs",
              to: "/timekeeping/incomplete-punches",
            },
          },
          {
            text: "For each day, confirm the missing punch with the employee, e.g. from a pass slip or official business form.",
          },
          {
            text: "Add the missing time in Manual Attendance Entry.",
            link: {
              label: "Manual Attendance Entry",
              to: "/timekeeping/attendance-entry",
            },
          },
        ],
        tips: [
          "Company Settings controls how many manual entries a day are allowed (Manual Attendance Fill Limit).",
          "Employees can see their own incomplete logs in My Portal and file a pass slip from there.",
        ],
      },
    ],
    related: ["dtr-calculate"],
  },
  {
    id: "schedule-changes",
    title: "Schedule changes: rotations, rest days and holidays",
    audience: "hr",
    chapter: "Attendance",
    summary:
      "Handle people whose shift changes, swapped rest days and holidays moved for a group.",
    permission: [
      "Work Rotation:View",
      "Change Rest Day:View",
      "Change Holiday:View",
    ],
    paths: ["/change-schedule"],
    sections: [
      {
        heading: "Which one to use",
        steps: [
          {
            text: "Work Rotation Plan: assign shifts by date for people whose schedule changes (e.g. rotating shifts).",
            link: {
              label: "Work Rotation Plan",
              to: "/change-schedule/work-rotation",
            },
          },
          {
            text: "Change Rest Day: move someone's rest day for specific dates.",
            link: {
              label: "Change Rest Day",
              to: "/change-schedule/change-rest-day",
            },
          },
          {
            text: "Change Holiday: change how a holiday applies for specific employees or dates.",
            link: {
              label: "Change Holiday",
              to: "/change-schedule/change-holiday",
            },
          },
        ],
        tips: [
          "These can require approval. Approve them before you calculate the DTR for that period.",
        ],
      },
    ],
    related: ["dtr-calculate"],
  },
  {
    id: "dtr-calculate",
    title: "Calculate and save the Daily Time Record (DTR)",
    audience: "hr",
    chapter: "DTR & payroll",
    summary:
      "Compute each employee's hours, lates, overtime and premiums for a period, then save it for approval.",
    permission: "DTR Master:View",
    paths: ["/daily-time-record/master", "/daily-time-record/detail"],
    sections: [
      {
        heading: "Generate",
        steps: [
          {
            text: "Open Calculate Daily Time Record. You start on the Generate tab.",
            link: {
              label: "Calculate Daily Time Record",
              to: "/daily-time-record/master",
            },
          },
          {
            text: "Click Filters. Choose the Date Range (the cutoff) and the Payroll Group. Branch, Department, Client, Project Site and Employee are optional.",
          },
          {
            text: "Click Generate and review the results: late, undertime, overtime, night differential, rest day and holiday hours per employee.",
          },
          {
            text: "Click Save Draft to save it as a DTR batch. It goes For Approval.",
          },
        ],
        tips: [
          "Use Export to download the DTR as CSV or Excel for checking.",
          "Wrong numbers usually mean a missing punch, an unapproved request or the wrong shift. Fix it, generate again and save again.",
        ],
      },
      {
        heading: "Saved DTR",
        steps: [
          {
            text: "The Saved DTR tab lists saved batches and their status: For Approval, Approved, Declined or Cancelled.",
          },
          {
            text: "Approvers use the Approve / Decline actions on the row. History shows who did what.",
          },
          {
            text: "An approved batch is what payroll runs on. To remove one, request deletion. That also needs approval (Approve Deletion / Decline Deletion).",
          },
        ],
      },
    ],
    related: ["dtr-summary", "payroll-run", "approve-batches"],
  },
  {
    id: "dtr-summary",
    title: "DTR Summary",
    audience: "hr",
    chapter: "DTR & payroll",
    summary: "Totals per employee for a saved DTR batch.",
    permission: "DTR Summary:View",
    paths: ["/daily-time-record/summary"],
    sections: [
      {
        heading: "Steps",
        steps: [
          {
            text: "Open DTR Summary, choose the DTR batch and click Search.",
            link: { label: "DTR Summary", to: "/daily-time-record/summary" },
          },
          {
            text: "Review totals per employee (late, undertime, absences, regular, rest day and holiday hours) and click Export if needed.",
          },
        ],
        tips: [
          "If a notice says confidential employees are excluded, the totals leave them out. Ask someone with confidential access to produce the version you submit.",
        ],
      },
    ],
  },
  {
    id: "payroll-run",
    title: "Run payroll",
    audience: "hr",
    chapter: "DTR & payroll",
    summary:
      "Compute pay from approved DTR batches, preview it and save it for approval.",
    permission: "Payroll Run:View",
    paths: ["/daily-time-record/for-payroll"],
    sections: [
      {
        heading: "Run it",
        steps: [
          {
            text: "Open Payroll Run. You start on the Generate tab.",
            link: {
              label: "Payroll Run",
              to: "/daily-time-record/for-payroll",
            },
          },
          {
            text: "Under DTR Batches, select the approved DTR batch(es) for this cutoff.",
          },
          {
            text: "Enter the Pay/Release Date and click Preview. Check earnings, deductions and net pay in Payroll Results.",
          },
          {
            text: "Click Save Payroll, add Remarks if needed, and click Save. The payroll goes For Approval.",
          },
        ],
        tips: [
          "Loans, other income and salary adjustments scheduled for the period are included automatically, so record them first.",
          "If the minimum take-home rule in Company Settings would be breached, some deductions are held back to protect it.",
        ],
      },
      {
        heading: "Saved Payroll Runs",
        steps: [
          {
            text: "The Saved Payroll Runs tab lists each run with its period, payout date, run type, employees and status.",
          },
          {
            text: "Approvers use Approve / Decline on the row. View in Payroll Summary opens the run's details.",
          },
          {
            text: "Once it's Approved, employees see the payslip in My Portal.",
          },
        ],
      },
    ],
    related: ["payroll-summary", "special-runs", "loans-income"],
  },
  {
    id: "payroll-summary",
    title: "Payroll Summary and payslips",
    audience: "hr",
    chapter: "DTR & payroll",
    summary: "Review a payroll run in detail and print payslips.",
    permission: "Payroll Summary:View",
    paths: ["/payroll/summary"],
    sections: [
      {
        heading: "Steps",
        steps: [
          {
            text: "Open Payroll Summary and pick the payroll run.",
            link: { label: "Payroll Summary", to: "/payroll/summary" },
          },
          {
            text: "Switch between tabs to see earnings, hours, holidays, deductions and employer contributions.",
          },
          {
            text: "Print the summary or individual payslips. They open as a PDF in a new tab.",
          },
        ],
      },
    ],
    related: ["reports"],
  },
  {
    id: "special-runs",
    title: "13th month, last pay and year-end tax adjustment",
    audience: "hr",
    chapter: "DTR & payroll",
    summary:
      "The special payroll runs: 13th month pay, final pay for leavers, and annual tax adjustment.",
    permission: [
      "13th Month Run:View",
      "Last Pay Run:View",
      "Year-End Adjustment Run:View",
    ],
    paths: [
      "/daily-time-record/for-13th-month",
      "/daily-time-record/for-last-pay",
      "/daily-time-record/for-year-end-adjustment",
    ],
    sections: [
      {
        heading: "Which one",
        steps: [
          {
            text: "Generate 13th Month Pay: computed from the year's basic pay. The non-taxable ceiling comes from Company Settings › Payroll Settings.",
            link: {
              label: "Generate 13th Month Pay",
              to: "/daily-time-record/for-13th-month",
            },
          },
          {
            text: "Generate Last Pay: final pay for an employee who's leaving. You can include unpaid salary adjustments and other income.",
            link: {
              label: "Generate Last Pay",
              to: "/daily-time-record/for-last-pay",
            },
          },
          {
            text: "Year-End Tax Adjustment: annualizes each employee's tax and refunds or collects the difference. Preview it before generating.",
            link: {
              label: "Year-End Tax Adjustment",
              to: "/daily-time-record/for-year-end-adjustment",
            },
          },
          {
            text: "Each run is saved For Approval and appears under Saved Payroll Runs, like a regular payroll.",
          },
        ],
      },
    ],
  },
  {
    id: "loans-income",
    title: "Loans, other income and salary adjustments",
    audience: "hr",
    chapter: "DTR & payroll",
    summary:
      "Record loans and scheduled deductions, allowances and other income, and salary adjustments so payroll picks them up.",
    permission: [
      "Loan/Deduction:View",
      "Other Income:View",
      "Salary Adjustment:View",
    ],
    paths: [
      "/applications/deduction-application",
      "/applications/other-income",
      "/applications/salary-adjustment",
    ],
    sections: [
      {
        heading: "Steps",
        steps: [
          {
            text: "Loans & Deductions: click New Loan / Deduction, choose the employee and deduction type, and enter the amount and payment schedule.",
            link: {
              label: "Loans & Deductions",
              to: "/applications/deduction-application",
            },
          },
          {
            text: "Other Income: click New Income Application to record an allowance or other earnings for an employee.",
            link: { label: "Other Income", to: "/applications/other-income" },
          },
          {
            text: "Salary Adjustments: record back pay or corrections to past pay.",
            link: {
              label: "Salary Adjustments",
              to: "/applications/salary-adjustment",
            },
          },
          {
            text: "Once approved, these are included automatically in the payroll run for their scheduled period.",
          },
        ],
      },
    ],
    related: ["payroll-run"],
  },
  {
    id: "reports",
    title: "Reports and government remittances",
    audience: "hr",
    chapter: "Reports",
    summary:
      "Statutory remittances, BIR forms and files, payroll ledgers and attendance reports.",
    permission: [
      "Government Statutory Reports:View",
      "Payroll Reports:View",
      "BIR Reports:View",
      "Attendance Reports:View",
    ],
    paths: ["/reports", "/payroll/reports"],
    sections: [
      {
        heading: "What's where",
        steps: [
          {
            text: "Government remittances: SSS, PhilHealth, Pag-IBIG and BIR Withholding Tax per month.",
            link: {
              label: "SSS Remittance",
              to: "/payroll/reports/sss-remittance",
            },
          },
          {
            text: "BIR: 1601-C monthly remittance, Alphalist and 2316 certificates. Upload files: SSS R3, PhilHealth EPRS and Pag-IBIG MCRF.",
            link: { label: "BIR 1601-C", to: "/payroll/reports/bir-1601c" },
          },
          {
            text: "Payroll: Bank Disbursement, Deduction Ledger, Cash Bond, Leave Ledger, Retirement and Uniform Allowance Ledgers, Reimbursements, Cost Summary, YTD Summary and 13th Month Pay.",
            link: {
              label: "Bank Disbursement",
              to: "/payroll/reports/bank-disbursement",
            },
          },
          {
            text: "Attendance: Tardiness and Rostering.",
            link: { label: "Tardiness", to: "/reports/tardiness" },
          },
        ],
        tips: [
          "Choose the period and filters, then print (opens a PDF in a new tab) or export to Excel.",
          "Government forms use the details in Company Settings › Company Info. Fill those in first.",
        ],
      },
    ],
  },
  {
    id: "hr-applications",
    title: "Filing requests for employees (HR)",
    audience: "hr",
    chapter: "Applications",
    summary:
      "File leave, overtime, official business and pass slips on an employee's behalf, and handle profile update requests.",
    permission: [
      "Leave:View",
      "Overtime:View",
      "Official Business:View",
      "Pass Slip:View",
      "Profile Update:View",
    ],
    paths: [
      "/applications/leave",
      "/applications/overtime",
      "/applications/official-business",
      "/applications/pass-slip",
      "/applications/profile-update-request",
    ],
    sections: [
      {
        heading: "File one",
        steps: [
          {
            text: "Open the application type under Applications (e.g. Leave) and create a new one.",
            link: { label: "Leave", to: "/applications/leave" },
          },
          {
            text: "Choose the employee, fill in the dates and details, and save. It goes through the same approval as a request the employee files.",
          },
        ],
      },
      {
        heading: "Tabs",
        body: [
          "Each list has For Approval (still waiting) and Processed (approved, declined, cancelled or withdrawn) tabs. The detail page shows Approval Progress: each step, who acted and any notes.",
        ],
      },
      {
        heading: "Profile update requests",
        body: [
          "Employees can request changes to their own personal information from My Portal. Review them under Profile Update Requests. Approving applies the change to the employee record.",
        ],
      },
    ],
    related: ["approve-requests"],
  },
];
