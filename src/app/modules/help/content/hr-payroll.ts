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
            text: "6. Calculate the DTR for the payroll group and cutoff, review each employee and Save Draft. It goes for approval.",
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
            text: "9. Produce remittances and reports: SSS, PhilHealth, Pag-IBIG, BIR and disbursement.",
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
        heading: "Delete a whole upload",
        steps: [
          {
            text: "In Upload History, use the delete action on a batch to remove every log that file brought in. It needs the Upload Attendance: Delete permission.",
          },
          {
            text: "Regenerate the DTR for the affected days so the change is applied.",
          },
        ],
      },
      {
        heading: "Edit or remove a single log",
        body: [
          "Open an employee's day from the DTR and choose Attendance Logs. Manual, file-uploaded and synced logs can be edited or removed there, each needing its own permission (Attendance Manual Entry, Upload Attendance or Sync Attendance: Edit / Delete). Biometric and mobile punches can't be changed. Every change asks for a reason.",
          "For uploaded and synced logs the original is kept. Restore puts the log back as the file or device had it, and a re-upload or device re-sync won't bring a removed log back.",
        ],
        tips: [
          "After any change, regenerate the DTR for that day to apply it to the hours.",
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
      {
        heading: "Send someone to another project site for the day",
        steps: [
          {
            text: "In Work Rotation Plan, find the employees in Step 1 (filter by branch, department, client, payroll group, project site, or pick specific employees), then choose the time shift, dates, Client and Project Site in Step 2.",
            link: {
              label: "Work Rotation Plan",
              to: "/change-schedule/work-rotation",
            },
          },
          {
            text: "Or in the Rostering view, click a day and choose a Project Site in the Assign Shift window. The site shows next to the shift on the roster.",
          },
          {
            text: "When the employee works that day, the DTR is recorded under the scheduled project site (and its branch and client), even if they clocked in on a device registered to another site.",
          },
        ],
        tips: [
          "Pick the Client first, then the Project Site. The site list narrows to that client's sites plus the sites that aren't tied to any client, so you can still send someone to a shared site for a specific client. The client you pick is used for that day's attendance, billing and payroll, ahead of the site's own client.",
          "Picking a project site that belongs to a client fills the Client in for you. You can also leave Project Site blank and set only the client.",
          "Changing the Client clears the Project Site if it belongs to a different client.",
          "Leave Project Site blank to keep the employee's own site.",
          "Client billing follows the scheduled site, so the day is billed to the client that owns it.",
          "The attendance log itself keeps the site of the device or upload, so you can still see where the punch came from.",
          "Recalculate the DTR after changing a site on a date that's already calculated.",
        ],
      },
      {
        heading: "Change or remove one entry",
        steps: [
          {
            text: "In Work Rotation Plan, open the Entries tab. Each employee is one row showing how many entries they have and the dates they cover; open the row to see every date, then click the pencil icon on the entry. (Under Batches, expand a batch to find the same icons.)",
            link: {
              label: "Work Rotation Plan",
              to: "/change-schedule/work-rotation",
            },
          },
          {
            text: "Change the time shift, the payroll date or the Project Site, then click Update. The employee can't be changed. To move the entry to someone else, delete it and add a new one.",
          },
          {
            text: "Click the trash icon to remove the entry.",
          },
        ],
        tips: [
          "An employee has one entry per date. If you move an entry onto a date that already has another one, you'll be told and nothing changes. Delete the other entry first.",
          "The Time Shift column shows the shift of that entry, not the employee's usual shift.",
          "Recalculate the DTR for any date you changed that's already calculated.",
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
            text: "Set the Cutoff. DTR coverage shows each payroll group with how many employees still need DTR, are awaiting approval or are approved.",
          },
          {
            text: "Click a payroll group (or pick it in Payroll Group). More filters lets you narrow by Branch, Department, Client, Project Site or Employee.",
          },
          {
            text: "Click Generate. Review lists one row per employee with their days, hours, late, undertime and issues such as missing punches or absences. Expand a row to see and fix their daily records.",
          },
          {
            text: "Everyone with days still to save is ticked. Untick anyone you want to leave out, then click Save Draft. It goes For Approval.",
          },
        ],
        tips: [
          "Days that already have saved DTR are skipped automatically, so you can generate again for the whole group to fill in only the missing days.",
          "Use Export to download the DTR as CSV or Excel for checking.",
          "Wrong numbers usually mean a missing punch, an unapproved request or the wrong shift. Fix it, generate again and save again.",
          "Employees set to Payroll only (no DTR) don't appear here; they are paid through payroll without time records.",
        ],
      },
      {
        heading: "Saved DTR",
        steps: [
          {
            text: "The Saved DTR tab lists saved batches and their status: For Approval, Approved, Declined or Cancelled.",
          },
          {
            text: "The list opens on the current cutoff. Change it with the quick date buttons (Current cutoff, This month, Last month...) or the date range, and narrow it with the search box and the Status, Payroll Group and Stage filters. Click Clear filters to start over.",
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
            text: "Open DTR Summary and choose the DTR batch. The summary loads right away. Use the arrows to move to the older or newer batch, and the search box to find an employee. The batch list shows last month to this month by default; use the quick date buttons, the date range or the Payroll Group filter to narrow it, or widen it (e.g. This year) to open older batches.",
            link: { label: "DTR Summary", to: "/daily-time-record/summary" },
          },
          {
            text: "Review totals per employee (late, undertime, absences, regular, rest day and holiday hours) and click Export if needed. The card above the table shows the batch's period, payroll group, status and overall totals.",
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
      "See who is ready to be paid, compute pay from their approved DTR, preview it and save it for approval.",
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
            text: "Set the cutoff dates. Who can be paid shows each payroll group with how many employees are ready and how many are still waiting.",
          },
          {
            text: "Click a payroll group. Its employees are listed with their status: Ready, Partly ready, Awaiting DTR approval, No DTR yet or Already paid.",
          },
          {
            text: "Everyone Ready is selected for you. Tick or untick employees, or use Add partly ready to also pay their approved days now.",
          },
          {
            text: "Click Preview. Check earnings, deductions and net pay in Payroll Results.",
          },
          {
            text: "Click Save Payroll, add Remarks if needed, and click Save. The payroll goes For Approval.",
          },
        ],
        tips: [
          "Only approved DTR days are paid. Hover a status or the pending days to see which DTR batch is still waiting.",
          "Loans, other income and salary adjustments scheduled for the period are included automatically, so record them first.",
          "If the minimum take-home rule in Company Settings would be breached, some deductions are held back to protect it.",
        ],
      },
      {
        heading: "Employees paid by several clients",
        steps: [
          {
            text: "If your guards or relievers work for more than one client in the same cutoff, run payroll once per client: pick the client in the Clients filter, then Preview and Save. Each run pays only the days worked for that client, and each run can have its own payout date.",
          },
          {
            text: "In Company Settings, under Attendance & Payroll Policy, choose which payroll run takes the deductions. Government contributions, tax, loans and other income are then taken in only one run per employee per cutoff. The employee's other runs pay earnings only.",
            link: { label: "Company Settings", to: "/setup/company-policy" },
          },
          {
            text: "In the preview, the Deductions column shows Taken here or Earnings only for each employee. Hover the tag to see why. Use the switch to take an employee's deductions in this run instead, and the preview recalculates.",
          },
        ],
        tips: [
          "Under an employee's name, Also shows any other client they worked for in the cutoff. Orange means some of those days are not in a saved run yet.",
          "A warning icon next to Taken here means the employee also worked for other clients that no run has paid yet. Their contributions and tax are worked out from what has been paid so far, so run the other clients first for the most accurate figures.",
          "If another saved run already takes an employee's deductions for the cutoff, the switch is locked. Delete that run first to move them.",
          "With the rule set to Only runs where I choose the employee, nobody is deducted until you switch them on in one of their runs.",
          "Leaving the setting on Every run takes deductions keeps the original behaviour: each run deducts.",
        ],
      },
      {
        heading: "Check who has been deducted: Cutoff Tracker",
        steps: [
          {
            text: "Open the Cutoff Tracker tab and set the cutoff dates. Each employee shows the days worked for every client and whether a saved run has taken their deductions.",
          },
          {
            text: "Paid, no deductions yet means some of their days are already in a saved run but no run takes their contributions, tax, loans or other income. Open the run that should take them, switch Deductions on and save again.",
          },
          {
            text: "Waiting for a run means nothing has been paid yet. Deductions taken shows which client's run took them and its pay date.",
          },
          {
            text: "Click Statement on an employee to see every run that paid them in the cutoff, with each run's pay date, status and deductions, and one total for gross, deductions and net pay.",
          },
        ],
        tips: [
          "The tracker opens on employees who worked for more than one client. Turn that switch off to see everyone.",
          "It only has something to show once a rule is chosen under Company Settings. With Every run takes deductions, it says so.",
        ],
      },
      {
        heading: "Saved Payroll Runs",
        steps: [
          {
            text: "The Saved Payroll Runs tab lists each run with its period, payout date, run type, employees and status.",
          },
          {
            text: "The list opens on the current cutoff. Change it with the quick date buttons (Current cutoff, This month, Last month...) or the date range, and narrow it with the search box and the Status and Run Type filters. Click Clear filters to start over.",
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
            text: "The Deductions tab lists every deduction per employee (contributions, tax, each loan and other deduction, late, under time, absent). By default it shows only employees who have deductions; switch to All employees to include everyone. Use Export Excel on that tab to download what is shown.",
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
      {
        heading: "Paying only when attendance is met",
        body: [
          "On an Other Income application, choose How it is given: Fixed schedule (paid on set dates, no condition), Per qualifying day (a daily amount for each day the employee meets the rule) or Weekly / monthly with attendance (one payment per week or month, only if the rule is met in that period).",
          "The attendance rule sets what counts as present (Worked, or Worked or on paid leave), the minimum hours, the weekdays and day types it applies to, and how much lateness or undertime is allowed. A weekly or monthly rule can also require a minimum number of qualifying days.",
          "A payment payroll didn't make is marked skipped with the reason, such as No posted DTR, Did not work, Below minimum hours or Late beyond the limit.",
        ],
      },
      {
        heading: "Fix a schedule row",
        body: [
          "Rows in an Other Income or loan schedule can be edited from the application, for example to change a date or amount, or regenerated. Rows already paid are locked.",
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
            text: "Payroll: Disbursement, Deduction Ledger (grouped by employee, with each deduction's balance and a running total), Cash Bond, Leave Ledger, Retirement and Uniform Allowance Ledgers, Reimbursements, Cost Summary, YTD Summary and 13th Month Pay.",
            link: {
              label: "Disbursement",
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
          "Report tables show a Total row for amount columns, and Excel/CSV exports end with a TOTAL row. Exported amounts are real numbers, so you can sort and sum them in Excel.",
          "Most reports have a Client filter. Pick a client to see only that client's employees, or clear it for everyone. Prints, exports and upload files follow the same filter.",
          "Government forms use the details in Company Settings › Company Info. Fill those in first.",
          "Uniform Allowance rules are set per client (Clients › gear icon › Uniform Allowance). The ledger's Credit Log shows every credit and every skipped one with the reason; an employee's Credit schedule shows their next credits.",
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
