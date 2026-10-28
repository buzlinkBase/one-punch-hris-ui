import type { HelpArticle } from "../models/help-article.model";

export const HR_PAYROLL_ARTICLES: HelpArticle[] = [
  {
    id: "payroll-cutoff",
    title: "The payroll cutoff, end to end",
    audience: "hr",
    chapter: "Payroll cutoff",
    summary:
      "Everything from raw attendance to released payslips and remittances for one cutoff, in order.",
    purpose: [
      "Use this as your checklist every cutoff. Payroll is only as accurate as the attendance and approvals feeding it, so the order matters: attendance first, then approvals, then DTR, then payroll.",
      "Sample timeline for the 1st–15th cutoff paid on the 20th: upload logs on the 16th, fix incomplete logs and approve requests by the 17th, save the DTR on the 17th, run payroll on the 18th, release payslips and file remittances on the 19th–20th.",
    ],
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
            text: "Bring in attendance: devices send punches automatically, or upload a device file.",
            link: {
              label: "Upload Attendance",
              to: "/timekeeping/upload-attendance",
            },
          },
          {
            text: "Tag punches with an unknown Bio ID to their employee.",
            link: {
              label: "Unregistered Employees",
              to: "/timekeeping/unregistered-employees",
            },
          },
          {
            text: "Fix missing time-ins and time-outs.",
            link: {
              label: "Incomplete Logs",
              to: "/timekeeping/incomplete-punches",
            },
          },
          {
            text: "Apply schedule changes (rotations, rest day and holiday changes) for the period.",
            link: {
              label: "Work Rotation Plan",
              to: "/change-schedule/work-rotation",
            },
          },
          {
            text: "Make sure every leave, overtime, official business and pass slip for the period is approved. Pending ones aren't counted.",
            link: { label: "Leave", to: "/applications/leave" },
          },
          {
            text: "Calculate the DTR for the payroll group and cutoff, review each employee and Save Draft. It goes for approval.",
            link: {
              label: "Process DTR",
              to: "/daily-time-record/master",
            },
          },
          {
            text: "Once the DTR batch is approved, run payroll on it, review it and Save Payroll. It goes for approval.",
            link: {
              label: "Payroll Run",
              to: "/daily-time-record/for-payroll",
            },
          },
          {
            text: "Once payroll is approved, check the Payroll Summary. Employees then see their payslips in My Portal.",
            link: { label: "Payroll Summary", to: "/payroll/summary" },
          },
          {
            text: "Produce remittances and reports: SSS, PhilHealth, Pag-IBIG, BIR and disbursement.",
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
    purpose: [
      "Attendance logs (punches) are the raw time-in and time-out records every DTR is built from. Biometric devices send them automatically; if a device is offline or a branch has no live connection, you upload the exported .dat file instead.",
      "Unregistered employees are punches whose Bio ID isn't linked to anyone yet. Until you tag them, those hours aren't counted.",
    ],
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
        example: {
          title: "A branch device was offline all week",
          lines: [
            "The Makati branch device couldn't sync from Mon to Fri.",
            "On Friday the guard exports the .dat file from the device.",
            "HR opens Upload Attendance, picks Branch: Makati, types the reason 'Device offline Oct 20–24' and uploads the file.",
            "The week's punches now appear in Attendance Logs and are ready for the DTR.",
          ],
        },
      },
      {
        heading: "Review logs",
        steps: [
          {
            text: "Attendance Logs shows every raw punch from all sources, for checking what came in. Set the filters and click Generate; the filters collapse into chips so the results get the room. On the Raw Logs (List) tab, use the pencil to edit or the bin to remove a log. Each source needs its own permission (Attendance Manual Entry, Upload Attendance or Sync Attendance), and biometric logs can't be changed.",
            link: { label: "Attendance Logs", to: "/timekeeping/raw-logs" },
          },
        ],
      },
      {
        heading: "See which logs of an upload were changed",
        steps: [
          {
            text: "Click View upload history to open the full-screen history. There, the Changed column counts the logs of that file someone edited or removed. Click the count to see each one: the employee, the original and current time, the reason, and who changed it and when. It needs the Upload Attendance: View permission.",
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
    purpose: [
      "An incomplete log is a day with only one punch, usually a forgotten time-out. The DTR can't compute hours for it, so the employee would be treated as absent or short.",
      "Fixing these before you calculate the DTR avoids wrong pay and corrections later.",
    ],
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
        example: {
          title: "Forgotten time-out",
          table: {
            columns: ["Employee", "Date", "Time in", "Time out", "Fix"],
            rows: [
              [
                "Juan Dela Cruz",
                "Oct 21",
                "08:02",
                "(missing)",
                "Confirm he left at 17:00, then add a 17:00 time-out in Manual Attendance Entry with a reason.",
              ],
            ],
          },
        },
      },
      {
        heading: "Creating manual entries in bulk",
        steps: [
          {
            text: "Open Manual Attendance Entry and click New. In Select Employees, set any filters (Branch, Department, Client, Payroll Group, Project Site, Employee) and click Search Employees. All filters are optional.",
          },
          {
            text: "Check the employees to include, or use Select All to pick everyone in the results. Click Filters (or Change filters) to search again.",
          },
          {
            text: "In Set Date Range & Work Time, pick the Date Range. Optionally pick a Time Shift to pre-fill the In and Out times.",
          },
          {
            text: "Adjust In Time and Out Time. Untick one if you only need the other. For an overnight shift the Out Time is saved on the next day and shows a +1d tag.",
          },
          {
            text: "Enter the reason in Remarks (required), check the preview of how many entries will be created, then click Save.",
          },
        ],
        tips: [
          "The total is employees x days x punches, so a wide date range for many employees creates many entries at once.",
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
    purpose: [
      "Employees have a usual shift and rest day. When reality differs for a few dates (a rotating guard, a swapped rest day, a holiday moved for one client), you record it here so the DTR pays the right rates instead of treating it as lates or absences.",
    ],
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
          "A local holiday (one limited to certain project sites) can only be moved for employees assigned to one of its sites. Others are greyed out in the employee list.",
        ],
        example: {
          title: "Rotating guard",
          table: {
            columns: ["Date", "Assigned shift", "Why"],
            rows: [
              ["Oct 20", "Day 06:00–14:00", "Work Rotation Plan"],
              ["Oct 21", "Night 22:00–06:00", "Work Rotation Plan"],
              ["Oct 22", "Rest day", "Change Rest Day (swapped with Oct 25)"],
            ],
          },
        },
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
    purpose: [
      "The Daily Time Record turns raw punches, shifts, holidays and approved requests into payable hours: regular, late, undertime, overtime, night differential and holiday or rest day premiums.",
      "Payroll runs on the saved, approved DTR, never on raw punches, so this is where you catch problems.",
    ],
    permission: "DTR Master:View",
    paths: ["/daily-time-record/master", "/daily-time-record/detail"],
    sections: [
      {
        heading: "Generate",
        steps: [
          {
            text: "Open Process DTR. You start on the Generate tab.",
            link: {
              label: "Process DTR",
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
        example: {
          title: "One day, step by step",
          note: "Shift 8:00–17:00 with a 1-hour break. Overtime of 1.5 hours is approved.",
          lines: [
            "Punches: in 8:15, out 18:30.",
            "Late: 15 minutes (8:00 to 8:15).",
            "Overtime: 1 hour 30 minutes (17:00 to 18:30), counted because the OT request is approved.",
            "If that OT request were still pending, the 1.5 hours would not be counted.",
          ],
        },
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
    purpose: [
      "A one-screen review of a whole batch before you send it on. Scan it for unusual lates, absences or hours, and export it as a record for the cutoff.",
    ],
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
        example: {
          title: "Reading a row",
          note: "Juan was 45 minutes late in total, absent one day and has 3.5 hours of approved overtime. Check the absence before you save: was a leave request missed?",
          table: {
            columns: [
              "Employee",
              "Late",
              "Undertime",
              "Absences",
              "Regular hrs",
              "OT hrs",
            ],
            rows: [["Juan Dela Cruz", "0:45", "0:00", "1", "80:00", "3:30"]],
          },
        },
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
    purpose: [
      "Payroll Run computes each employee's pay for a cutoff from the approved DTR, then adds loans, other income and salary adjustments and takes out statutory contributions, tax and other deductions. Always preview before you save.",
    ],
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
            text: "Click Preview. The results open in a full-screen window. Check earnings, deductions and net pay there. Click an amount shown as a link, such as Basic, Allowances, Bonuses or Other Income, to see what it is made of, including adjustments. Click OT, ND, Rest Day or Holiday to see the day-by-day pay.",
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
        example: {
          title: "One employee's pay (sample figures)",
          note: "Daily rate ₱800 (₱100 an hour), 13 days worked, 1.5 hours of overtime at the standard 125% rate. Contribution and loan amounts are only for illustration; yours come from the statutory tables.",
          table: {
            columns: ["Item", "Computation", "Amount"],
            rows: [
              ["Basic pay", "13 days × ₱800", "₱10,400.00"],
              ["Overtime", "1.5 h × ₱100 × 1.25", "₱187.50"],
              ["Gross pay", "", "₱10,587.50"],
              ["SSS", "", "-₱450.00"],
              ["PhilHealth", "", "-₱275.00"],
              ["Pag-IBIG", "", "-₱200.00"],
              ["Company loan", "1 of 6 payments", "-₱500.00"],
              ["Net pay", "", "₱9,162.50"],
            ],
          },
        },
      },
      {
        heading: "Employees paid by several clients",
        steps: [
          {
            text: "If your guards or relievers work for more than one client in the same cutoff, run payroll once per client: pick the client in the Clients filter, then Preview and Save. Each run pays only the days worked for that client, and each run can have its own payout date.",
          },
          {
            text: "Client rate settings follow where the work was done. In these runs, a day worked for a client uses that client's own premium rates, and retirement accrues under the client each day was worked for. Government contribution caps stay with the employee's own client.",
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
            text: "Approvers use Approve / Decline on the row. The eye button opens the run's full Payroll Summary in a full-screen popup, with its tabs, totals, Export and Print.",
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
    purpose: [
      "After payroll is approved, this is where you check the final numbers per employee, answer 'why is my pay this amount?' questions, and print the summary or payslips.",
    ],
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
            text: "Narrow the list with the Status, Client, Payroll Group and Employees filters. You can pick several employees; the list only offers people paid in the selected run. Export and Print include only the filtered rows. Click Clear filters to start over.",
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
        example: {
          title: "What each tab answers",
          table: {
            columns: ["Tab", "Use it to check"],
            rows: [
              [
                "Earnings",
                "Basic pay, overtime, night differential, holiday pay, other income",
              ],
              ["Hours", "Days and hours behind the pay"],
              ["Holidays", "Regular and special holiday pay"],
              [
                "Deductions",
                "Contributions, tax, each loan, late, undertime and absences",
              ],
              [
                "Employer contributions",
                "What the company pays on top (SSS, PhilHealth, Pag-IBIG)",
              ],
            ],
          },
        },
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
    purpose: [
      "Besides the regular cutoff payroll, three yearly or one-off runs exist. 13th month is the mandatory year-end bonus, last pay settles everything owed to someone who is leaving, and the year-end adjustment corrects withholding tax so it matches what the employee actually owes for the year.",
    ],
    permission: [
      "13th Month Run:View",
      "Last Pay Run:View",
      "Year-End Adjustment Run:View",
    ],
    paths: [
      "/daily-time-record/for-13th-month",
      "/daily-time-record/for-last-pay",
      "/daily-time-record/for-year-end-adjustment",
      "/payroll/reports/13th-month-pay",
    ],
    sections: [
      {
        heading: "Which one",
        steps: [
          {
            text: "13th Month Run: computed from the year's basic pay. The non-taxable ceiling comes from Company Settings › Payroll Settings.",
            link: {
              label: "13th Month Run",
              to: "/daily-time-record/for-13th-month",
            },
          },
          {
            text: "Last Pay Run: final pay for an employee who's leaving. You can include unpaid salary adjustments and other income. The cash bond the employee has paid in so far is refunded on it (not taxed); untick Include cash bond refund to hold it back, for example while clearance is pending.",
            link: {
              label: "Last Pay Run",
              to: "/daily-time-record/for-last-pay",
            },
          },
          {
            text: "Year-End Adjustment Run: annualizes each employee's tax and refunds or collects the difference. Preview it before generating.",
            link: {
              label: "Year-End Adjustment Run",
              to: "/daily-time-record/for-year-end-adjustment",
            },
          },
          {
            text: "Each run is saved For Approval and appears under Saved Payroll Runs, like a regular payroll.",
          },
        ],
        example: {
          title: "13th month, last pay and year-end (sample figures)",
          lines: [
            "13th month = total basic pay earned in the year ÷ 12. An employee who earned ₱240,000 in basic pay gets ₱240,000 ÷ 12 = ₱20,000. Any part above the non-taxable ceiling in Company Settings is taxed.",
            "Last pay for someone leaving on Oct 31: unpaid salary for Oct 16–31, the 13th month earned so far, plus any unpaid adjustments, other income and the cash bond refund, less remaining loan balances.",
            "Year-end adjustment: if tax withheld during the year was ₱18,000 but the annualized tax is ₱15,000, the employee is refunded ₱3,000. If only ₱12,000 was withheld, ₱3,000 is collected.",
          ],
        },
      },
      {
        heading: "Reading the 13th Month Pay report",
        steps: [
          {
            text: "Basic Pay Earned (Year to Date): basic pay from this year's posted regular payrolls. It grows with every cutoff that is posted.",
            link: {
              label: "13th Month Pay report",
              to: "/payroll/reports/13th-month-pay",
            },
          },
          {
            text: "Special Bonuses Paid: bonuses that share the tax-free ceiling (₱90,000 by default, set in Company Settings › Payroll Settings) with the 13th month.",
          },
          {
            text: "13th Month Earned: Basic Pay Earned ÷ 12, worked out again every time you open the report. It keeps growing until the year's last cutoff is posted.",
          },
          {
            text: "Status: Not yet generated (no 13th Month Run includes the employee), Generated, not released (the run is saved but not posted), or Released (posted and paid).",
          },
          {
            text: "Amount Released (after tax): what the 13th month payout actually paid. Anything above the tax-free ceiling is taxed, so this can be lower than the amount before tax. It is fixed on the day the run was generated and does not change afterwards.",
          },
          {
            text: "Still Unpaid: 13th Month Earned minus the payout's amount before tax, shown in orange. It is the 13th month earned in cutoffs posted after the run was generated, which the payout did not cover.",
          },
          {
            text: "Unrelease (the arrow button on a Posted row of the 13th Month Run or Last Pay Run page, and on a Released row of this report, for users who can approve that run): withdraws that employee's payout when it was released by mistake. The employee goes back to Not yet generated and you generate the run again; a Last Pay also puts back the loan installments and retirement payout it settled. It only affects that one employee, and it is blocked once the year-end tax adjustment has been posted for the year.",
          },
        ],
        example: {
          title:
            "Why 13th Month Earned and Amount Released differ (sample figures)",
          lines: [
            "The 13th Month Run was generated on Oct 15. Basic pay posted so far was ₱7,532.40, so the payout was ₱7,532.40 ÷ 12 = ₱627.70. It was under the ceiling, so no tax: Amount Released = ₱627.70.",
            "By December, basic pay posted is ₱14,067.24, so 13th Month Earned is ₱14,067.24 ÷ 12 = ₱1,172.27.",
            "Still Unpaid = ₱1,172.27 − ₱627.70 = ₱544.57, earned in the cutoffs posted after Oct 15.",
          ],
        },
        tips: [
          "Generate the 13th Month Run after the year's last December cutoff is posted, so the payout covers the whole year.",
          "If it was generated early, Still Unpaid shows what each employee is still owed.",
          "Print opens the listing as a PDF; Export gives the same columns in Excel with a Total row. The printer icon on a row opens that employee's 13th month payslip.",
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
    purpose: [
      "Loans & Deductions take money out of pay on a schedule (company loans, cash advances). Other Income adds money (allowances, incentives). Salary Adjustments correct past pay (back pay or an overpayment).",
      "Record them before running payroll: once approved they are included automatically for the period they are scheduled in.",
    ],
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
        example: {
          title: "Three typical entries",
          table: {
            columns: ["Type", "Entry", "Effect on payroll"],
            rows: [
              [
                "Loan / Deduction",
                "₱12,000 company loan over 6 cutoffs",
                "-₱2,000 each cutoff for 6 cutoffs",
              ],
              [
                "Other Income",
                "₱100 meal allowance per qualifying day",
                "+₱100 for each day the employee met the attendance rule",
              ],
              [
                "Salary Adjustment",
                "₱1,500 back pay for a missed rate increase",
                "+₱1,500 once, in the next run",
              ],
            ],
          },
        },
      },
      {
        heading: "Paying only when attendance is met",
        body: [
          "On an Other Income application, choose How it is given: Fixed schedule (paid on set dates, no condition), Per qualifying day (a daily amount for each day the employee meets the rule) or Weekly / semi-monthly / monthly with attendance (one payment per week, cut-off or month, only if the rule is met in that period).",
          "The attendance rule sets what counts as present (Worked, or Worked or on paid leave), the minimum hours, the weekdays and day types it applies to, and how much lateness or undertime is allowed. A weekly, semi-monthly or monthly rule can also require a minimum number of qualifying days.",
          "A payment payroll didn't make is marked skipped with the reason, such as No posted DTR, Did not work, Below minimum hours or Late beyond the limit.",
        ],
      },
      {
        heading: "Fix a schedule row",
        body: [
          "Rows in an Other Income or loan schedule can be edited from the application, for example to change a date or amount, or regenerated. Rows already paid are locked.",
          "A generated loan schedule is in whole centavos. Every payment is the same amount except the last, which can differ by a few centavos so the payments add up exactly to the loan plus its interest.",
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
    purpose: [
      "Reports are the outputs you hand to others: government agencies (SSS, PhilHealth, Pag-IBIG, BIR), the bank, your clients and management. Produce them after payroll is approved so the figures are final.",
    ],
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
            text: "Payroll: Disbursement, Deduction Ledger (grouped by employee, with each deduction's balance and a running total), Cash Bond, Leave Ledger, Retirement and Uniform Allowance Ledgers, Reimbursements, Cost Summary, YTD Summary and 13th Month Pay. On 13th Month Pay, 13th Month Earned is live (basic pay so far ÷ 12), Amount Released is what the payout paid, and Still Unpaid is what was earned after it was generated; see 13th month, last pay and year-end tax adjustment.",
            link: {
              label: "Disbursement",
              to: "/payroll/reports/bank-disbursement",
            },
          },
          {
            text: "Attendance: Tardiness, Rostering and DTR Detail (per-day time records filtered by client, department, branch, project site, payroll group or employee, exportable to CSV or Excel; all times show seconds).",
            link: { label: "Tardiness", to: "/reports/tardiness" },
          },
        ],
        tips: [
          "Choose the period and filters, then print (opens a PDF in a new tab) or export to Excel.",
          "Report tables end with a Grand Total row for amount columns. It adds up every row of your filtered result, not just the page you are on. Excel/CSV exports end with a Total row too, and exported amounts are real numbers, so you can sort and sum them in Excel.",
          "Most reports have a Client filter. Pick a client to see only that client's employees, or clear it for everyone. Prints, exports and upload files follow the same filter.",
          "Government forms use the details in Company Settings › Company Info. Fill those in first.",
          "Sample use: after the Oct 16–31 payroll is approved, print Disbursement for the bank, then export the SSS, PhilHealth and Pag-IBIG remittances for the month to pay and upload by their deadlines.",
          "Cash Bond: use the pencil on a row to change an employee's cash bond per payroll. It applies from the next payroll run, payrolls already generated keep their amounts, and the change (old rate, new rate, reason) is kept under Rate history in the row's ledger and in the audit log. Changing it in Employee Details is logged the same way. A cash bond refunded through Last Pay shows in the Refunded column and the balance drops accordingly.",
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
    purpose: [
      "Employees normally file their own requests in My Portal. HR files on their behalf for staff without portal access or when something was missed, so the DTR still counts it.",
    ],
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
        example: {
          title: "Overtime filed by HR",
          lines: [
            "Employee: Maria Santos. Date: Oct 21. From 17:00 to 19:00 (2 hours). Reason: client deadline.",
            "Saved, it goes to her approver. Once approved, the 2 hours count as overtime when you calculate the DTR.",
          ],
        },
      },
      {
        heading: "Tabs",
        body: [
          "Leave, Overtime, Official Business, Pass Slip, Loan/Deduction and Profile Update lists have three tabs. For Approval holds only the requests whose current step is yours. In Progress holds the ones still waiting on another approver (view only). History holds the approved, declined, cancelled and withdrawn ones. Other lists keep For Approval and History.",
          'On For Approval and In Progress the status reads "Pending with <approver> (Step n/m)". Click it to see the full Approval Progress. Under the status tag, each step already decided is listed with who approved or declined it (for example "Step 1 · Ben Cruz ✓"). Owners and Admins can still approve or decline from In Progress to override a stuck step.',
          "The detail page shows Approval Progress: each step, who acted and any notes.",
        ],
      },
      {
        heading: "Profile update requests",
        body: [
          "Employees can request changes to their own personal information from My Portal. Review them under Applications › Profile Updates. Approving applies the change to the employee record.",
        ],
      },
    ],
    related: ["approve-requests"],
  },
];
