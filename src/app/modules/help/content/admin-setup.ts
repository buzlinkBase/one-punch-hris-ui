import type { HelpArticle } from "../models/help-article.model";

export const ADMIN_ARTICLES: HelpArticle[] = [
  {
    id: "setup-checklist",
    title: "Day-1 setup checklist (end to end)",
    audience: "admin",
    chapter: "Company setup",
    summary:
      "Set up a new company in the right order, from company details to your first employees and users.",
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
            text: "1. Company Settings: company profile, government numbers, attendance and payroll rules.",
            link: { label: "Company Settings", to: "/setup/company-policy" },
          },
          {
            text: "2. Organization: Payroll Group, Department, Section, Position, Branch, Project Site.",
            link: { label: "Payroll Group", to: "/setup/payroll-group" },
          },
          {
            text: "3. Time Shifts: the fixed and flexi/split shifts people work.",
            link: { label: "Fixed Shift", to: "/setup/time-shift/fixed" },
          },
          {
            text: "4. Holidays, Minimum Wage Rates and Leave Types, then Leave Balances.",
            link: { label: "Holidays", to: "/setup/holiday" },
          },
          {
            text: "5. Statutory tables: SSS, PHIC, HDMF, WTax and Annual Tax. Check they match the current government rates.",
            link: { label: "SSS Table", to: "/setup/sss-table" },
          },
          {
            text: "6. Deductions & Income: the deduction and other-income types you use.",
            link: { label: "Deductions", to: "/setup/deduction" },
          },
          {
            text: "7. Employees: add them one by one or import from Excel.",
            link: { label: "Employee", to: "/setup/employee" },
          },
          {
            text: "8. Biometric: register devices and enroll employees (each needs a Bio ID first).",
            link: { label: "Manage Devices", to: "/biometric/manage-devices" },
          },
          {
            text: "9. Approval Workflows: who approves each request type (optional; without one, anyone with the Approve permission can approve).",
            link: {
              label: "Approval Workflows",
              to: "/setup/approval-workflows",
            },
          },
          {
            text: "10. Users & access: create roles, then invite employees so they can use My Portal.",
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
        heading: "The tabs",
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
            text: "Attendance & Payroll Policy: overtime rules (OT Inclusion, OT Eligibility), late policy (half-day and whole-day thresholds), night differential, how many manual attendance entries a day are allowed, holiday rules, when SSS/PhilHealth/Pag-IBIG and withholding tax are credited across months, minimum take-home pay, and the OT/ND calculation method.",
          },
          {
            text: "Payroll Settings: fiscal year start and end month, the 13th month and bonuses non-taxable ceiling, year-end tax annualization, and which of My 13th Month Pay, My Cash Bond and My Uniform Allowance appear in My Portal (all on by default; turn one off to hide it from every employee).",
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
    ],
    related: ["setup-checklist"],
  },
  {
    id: "organization-setup",
    title: "Organization: payroll groups, departments and locations",
    audience: "admin",
    chapter: "Company setup",
    summary:
      "Create the payroll groups, departments, sections, positions, branches and project sites employees are assigned to.",
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
          'Department, Section and Position: where someone sits in the organization. These also drive approval workflows (e.g. "the applicant\'s department head").',
          "Branch and Project Site: where someone works. Attendance uploads are tagged to a branch, and a project site belongs to a branch.",
        ],
      },
      {
        heading: "Add one",
        steps: [
          {
            text: "Open the screen under Setup › Organization (e.g. Department).",
            link: { label: "Department", to: "/setup/department" },
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
    permission: "Time Shift Setup:View",
    paths: ["/setup/time-shift"],
    sections: [
      {
        heading: "Steps",
        steps: [
          {
            text: "Fixed Shift: the same start and end time every working day, with breaks.",
            link: { label: "Fixed Shift", to: "/setup/time-shift/fixed" },
          },
          {
            text: "Flexi/Split/Broken Shift: flexible start times, or a day split into separate work periods.",
            link: {
              label: "Flexi/Split/Broken Shift",
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
        ],
        tips: [
          "Holiday pay depends on the holiday type and the rules in Company Settings (for example whether attendance the day before is required).",
        ],
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
        ],
      },
    ],
    related: ["loans-income"],
  },
  {
    id: "employees",
    title: "Employees: adding, importing and the 201 file",
    audience: "admin",
    chapter: "People",
    summary:
      "Add employees one by one or import from Excel, set pay and schedules, mark confidential employees and print the 201 file.",
    permission: "Workforce Setup:View",
    paths: ["/setup/employee"],
    sections: [
      {
        heading: "Add one employee",
        steps: [
          {
            text: "Open Setup › Workforce › Employee and click Add Employee.",
            link: { label: "Employee", to: "/setup/employee" },
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
          "Other tabs (Dependents, Education, Documents, Assets and more) can be filled in later. Documents and Assets can hold scanned files once attachments are switched on for them in Company Settings.",
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
    permission: "Biometric Setup:View",
    paths: ["/biometric/manage-devices", "/enroll-biometrics"],
    sections: [
      {
        heading: "Register a device",
        steps: [
          {
            text: "Open Manage Devices and click Register Device. Enter the device's serial number and assign it to a branch.",
            link: { label: "Manage Devices", to: "/biometric/manage-devices" },
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
    permission: "Approval Workflows:View",
    paths: ["/setup/approval-workflows"],
    sections: [
      {
        heading: "How approvals work",
        body: [
          "Each application type (Leave, Overtime, Official Business, Pass Slip, Loans, Profile Update, DTR and payroll batches) can have its own workflow. Types without one keep single-step approval: anyone with that type's Approve permission can approve.",
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
            text: "Add steps in order. For each step choose who approves: a specific Person, a Department, a Position, the applicant's manager, or the applicant's department. Also choose whether a note is None, Optional or Required.",
          },
          {
            text: "Save. It's saved as inactive; click Activate in the list and new requests of that type follow it.",
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
            text: "To change it now, click Copy (or Copy as new version on the workflow's page). Adjust the copy and save it; it's saved as inactive.",
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
    permission: ["Users:View", "Tenant Members:Manage"],
    paths: ["/security/users"],
    sections: [
      {
        heading: "Invite people",
        steps: [
          {
            text: "Open Security › Users and click Invite Users.",
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
            text: 'Open Security › Roles and create a role (e.g. "Payroll Officer").',
            link: { label: "Roles", to: "/security/roles" },
          },
          {
            text: "Tick the permissions it needs. Each screen has actions such as View, Create, Edit, Delete, Approve or Export. Hover over a permission to see what it allows.",
          },
          { text: "Save, then give the role to users from Security › Users." },
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
    permission: "Audit Trail:View",
    paths: ["/security/audit"],
    sections: [
      {
        heading: "Steps",
        steps: [
          {
            text: "Open Security › Audit.",
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
          "From Security › Users, the activity icon on a user opens the audit trail filtered to that person.",
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
    permission: "Billing:View",
    paths: ["/billing"],
    sections: [
      {
        heading: "Your plan at a glance",
        steps: [
          {
            text: "Open Security › Billing. Current plan shows your plan, its status (Free trial, Active, Payment overdue, Suspended and so on), when the current period or trial ends and your next payment.",
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
            text: "Click Choose a plan (or Change plan). Pick Monthly or Annual; annual gives two months free. One price covers your whole account, not each employee.",
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
          "If the plan doesn't include HRMS, every HRMS page is locked, but Billing stays open so you can fix it.",
        ],
        warning:
          "A company left unpaid for a long time is eventually locked and its data archived. Renew before then.",
      },
    ],
    related: ["storage-manager", "faq"],
  },
  {
    id: "storage-manager",
    title: "Storage: usage, add-ons and cleaning up files",
    audience: "admin",
    chapter: "Billing & storage",
    summary:
      "See how much file storage you use, add more, and delete files you no longer need.",
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
            text: "Open Security › Storage. The gauge shows used and total storage, split into plan storage and add-ons.",
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
    permission: "Announcements:View",
    paths: ["/communication/announcements"],
    sections: [
      {
        heading: "Create and publish",
        steps: [
          {
            text: "Open Communication › Announcements and click New Announcement.",
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
          "Invite client logins from Security › Users: choose Client and pick the client. Clients you create in Setup are shared with the portal automatically. Connection shows whether the link is working.",
        ],
        tips: [
          "The Client Services menu appears only when your plan includes the Client Portal.",
        ],
      },
    ],
    related: ["users-invite"],
  },
];
