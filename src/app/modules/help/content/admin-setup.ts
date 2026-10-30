import type { HelpArticle } from "../models/help-article.model";

export const ADMIN_ARTICLES: HelpArticle[] = [
  {
    id: "setup-checklist",
    title: "Day-1 setup checklist (end to end)",
    audience: "admin",
    chapter: "Company setup",
    summary:
      "Set up a new company in the right order, from company details to your first employees and users.",
    purpose: [
      "A new company needs its building blocks before anyone can be paid. This checklist puts them in the order that avoids dead ends, for example the payroll group exists before you add employees to it.",
      "Typical day 1: company details and payroll rules, one payroll group, one or two shifts, current holidays, statutory tables, then your first five test employees.",
    ],
    permission: ["Organization Setup:View", "Workforce Setup:View"],
    sections: [
      {
        heading: "Why the order matters",
        body: [
          "Most records depend on earlier ones. An employee needs a payroll group, department and shift, and payroll needs statutory tables and holidays. Follow the steps in order and each form will have what it needs.",
        ],
      },
      {
        heading: "The checklist",
        steps: [
          {
            text: "Company Settings: company profile, government numbers, attendance and payroll rules.",
            link: { label: "Company Settings", to: "/setup/company-policy" },
          },
          {
            text: "Organization: Payroll Group, Department, Section, Position, Branch, Project Site.",
            link: { label: "Payroll Group", to: "/setup/payroll-group" },
          },
          {
            text: "Time Shifts: the fixed and flexi/split shifts people work.",
            link: { label: "Fixed Shift", to: "/setup/time-shift/fixed" },
          },
          {
            text: "Holidays, Minimum Wage Rates and Leave Types, then Leave Balances.",
            link: { label: "Holidays", to: "/setup/holiday" },
          },
          {
            text: "Statutory tables: SSS, PHIC, HDMF, WTax and Annual Tax. Check they match the current government rates.",
            link: { label: "SSS Table", to: "/setup/sss-table" },
          },
          {
            text: "Deductions & Income: the deduction and other-income types you use.",
            link: { label: "Deductions", to: "/setup/deduction" },
          },
          {
            text: "Employees: add them one by one or import from Excel.",
            link: { label: "Employees", to: "/setup/employee" },
          },
          {
            text: "Biometrics: register devices and enroll employees (each needs a Bio ID first).",
            link: { label: "Devices", to: "/biometric/manage-devices" },
          },
          {
            text: "Approval Workflows: who approves each request type (optional; without one, anyone with the Approve permission can approve).",
            link: {
              label: "Approval Workflows",
              to: "/setup/approval-workflows",
            },
          },
          {
            text: "Users & access: create roles, then invite employees so they can use My Portal.",
            link: { label: "Users", to: "/security/users" },
          },
        ],
      },
    ],
    related: [
      "company-settings",
      "organization-setup",
      "employees",
      "users-invite",
    ],
  },
  {
    id: "company-settings",
    title: "Company Settings: profile and payroll rules",
    audience: "admin",
    chapter: "Company setup",
    summary:
      "Your company profile, government registration numbers, and the attendance and payroll rules every computation uses.",
    purpose: [
      "Company Settings holds the rules the whole system calculates with: how late is counted, who gets overtime, the premium rates, the 13th month ceiling, and the details printed on government forms.",
      "Example: set the half-day late threshold to 120 minutes, and an employee who arrives two hours late is treated as half-day absent instead of 120 minutes late.",
    ],
    permission: ["Organization Setup:View", "Tenant Members:Manage"],
    paths: ["/setup/company-policy"],
    sections: [
      {
        heading: "Open it",
        steps: [
          {
            text: "Click the gear icon in the top bar, or go to Company Settings.",
            link: { label: "Company Settings", to: "/setup/company-policy" },
          },
        ],
      },
      {
        heading: "The sections",
        body: [
          "Company Settings is split into sections listed on the left, grouped as Company and Policies. Click a section to open it; on a phone, use the dropdown at the top instead.",
        ],
      },
      {
        heading: "What each section holds",
        steps: [
          {
            text: "Company Info: company name, address, TIN, RDO code, SSS / PhilHealth / Pag-IBIG employer numbers and the authorized signatory. These print on government forms and reports.",
          },
          {
            text: "Business Classification (Company Info): pick your Industry, then an optional Sub-industry (the list only shows the ones under your industry), plus your Business Type and Company Size. All optional; changing the industry clears the sub-industry.",
          },
          {
            text: "Address (Company Info): enter the street or building line, then barangay, city or municipality, province and ZIP. Country is Philippines. Older companies that typed the whole address on the first line can leave it as is.",
          },
          {
            text: "Contacts (Company Info): a secondary phone, plus separate HR and Payroll contacts (name, email, phone). Also add the registered business name and website under the company profile.",
          },
          {
            text: "BIR & Registration (Company Info): employer type, whether you are a registered withholding agent, ATC code, branch codes for TIN / SSS / PhilHealth / Pag-IBIG, SEC or DTI number, registration date, and business permit number and expiry date. The expiry date is only recorded for now; there is no reminder yet.",
          },
          {
            text: "Employee ID Numbering (Company Info): Off (the default) keeps Employee No. as free text. Choose Auto-generate, then set an optional prefix (for example EMP; leave it blank for plain 0001, 0002 ...), the number length and whether to include the year, and each new employee gets the next number (EMP-0001, EMP-0002 ...), including employees added by import. You can still type your own number; it must not be used by another employee. Existing numbers are never changed.",
          },
          {
            text: 'Payslip (Company Info): tick "Print the company logo at the top of payslips" to show your uploaded logo beside the company name (on by default; no logo, no change). The Payslip Footer Note is a short line printed at the bottom of every payslip, such as a system-generated or no-signature-required notice.',
          },
          {
            text: "Registered Business Name (Company Info): printed as the employer's Registered Name on the BIR 2316 and the monthly remittance returns. Everywhere else, including payslips, your Company Name is used.",
          },
          {
            text: "Regional Defaults (Company Info): time zone, currency and the weekly rest days. These are pre-filled for the Philippines (Asia/Manila, PHP, Sunday off) and are saved with the company. The time zone is fixed: the system and its daily jobs run on Philippine time. The weekly rest days are the default Rest Day for each new employee.",
          },
          {
            text: "Company Logo (top of Company Info): click Upload, choose a PNG, JPG or WebP, adjust the crop and click Use image. It's saved right away and resized automatically.",
          },
          {
            text: "Attendance & Payroll Policy: overtime rules (OT Inclusion, OT Eligibility), late policy (half-day and whole-day thresholds), night differential, how many manual attendance entries a day are allowed, holiday rules, when SSS/PhilHealth/Pag-IBIG and withholding tax are credited across months, minimum take-home pay, the OT/ND calculation method, and which payroll run takes the deductions when an employee is paid by several clients in one cutoff.",
          },
          {
            text: "Payroll Settings: fiscal year start and end month, the 13th month and bonuses non-taxable ceiling, year-end tax annualization, and which pages appear in My Portal: Announcements, Coworkers, the time and attendance pages, Punch In / Out (off by default; turn it on to let employees punch from My Portal, and set the minutes they must wait between punches, 5 by default), My Payslips, My Leave Credits, My 13th Month Pay, My Deductions, My Cash Bond, My Uniform Allowance and the Leave, Overtime, Official Business, Pass Slip and Loan application pages (all on by default; turn one off to hide its menu item and page from every employee). My Dashboard and My Profile are always available.",
          },
          {
            text: "Rate Multipliers: premium rates for overtime, rest days, holidays and night differential.",
          },
          {
            text: "Attachments: switch on file attachments (images and PDFs) for each feature that needs them. See the Attachments guide.",
          },
          {
            text: "Click Save Settings after changing a tab.",
          },
        ],
        warning:
          "These rules change how every DTR and payroll is computed. Change them before a cutoff, not in the middle of one, and re-run any DTR you already generated for that period.",
        tips: [
          "OT/ND Calculation Method starts on Additive, the most common setup: each hour type is paid at one rate and added up. Switch to Compounded (the DOLE standard) if your company or client agreement requires it. Payroll runs already saved keep the method they were generated with.",
        ],
      },
      {
        heading: "Settings that differ from DOLE standards",
        body: [
          "The system supports rules that differ from the Philippine labor-standard (DOLE) defaults, because companies work under different arrangements and client contracts. When you save one for the first time, a confirmation lists each setting, the DOLE default and your value. The change is saved only after an admin ticks the box and clicks Confirm and save. Don't save leaves everything as it was.",
          "This is asked for: the Additive OT/ND method, any rate multiplier below the DOLE minimum (for example overtime below 1.25 or night differential below 1.10), a client's rate override below the minimum, and a client's SSS, PhilHealth or Pag-IBIG employee share cap.",
          "Each confirmation is recorded with who confirmed it, when, and the values. Saving the same value again doesn't ask again; a different value does.",
        ],
        steps: [
          {
            text: "Open Company Settings › Acknowledged Deviations to see every confirmation, newest first.",
            link: { label: "Company Settings", to: "/setup/company-policy" },
          },
        ],
        warning:
          "Your company, as the employer, is responsible for making sure these settings follow the Labor Code and DOLE rules for your employees. See Terms of Service, Section 4.",
      },
    ],
    related: ["setup-checklist", "terms-of-service"],
  },
  {
    id: "organization-setup",
    title: "Organization: payroll groups, departments and locations",
    audience: "admin",
    chapter: "Company setup",
    summary:
      "Create the payroll groups, departments, sections, positions, branches and project sites employees are assigned to.",
    purpose: [
      "This is how you describe your company's structure. Employees are assigned to these, then DTR, payroll, approvals and reports are all organized by them.",
      "Example: payroll group 'Semi-monthly Staff' (cutoffs 1–15 and 16–end), departments Operations and Finance, branch Makati with project sites Tower A and Tower B.",
    ],
    permission: "Organization Setup:View",
    paths: [
      "/setup/payroll-group",
      "/setup/department",
      "/setup/section",
      "/setup/position",
      "/setup/branch",
      "/setup/project-site",
    ],
    sections: [
      {
        heading: "What each one is for",
        body: [
          "Payroll Group: employees paid together on the same cutoff schedule. You generate the DTR and payroll one payroll group at a time.",
          'Department, Section and Position: where someone sits in the organization. These also drive approval workflows (e.g. "the applicant\'s department head"), and a workflow can be limited to certain departments, sections or positions.',
          "Org chart: these also build the chart under My Portal › Coworkers. Give a department a Parent Department to nest it (e.g. a division) and a Department Head, give a section a Section Head, and set each position's Level (a higher number sits higher in its department). Employees who report to a manager in the same department or section appear under that manager.",
          "Branch and Project Site: where someone works. Attendance uploads are tagged to a branch, and a project site belongs to a branch.",
        ],
      },
      {
        heading: "Mobile Punch Mode (how employees punch from the mobile app)",
        body: [
          "This is off until you turn it on under Setup › Company Policy › Payroll Settings › Mobile App Punching. While it is off, mobile punching is open everywhere and the field is hidden.",
          "Each branch and project site then has a Mobile Punch Mode: Open (tap Punch anytime, like My Portal), Geofence (inside the boundary drawn on the map), QR code (scan the location's QR), NFC (tap the location's tag), Geofence + QR code, or Geofence + NFC. The combined modes need both to pass.",
          "A project site can have its own mode, or be set to Follow branch to use its branch's. The site's own mode always wins, so one strict branch can still have an Open site, and the other way around.",
          "Geofence modes need a boundary drawn on that branch or site. Without one, punching there is blocked, so draw it before you switch the mode on.",
        ],
      },
      {
        heading: "Payroll group cutoffs and statutory deductions",
        body: [
          "A payroll group's cutoff days decide which cutoff of the month a payroll is. The cutoff it ends on counts, not the day it starts.",
          "Statutory deduction schedule decides when SSS, PhilHealth and Pag-IBIG are withheld. Per payroll splits the month's amount across the cutoffs, First cutoff withholds it all on the first cutoff, and Last cutoff withholds it all on the last cutoff. The last cutoff always corrects the month to the exact amount owed.",
          "Cutoffs that don't end at month end (for example 10 and 25) make periods that cross into the next month, such as the 26th to the 10th. Both of a month's periods count toward the month they end in, whatever the cross-month setting in Company Settings says. That setting only applies to groups whose last cutoff is the end of the month.",
          "The rules are the same for employees with DTR and for Fixed employees with No DTR needed. The only difference is the pay the amount is based on: absences, lates and undertime lower it for employees with DTR, while No DTR employees are always counted at their full rate.",
          "Weekly groups: with 50/50 split, a Fixed employee's monthly amount is spread evenly over the group's weekly cutoffs (four cutoffs means a quarter each week), and the last week corrects any difference. First cutoff withholds it all in the first week, and Last cutoff withholds it all in the last week.",
          "Monthly groups have one payroll a month, so every release schedule withholds the whole month on it. A monthly group paid on a day before month end (for example the 25th, for Feb 26–Mar 25) counts toward the month it ends in.",
          "Variable employees: an early payroll can only use the pay earned so far, so it withholds that bracket's amount, and the last payroll of the month tops it up to the full month's bracket. The month's total is always exact.",
        ],
        example: {
          title: "Cutoffs 10 and 25, Last cutoff (sample figures)",
          lines: [
            "March's payrolls are Feb 26–Mar 10 and Mar 11–25. A Fixed employee earning ₱30,000 a month is paid ₱15,000 on each.",
            "Feb 26–Mar 10: no SSS, PhilHealth or Pag-IBIG; it is March's first cutoff.",
            "Mar 11–25: March's full contributions for ₱30,000 are withheld, counting both payrolls' pay.",
            "With Per payroll instead, half is withheld on each, and the two halves add up to exactly March's amount.",
          ],
        },
      },
      {
        heading: "Add one",
        steps: [
          {
            text: "Open the screen under Setup › Organization (e.g. Departments).",
            link: { label: "Departments", to: "/setup/department" },
          },
          {
            text: "Click Add (e.g. Add Department), fill in the code and name, and click Save.",
          },
          {
            text: "To change one, click its edit icon in the list. To remove one, click the delete icon.",
          },
        ],
        tips: [
          "Create Branches before Project Sites, since each project site belongs to a branch.",
          "If you serve clients at specific sites, open the client under Setup › Organization › Clients and pick its Project Sites. A site can belong to one client, and this is optional: leave it empty if you don't split clients by site.",
        ],
      },
    ],
    related: ["time-shifts", "employees"],
  },
  {
    id: "time-shifts",
    title: "Time shifts",
    audience: "admin",
    chapter: "Company setup",
    summary:
      "Define working hours: fixed shifts, and flexi, split or broken shifts.",
    purpose: [
      "A shift tells the system when someone is supposed to work. Late, undertime, overtime and night differential are all measured against it.",
      "A fixed shift has the same hours every day. A flexi shift lets people start within a window but still work a set number of hours. A split (broken) shift has two work periods with a long gap, such as a restaurant shift 10:00–14:00 and 18:00–22:00.",
    ],
    permission: "Time Shift Setup:View",
    paths: ["/setup/time-shift"],
    sections: [
      {
        heading: "Steps",
        steps: [
          {
            text: "Fixed Shifts: the same start and end time every working day, with breaks.",
            link: { label: "Fixed Shifts", to: "/setup/time-shift/fixed" },
          },
          {
            text: "Flexi & Split Shifts: flexible start times, or a day split into separate work periods (a broken shift).",
            link: {
              label: "Flexi & Split Shifts",
              to: "/setup/time-shift/split",
            },
          },
          {
            text: "Create the shift, then pick it as the employee's Permanent Shift on the employee form. Use Work Rotation Plan for people whose shift changes.",
          },
        ],
        tips: [
          "Late, undertime, overtime and night differential are all measured against the shift, so get the times and breaks right before your first DTR.",
        ],
        example: {
          title: "Three shifts",
          table: {
            columns: ["Type", "Hours", "Break", "Good for"],
            rows: [
              ["Fixed", "08:00–17:00", "12:00–13:00", "Office staff"],
              [
                "Flexi",
                "Start 07:00–09:00, work 8 hours",
                "1 hour",
                "People who may arrive any time in the window",
              ],
              [
                "Split (broken)",
                "10:00–14:00 and 18:00–22:00",
                "Gap between periods",
                "Restaurant or event staff",
              ],
            ],
          },
        },
      },
    ],
    related: ["employees", "schedule-changes"],
  },
  {
    id: "holidays-leave",
    title: "Holidays, minimum wage and leave types",
    audience: "admin",
    chapter: "Company setup",
    summary:
      "Holidays for premium pay, minimum wage rates, leave types and starting leave balances.",
    purpose: [
      "These decide how special days and time off are paid. A regular holiday worked is normally paid double (200%), a special non-working holiday worked 130%. Leave types and balances decide how many paid days off each person has.",
      "Example: leave type 'Vacation Leave' with 15 days a year. An employee hired mid-year can start with a balance of 7 days.",
    ],
    permission: [
      "Holiday Setup:View",
      "Leave Setup:View",
      "Minimum Wage Setup:View",
    ],
    paths: [
      "/setup/holiday",
      "/setup/minimum-wage-rate",
      "/setup/leave-type",
      "/setup/leave-balance",
    ],
    sections: [
      {
        heading: "Holidays",
        steps: [
          {
            text: "Add each regular and special holiday for the year, with its date and type.",
            link: { label: "Holidays", to: "/setup/holiday" },
          },
          {
            text: "For a local special holiday (for example a city or provincial holiday), pick every project site it covers in Project Sites. Leave it blank for a nationwide special holiday. Regular holidays always apply everywhere.",
          },
        ],
        tips: [
          "A local holiday follows where the employee is that day: the project site on their Work Rotation Plan for that day, otherwise the site of their first punch, otherwise their assigned site. A reliever sent to a covered site gets the holiday there.",
          "Holiday pay depends on the holiday type and the rules in Company Settings (for example whether attendance the day before is required).",
        ],
        example: {
          title: "Pay on a holiday (daily rate ₱800)",
          note: "These are the standard rates, set under Company Settings › Rate Multipliers. Worked-day rates are shown; unworked regular holidays are normally still paid 100% if the attendance rule is met.",
          table: {
            columns: ["Day", "Worked", "Pay"],
            rows: [
              ["Regular holiday (e.g. Christmas Day)", "Yes", "200% = ₱1,600"],
              ["Special non-working day", "Yes", "130% = ₱1,040"],
              [
                "Special non-working day",
                "No",
                "No work, no pay (unless company policy says otherwise)",
              ],
            ],
          },
        },
      },
      {
        heading: "Minimum wage rates",
        steps: [
          {
            text: "Add the minimum wage rates that apply to your employees' regions.",
            link: {
              label: "Minimum Wage Rates",
              to: "/setup/minimum-wage-rate",
            },
          },
        ],
      },
      {
        heading: "Leave types and balances",
        steps: [
          {
            text: "Create each leave type (e.g. Vacation, Sick) with its rules: how credits are granted, accrued and carried over.",
            link: { label: "Leave Types", to: "/setup/leave-type" },
          },
          {
            text: "Enter each employee's starting balance, e.g. credits carried over from a previous system.",
            link: { label: "Leave Balances", to: "/setup/leave-balance" },
          },
        ],
        tips: [
          "Monthly leave grants, accruals and carry-overs run automatically once a day. You don't need to post them by hand.",
        ],
      },
    ],
    related: ["statutory-tables"],
  },
  {
    id: "statutory-tables",
    title: "Statutory tables and deduction / income types",
    audience: "admin",
    chapter: "Company setup",
    summary:
      "SSS, PhilHealth, Pag-IBIG and tax tables, plus the deduction and other-income types payroll uses.",
    purpose: [
      "Statutory tables are the government's contribution and tax brackets. Payroll looks an employee's pay up in them to find what to deduct for SSS, PhilHealth, Pag-IBIG and withholding tax. Deduction and income types are the labels for loans and allowances.",
      "Example: an employee earning ₱20,000 a month falls in one SSS bracket, which gives the employee and employer shares. When SSS issues new rates, add the new table before the next payroll.",
    ],
    permission: ["Statutory Tables:View", "Deductions & Income Setup:View"],
    paths: [
      "/setup/sss-table",
      "/setup/phic-table",
      "/setup/hdmf-table",
      "/setup/wtax-table",
      "/setup/annual-tax-table",
      "/setup/deduction",
      "/setup/other-income",
    ],
    sections: [
      {
        heading: "Statutory tables",
        steps: [
          {
            text: "Check each table matches the current government rates: SSS, PHIC (PhilHealth), HDMF (Pag-IBIG), WTax and Annual Tax.",
            link: { label: "SSS Table", to: "/setup/sss-table" },
          },
          {
            text: "When the government releases new rates, add the new brackets before the first payroll they apply to.",
          },
        ],
      },
      {
        heading: "Deduction and other-income types",
        steps: [
          {
            text: "Deductions: the kinds of loans and deductions you record (e.g. SSS Loan, Company Loan).",
            link: { label: "Deductions", to: "/setup/deduction" },
          },
          {
            text: "Other Income: allowances and other earnings (e.g. transportation, meal allowance) and whether they're taxable.",
            link: { label: "Other Income", to: "/setup/other-income" },
          },
          {
            text: "Income Class decides whether the amount counts toward SSS, PhilHealth and Pag-IBIG contributions. Regular, Commission and Others count. De Minimis, Reimbursement and Special Bonus don't. The rule is the same for every payroll frequency, and the Income Class list shows a tag beside each class.",
          },
        ],
        example: {
          title: "Which allowances raise the contributions (sample figures)",
          lines: [
            "A semi-monthly cutoff pays ₱15,000 basic, a ₱2,000 Regular allowance (e.g. a fixed transportation allowance), ₱1,000 De Minimis (rice subsidy) and ₱500 Reimbursement.",
            "Gross pay is ₱18,500, but SSS, PhilHealth and Pag-IBIG are worked out from ₱17,000: basic plus the Regular allowance only.",
            "Pick De Minimis only for benefits within the BIR de minimis limits, and Reimbursement only for refunds of the employee's own expenses. Anything else that is really pay belongs in Regular, Commission or Others.",
          ],
        },
      },
      {
        heading: "Keeping the tables current",
        body: [
          "Your company maintains these tables. When SSS, PhilHealth, Pag-IBIG or the BIR issues new rates, add the new brackets with the date they take effect, before the first payroll that needs them. Every statutory table page shows this reminder.",
        ],
        warning:
          "Payroll deducts exactly what your tables say. An outdated table means wrong deductions and remittances, which are your company's responsibility (Terms of Service, Section 5).",
      },
    ],
    related: ["loans-income", "terms-of-service"],
  },
  {
    id: "employees",
    title: "Employees: adding, importing and the 201 file",
    audience: "admin",
    chapter: "People",
    summary:
      "Add employees one by one or import from Excel, set pay and schedules, mark confidential employees and print the 201 file.",
    purpose: [
      "The employee record is the master data payroll reads: pay rate, shift, rest days, payroll group and government numbers. A wrong rate or shift here means a wrong payslip.",
      "Example: Juan Dela Cruz, Monthly rate ₱20,800, Permanent Shift 8:00–17:00, rest day Sunday, Bio ID 1042, payroll group Semi-monthly Staff.",
    ],
    permission: "Workforce Setup:View",
    paths: ["/setup/employee"],
    sections: [
      {
        heading: "Add one employee",
        steps: [
          {
            text: "Open Employees and click Add Employee.",
            link: { label: "Employee", to: "/setup/employee" },
          },
          {
            text: "The form is split into sections listed on the left, grouped as Profile, Job, Pay, Background and Files. Click a section to open it; on a phone, use the dropdown at the top instead. A red number beside a section means it has fields to fix before you can save.",
          },
          {
            text: "When you open an employee from the list, the Previous and Next arrows at the top move to the neighbouring employee on the same list page, keeping your search and filters.",
          },
          {
            text: "Personal Information: name, gender, date of birth, email address and contact details. The email is the one they'll sign in with.",
          },
          {
            text: "Photo: click the round picture at the top, choose a PNG, JPG or WebP, frame the face and click Use image. It's resized automatically and location details from phone photos are removed. On a new employee it's saved together with the record.",
          },
          {
            text: "Employment Details: Payroll Group, Department, Position, Branch, Project Site, Reports To, Permanent Shift, rest days, Employment Status and Hire Date.",
          },
          {
            text: "Compensation: Salary Type, Monthly or Daily Rate, Daily Rate Mode and Factor Days, Mode of Payment and bank details.",
          },
          {
            text: "Gov't IDs & Rates: SSS, PhilHealth, Pag-IBIG and TIN numbers, and how each contribution is computed.",
          },
          { text: "Click Save." },
        ],
        tips: [
          "Give each employee a Bio ID matching their ID on the biometric device, or their punches won't be linked to them.",
          "Background and Files sections (Dependents, Education, Skills, Employment History, Documents, Assets) show a lock until the employee is saved, then can be filled in later. Documents and Assets can hold scanned files once attachments are switched on for them in Company Settings.",
        ],
      },
      {
        heading: "Payroll only (no DTR)",
        body: [
          "Owners, shareholders, directors, officers and consultants are often paid without time records. On the employee form, turn on Payroll only (no DTR), choose a Category and the dates it applies (Effective from, and optionally Effective until). It requires a Fixed salary type.",
          "While it applies, the employee is paid through payroll and never appears in DTR coverage, absences or the DTR Generate tab.",
        ],
      },
      {
        heading: "Import many from Excel",
        steps: [
          { text: "On the Employee list, click Import › Download Template." },
          { text: "Fill in one row per employee and save the file." },
          {
            text: "Click Import › Upload File. Review the preview: rows with errors are flagged and can be exported to fix.",
          },
          { text: "Confirm to save the valid rows." },
        ],
      },
      {
        heading: "Confidential employees",
        body: [
          "Turn on Confidential for employees whose records should be hidden (e.g. executives). Only people with a Confidential Records permission can see them. Reports and payroll totals that leave them out show a notice saying so.",
        ],
      },
      {
        heading: "201 file",
        steps: [
          {
            text: "In the Employee list, use the row's print action to open the employee's 201 file as a PDF in a new tab.",
          },
        ],
      },
    ],
    related: ["users-invite", "biometric-setup"],
  },
  {
    id: "biometric-setup",
    title: "Biometric devices and enrollment",
    audience: "admin",
    chapter: "People",
    summary:
      "Register biometric devices, enroll fingerprints and faces, and keep devices in sync.",
    purpose: [
      "Biometric devices are the time clocks that record punches. Registering them connects their punches to your company, and enrolling gives each employee a fingerprint or face the device recognises.",
      "Example: register the Makati device by serial number, give Juan the Bio ID 1042, enroll his fingerprint, and his punches appear in Attendance Logs automatically.",
    ],
    permission: "Biometric Setup:View",
    paths: ["/biometric/manage-devices", "/enroll-biometrics"],
    sections: [
      {
        heading: "Register a device",
        steps: [
          {
            text: "Open Setup › Biometrics › Devices and click Register Device. Enter the device's serial number and assign it to a branch.",
            link: { label: "Devices", to: "/biometric/manage-devices" },
          },
        ],
      },
      {
        heading: "Enroll employees",
        steps: [
          {
            text: "Make sure the employee has a Bio ID on their employee record. Only employees with a Bio ID appear here.",
          },
          {
            text: "Open Enroll Biometrics, choose the device, and use the Enroll tab to register a fingerprint or face.",
            link: { label: "Enroll Biometrics", to: "/enroll-biometrics" },
          },
          {
            text: "Use Sync to push employees and fingerprint or face templates to other devices, and Query Templates to check what a device already has.",
          },
          {
            text: "Commands are queued and run when the device next connects. Check progress in Pending Commands.",
          },
        ],
      },
      {
        heading: "If your plan doesn't include HRMS",
        body: [
          "Devices keep connecting and sending data, but the system acknowledges it and discards it. Nothing is saved. The device clears its own memory, so these punches are not re-sent automatically later.",
        ],
        warning:
          "Punches sent while HRMS is off aren't synced back when you turn HRMS on. Upload the missed logs manually in Upload Attendance.",
      },
    ],
    related: ["attendance-upload"],
  },
  {
    id: "approval-workflows",
    title: "Approval workflows",
    audience: "admin",
    chapter: "Access & approvals",
    summary:
      "Decide how many approval levels each request type needs and who approves at each step.",
    purpose: [
      "Workflows decide who must say yes before a request counts. Without one, anyone with the Approve permission can approve. With one you control the levels and the people.",
      "Example: Leave of 3 days or more: Step 1 the applicant's manager, Step 2 the department head, Step 3 HR. Leave under 3 days: manager only. Add a reminder after 24 hours so requests don't stall.",
    ],
    permission: "Approval Workflows:View",
    paths: ["/setup/approval-workflows"],
    sections: [
      {
        heading: "How approvals work",
        body: [
          "Each application type (Leave, Overtime, Official Business, Pass Slip, Loans, Profile Update, DTR and payroll batches) can have its own workflow. Requests no workflow covers keep single-step approval: anyone with that type's Approve permission can approve.",
          "You can run several workflows for the same type at once, each limited to the people it is for -- for example one for the Cebu branch, another for a client's project sites, and a company-wide default for everyone else.",
        ],
      },
      {
        heading: "Who a workflow applies to",
        body: [
          'On a workflow\'s page, "Applies to" lists the conditions that limit it: Branch, Department, Client, Project Site, Payroll Group, Position, Section, Employment Status, or Specific Employees (handy as a custom group). A person must meet every condition; inside one condition any of the chosen values will do. A workflow with no conditions applies to everyone -- the company-wide default.',
          "When someone fits more than one active workflow, the one with the lowest Priority number is used. Equal priorities are settled by the more specific workflow (more conditions), then the older one. The list warns when two workflows overlap at the same priority.",
          "DTR and payroll posting have no applicant, so they follow the Payroll Group of the batch: use a Payroll Group condition (or no condition) for those types.",
          "A request keeps the workflow it started on even if the employee later transfers; the next request follows whichever workflow fits then.",
        ],
        tips: [
          "Not sure which workflow someone gets? Click Which workflow applies?, pick the employee and the type, and it shows the match and the order workflows were tried.",
        ],
      },
      {
        heading: "Approvers that depend on the applicant",
        body: [
          "A step can point at someone who is worked out for each request instead of a fixed person: the applicant's manager, their manager 2 or more levels up (a skip-level approval), or the head of their department (or its parent department), section, branch, project site or client.",
          "Department and Section heads are set on those records. The head of a Branch, Project Site or Client is the Head field on that record's setup page -- set it there, or steps that use it can't find anyone.",
          "If the applicant has no manager recorded, or nobody is set as the head, choose what the step does under If no approver is found: Wait for an admin to reassign it (the default), Skip this step and move on, or Use a fallback person. The first step can't be skipped. If every remaining step is skipped, the request is approved.",
          "Someone is never their own approver: a branch head filing a request has the step resolve to nobody, so the choice above applies.",
        ],
        tips: [
          "A skipped step shows in the request's Approval Progress as skipped. A step waiting because no approver was found says so there, and an Owner or Admin can reassign it.",
        ],
      },
      {
        heading: "Steps and flows that depend on the request",
        body: [
          'A step can apply only when the request is big enough. On any step after the first, set Applies to a measure of the request: Days (leave, official business), Hours (overtime, pass slip) or Amount (loans, official business cost), then a comparison and a number -- for example "Days is at least 5". When the request doesn\'t meet it, the step is skipped and the request moves straight on; if no step is left, it is approved.',
          "On a leave workflow, Applies to also offers Leave Type: use it to give sick leave a different flow from vacation leave.",
          "The first step always applies to every request.",
          "A request's days, hours and amount are read when it is filed and again whenever it is edited. Editing a request after someone has approved sends it back to the first step, and an edit that moves it to a different workflow (a different leave type, say) starts it again on that one.",
        ],
        tips: [
          "A skipped step shows in the request's Approval Progress, marked as skipped and not needed for that request.",
          "Requests filed before this existed have no recorded days or amount, so every step applies to them.",
        ],
      },
      {
        heading: "Approval from several groups at once",
        body: [
          "Sometimes one step needs more than one kind of approver -- for example one person from HR and one from Finance. On the step, click Add approver group under Also needs approval from. The step's own approver is the first group; each group you add is another, and you can add up to 5.",
          "The step is approved only when every group has its quorum (its Min Approvals), in any order. Each group can be a person, a department, a position, or a per-applicant approver such as the applicant's branch head.",
          "A person who belongs to two groups fills only one of them. If any approver declines, the whole request is declined.",
          "A per-applicant group set to Don't require this group is left out when no approver can be found for that applicant; the others still need to approve. If every group is left out the step is skipped.",
        ],
        tips: [
          "The request's Approval Progress shows each group's progress while it waits, for example \"Finance 1/2 · HR ✓\", so you can see who is still needed.",
          "An Owner or Admin acting on the request, the approver it was reassigned to, and the person a late step escalated to each decide for the whole step at once.",
          "Everyone in every group is notified when the step opens.",
        ],
      },
      {
        heading: "Reminders and escalation",
        body: [
          'A request can sit with an approver for days. On any step you can set Remind after (hours): once the request has been at that step that long, its approvers get the "waiting on you" notice again with how long it has waited. Add then every (hours) to keep reminding, up to 10 times.',
          "Escalate after (hours) with Escalate to opens the step to one more person once it has waited that long. They are told, can approve or decline it from My Approvals, and the timeline records the escalation. The step's own approvers can still act: escalating adds a person, it doesn't take the step away from anyone.",
          "The hours count from when the request reached that step, so each step has its own clock; the clock starts again when the request moves on. Reminders and escalation are checked every hour.",
        ],
        tips: [
          "Auto-approving after a delay isn't offered on purpose: someone should always make the decision.",
          "Set both: for example remind after 24 hours, then every 24, and escalate to the department head after 72.",
          "A step that found no approver (see Approvers that depend on the applicant) has nobody to remind; use Escalate to for those.",
        ],
      },
      {
        heading: "Create a workflow",
        steps: [
          {
            text: "Open Approval Workflows and click to create a new one.",
            link: {
              label: "Approval Workflows",
              to: "/setup/approval-workflows",
            },
          },
          { text: "Choose the application type." },
          {
            text: "Under Applies to, add conditions to limit it to certain branches, sites, departments and so on -- or leave it empty for everyone. Set a Priority if it overlaps another workflow.",
          },
          {
            text: "Add steps in order. For each step choose who approves: a specific Person, a Department, a Position, the applicant's manager (or their manager N levels up), the applicant's department, or the head of the applicant's department, section, branch, project site or client. Also choose whether a note is None, Optional or Required.",
          },
          {
            text: "Save. It's saved as inactive; click Activate in the list and new requests from the people it covers follow it. Other active workflows of the same type are not affected.",
          },
        ],
        tips: [
          "Owners and Admins can reassign a stuck step to another approver from the request's Approval Progress.",
        ],
      },
      {
        heading: "Changing a workflow that's in use",
        body: [
          "While requests are still going through a workflow, it can't be edited -- they follow its steps as they go. The list shows how many are pending and offers View instead of Edit, so you can still see every step.",
          "Once none are pending, Edit is back: the change applies to the next applications. Requests already finished keep their record of who approved what.",
        ],
        steps: [
          {
            text: "To change it now, click Copy (or Copy as new version on the workflow's page). Adjust the copy and save it; it's saved as inactive. Activating a copy with the same conditions replaces the original; a copy with different conditions runs alongside it.",
          },
          {
            text: "Activate now: new requests use the copy right away, and requests already pending finish on the old one.",
          },
          {
            text: "Or Switch when idle: new requests keep using the current workflow until it has no pending requests, then the copy takes over automatically. Cancel it any time from the tag in the list.",
          },
        ],
        tips: [
          "A workflow that past requests used can't be deleted -- deactivate it instead. One that was never used can be deleted.",
          "When an employee withdraws a pending request, it stops counting as pending.",
        ],
      },
    ],
    related: ["approve-requests"],
  },
  {
    id: "users-invite",
    title: "Inviting users and managing access",
    audience: "admin",
    chapter: "Access & approvals",
    summary:
      "Invite employees and client logins, choose their role, and manage access from the Users list.",
    purpose: [
      "A login is how someone enters the system; a role decides what they can do. Inviting by email makes sure only the people you choose can join.",
      "Example: invite the 20 staff emails at once with the Employee role, then invite finance@company.com with the custom role 'Payroll Officer'.",
    ],
    permission: ["Users:View", "Tenant Members:Manage"],
    paths: ["/security/users"],
    sections: [
      {
        heading: "Invite people",
        steps: [
          {
            text: "Open Administration › Users & Access › Users and click Invite Users.",
            link: { label: "Users", to: "/security/users" },
          },
          {
            text: "Choose Employee or Client. For client logins, pick the client they belong to.",
          },
          {
            text: "Paste or type email addresses, up to 100 at once. Each becomes a chip that shows whether it can be invited (for employees, the email must match an employee record).",
          },
          {
            text: "The role defaults to Employee or Client. Only people with the Assign Role permission can choose another role, and only one whose permissions they hold themselves.",
          },
          {
            text: "Click Send Invitations. Each person gets an email with a link valid for 7 days.",
          },
        ],
        tips: ["You can also invite a single employee from the Employee list."],
      },
      {
        heading: "Manage existing users",
        steps: [
          {
            text: "Use the tabs to see All, Employees, Clients or Others. Type and Linked To show which employee or client each login belongs to.",
          },
          {
            text: "Turn the status switch off to revoke someone's access, or on to restore it.",
          },
          {
            text: "Tick several rows to Activate, Revoke or Remove them together.",
          },
          {
            text: "Click the edit icon to change a user's roles.",
          },
        ],
        warning:
          "The Owner can't be changed or removed, and you can't give anyone a role with more permissions than you have yourself.",
      },
    ],
    related: ["roles-permissions", "audit-trail"],
  },
  {
    id: "roles-permissions",
    title: "Roles and permissions",
    audience: "admin",
    chapter: "Access & approvals",
    summary:
      "Create custom roles, choose exactly which screens and actions they allow, and grant confidential-record access.",
    purpose: [
      "Roles keep people to what their job needs. A role is a named set of permissions, and each permission is one action on one screen.",
      "Example: role 'Payroll Officer' gets View, Create and Export on Payroll Run and Payroll Summary, plus View on Employees, but no Delete and no access to Company Settings.",
    ],
    permission: ["Roles:View", "Tenant Roles:Manage"],
    paths: ["/security/roles", "/security/permissions"],
    sections: [
      {
        heading: "Built-in roles",
        body: [
          "Owner has full access. Admin manages the company (everything except confidential records). Employee has My Portal. Client and Member have no permissions until you give them some.",
        ],
      },
      {
        heading: "Create a custom role",
        steps: [
          {
            text: 'Open Administration › Users & Access › Roles and create a role (e.g. "Payroll Officer").',
            link: { label: "Roles", to: "/security/roles" },
          },
          {
            text: "Tick the permissions it needs. Each screen has actions such as View, Create, Edit, Delete, Approve or Export. Hover over a permission to see what it allows.",
          },
          {
            text: "Save, then give the role to users from Administration › Users & Access › Users.",
          },
        ],
      },
      {
        heading: "Confidential records",
        body: [
          "Access sees everything about confidential employees, including pay. Operations sees their attendance, schedules and requests, but not pay. Entries can manage their cash bond, allowances and loans, but not pay. Only the Owner decides which roles get these.",
        ],
      },
    ],
    related: ["users-invite"],
  },
  {
    id: "audit-trail",
    title: "Audit trail",
    audience: "admin",
    chapter: "Access & approvals",
    summary:
      "See who changed what and when: sign-ins, record changes, approvals and permission edits.",
    purpose: [
      "The audit trail is the company's record of changes. Use it to answer 'who changed this employee's rate?' or to investigate an unexpected figure.",
      "Sample entry: 2026-10-21 14:32, Maria Santos, Update, Employee Juan Dela Cruz, Monthly rate: ₱20,000 → ₱20,800.",
    ],
    permission: "Audit Trail:View",
    paths: ["/security/audit"],
    sections: [
      {
        heading: "Steps",
        steps: [
          {
            text: "Open Administration › Users & Access › Audit Trail.",
            link: { label: "Audit", to: "/security/audit" },
          },
          {
            text: "Filter by date, action (e.g. Update, Approve, Login), module or user.",
          },
          {
            text: "Open an entry to see exactly which fields changed, with old and new values.",
          },
        ],
        tips: [
          "From Administration › Users & Access › Users, the activity icon on a user opens the audit trail filtered to that person.",
        ],
      },
    ],
  },
  {
    id: "billing-plans",
    title: "Billing: plans, payments and read-only mode",
    audience: "admin",
    chapter: "Billing & storage",
    summary:
      "Choose or change your plan, pay online, see what each plan includes and what happens when a payment is overdue.",
    purpose: [
      "Billing is where the company pays for its subscription. Your plan decides which parts of the system, how many employees and how much storage you get.",
      "Example: you upgrade from Timekeeping to Payroll 10 days into the month. The unused days of the old plan are credited against the new price, so you only pay the difference.",
    ],
    permission: "Billing:View",
    paths: ["/billing"],
    sections: [
      {
        heading: "Your plan at a glance",
        steps: [
          {
            text: "Open Administration › Subscription › Billing. Current plan shows your plan, its status (Free trial, Active, Payment overdue, Suspended and so on), when the current period or trial ends and your next payment.",
            link: { label: "Billing", to: "/billing" },
          },
          {
            text: "Usage compares what you use with your plan's limits: employees (counted across all your companies together), admin users and biometric devices (per company), companies and file storage.",
          },
          {
            text: "Payments lists every payment, including storage payments and refunds, with an itemized breakdown.",
          },
        ],
      },
      {
        heading: "Choose or change a plan",
        steps: [
          {
            text: "Click Choose a plan (or Change plan). Pick Monthly or Annual; annual plans are usually cheaper per year, and a plan may carry a badge showing the saving. One price covers your whole account, not each employee.",
          },
          {
            text: "Open a plan card to see its Systems (such as HRMS) and its HRMS features. A feature your plan doesn't include shows a lock on its menu item.",
          },
          {
            text: "Upgrading in the middle of a period credits the unused days of your current plan against the new price. The checkout shows the credit, and any excess extends your new plan by extra days.",
          },
          {
            text: "Click Pay to pay online. The plan is active as soon as the payment goes through and a receipt is emailed. You can also Pay later, or pay by bank transfer using the instructions shown.",
          },
        ],
        tips: [
          "Cancel subscription stops renewal. Keep my subscription undoes it before it takes effect, and Withdraw change cancels a pending plan change.",
        ],
      },
      {
        heading: "When payment is overdue: read-only mode",
        body: [
          "If a trial ends or a payment isn't made, the company goes read-only. You can still view and export your data, but changes aren't saved, and a banner explains why. Paying or renewing restores full access.",
          "While read-only, suspended or on hold, nothing can be changed anywhere: Add, Edit, Delete, Save, Approve, Upload, Post and the other change buttons are hidden, records open in View mode with every field locked, and in My Portal nothing can be filed, edited, withdrawn, acknowledged or punched. They come back as soon as access is restored.",
          "The top bar also keeps only the company switcher and the light/dark toggle: Search, Help, Notifications, Company Settings and New company are hidden until the company is active again.",
          "If the plan doesn't include HRMS, every HRMS page is locked, but Billing stays open so you can fix it.",
        ],
        warning:
          "A company left unpaid for a long time is eventually locked and its data archived. Renew before then.",
      },
      {
        heading: "Fees, refunds and the Terms of Service",
        body: [
          "Confirming a plan means agreeing to the Terms of Service, including the fees, automatic renewal (when you turn it on) and the no-refund rule: payments aren't refunded for unused time, features or storage unless we agree otherwise in writing or the law requires it.",
          "The grace period, read-only mode and the date a locked company's data may be deleted are set out in the Terms, and the dates that apply to your account are shown on the Billing page. Export anything you need before then.",
        ],
      },
    ],
    related: ["storage-manager", "faq", "terms-of-service"],
  },
  {
    id: "storage-manager",
    title: "Storage: usage, add-ons and cleaning up files",
    audience: "admin",
    chapter: "Billing & storage",
    summary:
      "See how much file storage you use, add more, and delete files you no longer need.",
    purpose: [
      "Photos, logos and attached documents use shared storage. When it is full, new uploads are blocked, so this page shows what is using space and lets you add more or clean up.",
      "Example: your 50 GB is 95% used. Delete last year's decided leave attachments, or add one more 50 GB block.",
    ],
    permission: ["Storage:View", "Storage:Manage"],
    paths: ["/billing/storage"],
    sections: [
      {
        heading: "How storage works",
        body: [
          "File storage is shared by all your companies: your plan's capacity plus any storage blocks you add. Photos, logos and attached files all count. A banner appears as you fill up; when storage runs out, new uploads are blocked.",
        ],
      },
      {
        heading: "See what is using it",
        steps: [
          {
            text: "Open Administration › Subscription › Storage. The gauge shows used and total storage, split into plan storage and add-ons.",
            link: { label: "Storage", to: "/billing/storage" },
          },
          {
            text: "Used by company shows how each of your companies contributes. To clean up another company, switch to it first.",
          },
          {
            text: "The table lists categories of files. Open one to see the years its files were stored in.",
          },
        ],
      },
      {
        heading: "Add or reduce storage",
        steps: [
          {
            text: "Click Add storage, choose the number of blocks and Pay. You pay only for the days left in your billing period; from the next renewal the blocks are billed with your plan.",
          },
          {
            text: "To keep fewer blocks, click Reduce. It takes effect at the end of the period, and you keep what you paid for until then. Keep these blocks cancels a pending reduction.",
          },
        ],
        warning:
          "If you use more than your storage will be after a reduction, free up space before the renewal date or uploads will be blocked.",
      },
      {
        heading: "Delete files you no longer need",
        steps: [
          {
            text: "Click View files on a category to see its files, or Delete on a year to clear all of it. Tick files and click Delete selected.",
          },
          {
            text: "Confirm. Only the files are deleted; the records they belong to (an application, an employee) stay.",
          },
        ],
        tips: [
          "Unused files belong to no record, such as an upload whose form was never saved. Deleting them changes nothing else.",
          "Files on a record that is already decided, such as an approved application, are tagged Decided record. You must type the confirmation word to delete them.",
          "Without the Manage permission you can see what uses storage but not delete. Ask an Owner or admin.",
        ],
        warning: "Deleted files can't be recovered.",
      },
    ],
    related: ["billing-plans", "attachments"],
  },
  {
    id: "attachments",
    title: "Attachments: files on records",
    audience: "admin",
    chapter: "Billing & storage",
    summary:
      "Allow images and PDFs on employee documents, assets, leave, pass slips and other records, one feature at a time.",
    purpose: [
      "Attachments let employees and HR keep proof with a record, such as a medical certificate on a sick leave. They are on by default for every feature; switch off any you do not need.",
      "Example: switch on Leave and Pass Slips. Employees can now attach a medical certificate (PDF, up to 5 MB) when filing sick leave.",
    ],
    permission: ["Organization Setup:View", "Tenant Members:Manage"],
    paths: ["/setup/company-policy"],
    sections: [
      {
        heading: "Turn it on",
        steps: [
          {
            text: "Open Company Settings › Attachments.",
            link: { label: "Company Settings", to: "/setup/company-policy" },
          },
          {
            text: "Switch on each feature that should accept files: Employee Documents, Employee Assets, Leave, Profile Updates, Travel Orders, Pass Slips, Undertime, Overtime, Loans, Cash Bonds and Other Income.",
          },
          { text: "Save your changes." },
        ],
        body: [
          "Features start switched off. Each file can be a PNG, JPG or WebP image, or a PDF, up to 5 MB, with at most 5 files per record. Turning a feature off keeps the files it already has and only stops new uploads.",
        ],
      },
      {
        heading: "Using them",
        body: [
          "Once on, an upload field appears on that feature's form, including the employee's request forms in My Portal. Click a file to open it. Attached files use your company's storage, so check Storage now and then.",
        ],
      },
    ],
    related: ["storage-manager", "company-settings"],
  },
  {
    id: "announcements",
    title: "Company announcements",
    audience: "admin",
    chapter: "Communication",
    summary:
      "Send notices to everyone or to chosen groups, schedule them and track who has read and acknowledged them.",
    purpose: [
      "Announcements replace group chats for official notices, and show you who has actually read them. Ask for acknowledgement when you need proof they were informed.",
      "Example: 'New attendance policy starts Nov 1', priority Important, audience: all employees of the Makati branch, acknowledge by Oct 30. Remind those who haven't acknowledged on Oct 28.",
    ],
    permission: "Announcements:View",
    paths: ["/communication/announcements"],
    sections: [
      {
        heading: "Create and publish",
        steps: [
          {
            text: "Open Announcements and click New Announcement.",
            link: {
              label: "Announcements",
              to: "/communication/announcements",
            },
          },
          {
            text: "Enter a title and message. It's plain text; line breaks are kept and links become clickable. Choose a priority: Normal, Important or Urgent.",
          },
          {
            text: "Choose the audience: all employees, or rules by department, position, branch, project site, client, section, employment status or specific employees. A preview shows who it reaches.",
          },
          {
            text: "Optionally ask for acknowledgement, with an Acknowledge by date. An Urgent announcement that asks for acknowledgement blocks employees until they acknowledge it.",
          },
          {
            text: "Save it as a draft, schedule it, or publish it now. Published announcements reach employees right away with a notification.",
          },
        ],
      },
      {
        heading: "After it is out",
        steps: [
          {
            text: "The Active, Unpublished, Archived and Recently deleted tabs organize the list. An announcement is Draft, Scheduled, Published, Unpublished, Archived or Deleted.",
          },
          {
            text: "Open one to see who has read and acknowledged it, and send a reminder to people who haven't.",
          },
          {
            text: "You can edit a published announcement and it is marked Edited. Who it went to can't change, so duplicate it to reach another group. You can also unpublish it, or have it archive automatically at a time you set.",
          },
        ],
      },
      {
        heading: "What employees see",
        body: [
          "Employees read announcements under Announcements in My Portal, and get a notification when one is published.",
        ],
      },
    ],
    related: ["portal-overview"],
  },
  {
    id: "client-services",
    title: "Client Services: billing your clients",
    audience: "admin",
    chapter: "Communication",
    summary:
      "Invite clients, verify their DTR, prepare invoices and record payments from the Client Services menu.",
    purpose: [
      "For companies that supply manpower to clients (security, outsourcing). Clients confirm the hours worked, you invoice from the verified hours, and payments are recorded against invoices.",
      "Example: each cutoff the client verifies the guards' DTR, you prepare the invoice from the verified hours, and when they pay you record it against that invoice.",
    ],
    permission: "clientportal:Client:Manage",
    paths: ["/client-portal/clients"],
    sections: [
      {
        heading: "What is in it",
        steps: [
          {
            text: "Portal Clients: the clients you bill, and their portal logins.",
            link: { label: "Portal Clients", to: "/client-portal/clients" },
          },
          {
            text: "DTR Verification: hours clients confirm or dispute before you bill.",
            link: {
              label: "DTR Verification",
              to: "/client-portal/verification",
            },
          },
          {
            text: "Billing Setup: each client's billing details, payment terms, taxes and contract rates.",
            link: {
              label: "Billing Setup",
              to: "/client-portal/billing-setup",
            },
          },
          {
            text: "Invoices: prepare from verified time logs or upload your own, review and approve, then send to the client or keep as a record.",
            link: { label: "Invoices", to: "/client-portal/invoices" },
          },
          {
            text: "Payments: record payments, review the proofs of payment clients upload and apply them to invoices.",
            link: { label: "Payments", to: "/client-portal/payments" },
          },
          {
            text: "Also here: Disputes, Statements, Billing Reports, Manpower Requests, Guard Documents, Service Scorecard, Notices, Integrations and Connection.",
          },
        ],
      },
      {
        heading: "Invite a client",
        body: [
          "Invite client logins from Administration › Users & Access › Users: choose Client and pick the client. Clients you create in Setup are shared with the portal automatically. Connection shows whether the link is working.",
        ],
        tips: [
          "The Client Services menu appears only when your plan includes the Client Portal.",
        ],
      },
    ],
    related: ["users-invite"],
  },
];
