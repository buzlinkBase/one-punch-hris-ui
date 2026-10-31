import type { HelpArticle } from "../models/help-article.model";

export const GETTING_STARTED_ARTICLES: HelpArticle[] = [
  {
    id: "welcome",
    title: "Welcome to One Punch HRIS",
    audience: "start",
    chapter: "Start here",
    summary:
      "What the system does, how it's organized, and which guides to read for your role.",
    purpose: [
      "This is the map of One Punch HRIS. It tells you what the system covers and which guides to read first, so you don't have to read everything.",
      "Example: a payroll officer goes straight to HR & Payroll › The payroll cutoff, end to end; an employee goes to Employees › My Portal.",
    ],
    paths: ["/dashboard"],
    sections: [
      {
        heading: "What you can do here",
        body: [
          "One Punch HRIS runs your company's people operations in one place: employee records, attendance from biometric devices, schedules, leave and other requests with approvals, the Daily Time Record (DTR), payroll, payslips and government reports.",
          "What you see depends on your role. The menu on the left only shows the screens your role is allowed to use, and this Help Center only shows the guides that apply to you.",
        ],
      },
      {
        heading: "Which guides to read",
        steps: [
          {
            text: "Company Owner or Admin setting the system up for the first time: read Owner & Admin, starting with the Day-1 setup checklist.",
          },
          {
            text: "HR or Payroll staff: read HR & Payroll, starting with the payroll cutoff guide. It walks through one full cutoff from attendance to payslips.",
          },
          {
            text: "Supervisors and anyone who approves requests: read Approvers.",
          },
          {
            text: "Employees: read Employees to see your payslips and DTR and to file leave, overtime and other requests.",
          },
        ],
      },
      {
        heading: "Getting help on any screen",
        body: [
          "Click the ? icon at the top right on any screen. It opens the guide for that screen. From there you can open the full Help Center.",
        ],
      },
    ],
    related: ["sign-in", "layout-tour"],
  },
  {
    id: "sign-in",
    title: "Signing in, passwords and switching company",
    audience: "start",
    chapter: "Start here",
    summary:
      "Sign in with email or Google, reset a forgotten password, and switch between companies.",
    purpose: [
      "Everything starts with signing in. If you work for more than one company (for example an accountant handling several clients), the system keeps their data separate and you switch between them here.",
    ],
    sections: [
      {
        heading: "Sign in",
        steps: [
          { text: "Open the sign-in page and enter your email and password." },
          {
            text: "Click Sign In. If your account uses Google, click Continue with Google instead.",
          },
          {
            text: "If you belong to more than one company, choose the one you want to work in.",
          },
        ],
        tips: [
          "After 5 wrong passwords your account is locked for 5 minutes. Wait, then try again.",
          'If you see "Too many requests. Please wait … seconds", the system is slowing down repeated attempts. Wait for the time shown.',
        ],
      },
      {
        heading: "Forgot your password",
        steps: [
          { text: "On the sign-in page, click Forgot password?" },
          {
            text: "Enter your email and submit. You'll receive a reset link by email.",
          },
          {
            text: "Open the link, enter a new password twice and save. Then sign in with the new password.",
          },
        ],
        warning:
          "A reset link can only be used once and expires. If it doesn't work, request a new one.",
      },
      {
        heading: "Switch company",
        steps: [
          {
            text: "Click the company icon in the top bar (it shows your current company's name when you hover over it).",
          },
          {
            text: "Pick the company to switch to. The screens reload for that company.",
          },
        ],
      },
    ],
    related: ["change-password", "accept-invitation"],
  },
  {
    id: "accept-invitation",
    title: "Accepting an invitation",
    audience: "start",
    chapter: "Start here",
    summary:
      "Join your company from the invitation email, whether you're new or already have an account.",
    purpose: [
      "Nobody can sign up on their own. Your company invites you by email so only real employees get in, with the role they were given.",
      "Example: HR invites maria@company.com; Maria opens the email within 7 days, sets a password and lands in My Portal.",
    ],
    sections: [
      {
        heading: "Steps",
        steps: [
          { text: "Open the invitation email and click the link." },
          {
            text: "If you're new, enter your name and a password (at least 8 characters, with upper and lower case letters, a number and a special character), then submit.",
          },
          {
            text: "If you already have an account, sign in with the same email the invitation was sent to. The invitation is accepted automatically.",
          },
        ],
        tips: [
          "Invitation links last 7 days. If yours expired, ask whoever invited you to send a new one.",
          'If you sign in with a different email you\'ll see "Wrong account". Sign out and use the email the invitation was sent to.',
        ],
      },
    ],
    related: ["sign-in"],
  },
  {
    id: "layout-tour",
    title: "Finding your way around",
    audience: "start",
    chapter: "Start here",
    summary:
      "The menu, quick search, notifications, dark mode and your profile.",
    purpose: [
      "A quick tour so you can find any screen fast, without hunting through menus.",
      "Example: press Ctrl+K, type 'payslip' and pick My Payslips to jump straight there.",
    ],
    sections: [
      {
        heading: "The top bar",
        steps: [
          {
            text: 'Quick search (or press Ctrl+K, Cmd+K on Mac): type any screen name (e.g. "payslip") and pick it to jump straight there. If you can open the Employee screen, typing a name of two or more letters also lists matching employees; pick one to open their record. Use the arrow keys and Enter to choose, and Esc to close.',
          },
          {
            text: "Bell: your notifications. Approval updates, such as a request waiting on you or your request being approved, appear here. Click one to open that request, or choose View all notifications at the bottom to see your full history and mark everything as read. Choose Clear all to remove every notification from the bell. You are not notified about requests you filed or approved yourself.",
          },
          {
            text: "Company icon: switch between companies you belong to.",
          },
          { text: "Moon/sun icon: switch between light and dark mode." },
          {
            text: "Gear icon (admins): Company Settings.",
            link: { label: "Company Settings", to: "/setup/company-policy" },
          },
          { text: "? icon: help for the screen you're on." },
          {
            text: "Star icon beside the path: pin the current screen. Pinned screens appear in a Pinned group at the top of the menu (up to 8). You can also pin or unpin from the quick search. With the quick search box empty, it lists your pinned and recently opened screens.",
          },
          {
            text: "On a phone, Help, dark mode and Company Settings are tucked into the ··· button to save room.",
          },
        ],
      },
      {
        heading: "The menu",
        body: [
          "The path at the top left (for example Applications / Leave / Create) shows where you are. Click any earlier step to go back to it. Opening a menu group closes the others, and the menu scrolls to the screen you're on. The menu stays collapsed or expanded the way you left it, even after you sign in again, and press Tab on any screen to reach the Skip to main content link, which jumps past the menu. A new device follows your computer's light or dark setting until you choose one yourself.",
          "The left menu follows the pay cycle: My Portal, Employees, Timekeeping, Change Schedule, Applications, DTR Processing, Payroll, Reports, Analytics, Announcements and Client Services, then Setup and Administration (users, roles, billing and storage). Long areas such as Reports and Setup are split into smaller groups. The Dashboard and Analytics figures are clickable and open the list behind them. You only see the areas your role can use. If you expect a screen and can't find it, ask your admin to check your role.",
        ],
      },
      {
        heading: "On your phone and when editing",
        body: [
          "On a phone, the leave, overtime, undertime and travel order lists show each request as a card instead of a wide table, with its actions at the bottom of the card.",
          "If you leave any form you've changed without saving, for example an employee record, a setup screen, an application or a request in My Portal, you're asked whether to discard your changes. This includes moving to the previous or next employee and closing or reloading the browser tab. Choose Keep editing to stay on the form.",
          "Wide tables scroll sideways on smaller screens instead of squeezing their columns.",
        ],
      },
      {
        heading: "Your profile",
        body: [
          "Click your name at the bottom of the menu to open your profile. There you can update your name and phone number, change your password and choose which approval notifications you receive.",
        ],
      },
    ],
    related: ["change-password"],
  },
  {
    id: "change-password",
    title: "Changing your password and notification settings",
    audience: "start",
    chapter: "Your account",
    summary:
      "Update your password, name and phone number, and choose which notifications you get.",
    purpose: [
      "Keeps your account secure and your contact details current, and lets you decide which approval alerts reach you. Approvers who go on leave can also hand their approvals to someone else here.",
      "Example: leaving for a week? Delegate your approvals to a colleague for those dates so requests don't pile up.",
    ],
    paths: ["/profile"],
    sections: [
      {
        heading: "Change your password",
        steps: [
          {
            text: "Open My Profile.",
            link: { label: "My Profile", to: "/profile" },
          },
          {
            text: "Under Change Password, enter your current password, then the new password twice.",
          },
          {
            text: "Click Change Password. Use the new password the next time you sign in.",
          },
        ],
        tips: [
          "Changing your password signs you out on every other device, such as your phone or another computer. The device you changed it on stays signed in. Resetting a forgotten password signs you out everywhere.",
          'If you signed up with Google and never set a password, click "Don\'t have a password yet?" to create one.',
        ],
      },
      {
        heading: "Profile details",
        steps: [
          {
            text: "Under Profile details, edit your Full Name or Phone Number and click Save Changes.",
          },
        ],
      },
      {
        heading: "While I'm away (delegating your approvals)",
        steps: [
          {
            text: "Under While I'm away, click Delegate and choose who approves for you, which requests, and when. They then see your pending requests in My Approvals. You can also start it from the While I'm away button in My Approvals.",
          },
        ],
        tips: ["The same card lists what others have delegated to you."],
      },
      {
        heading: "Notification preferences",
        steps: [
          {
            text: "Under Notification Preferences, turn Email and Push on or off for each application type (Leave, Overtime and so on).",
          },
        ],
        tips: [
          "Push notifications are the ones that appear in the bell. Leave Push on for the request types you approve.",
        ],
      },
    ],
  },
  {
    id: "terms-of-service",
    title: "Terms of Service and your company's responsibilities",
    audience: "start",
    chapter: "Start here",
    summary:
      "What you agree to when you sign up or set up a company, how updated Terms are accepted, and what your company is responsible for.",
    purpose: [
      "The Terms of Service are the agreement between your company and One Punch HRIS. Your company is the employer: it decides its pay rules and is responsible for following labor, tax and contribution laws. The system computes what you configure.",
      "The Terms, the agreement boxes and the DOLE confirmations below apply once One Punch HRIS has put the Terms in effect. Until then you won't see them.",
      "Example: if your company chooses the Additive overtime method, payroll pays exactly that. Whether it is allowed for your employees is your company's call, not the system's.",
    ],
    sections: [
      {
        heading: "Agreeing to the Terms",
        steps: [
          {
            text: "When you create an account, tick I have read and agree to the Terms of Service. Sign up with Google stays disabled until you do.",
          },
          {
            text: "When you set up a company, the owner ticks the box on behalf of the company. The acceptance is recorded for the company as soon as it is ready.",
          },
          {
            text: "If you choose the Additive overtime method under Payroll policy while setting up the company, it is logged under your name in Company Settings > DOLE Deviation Log.",
          },
          {
            text: "Read the Terms any time from the menu at the top right (Terms of Service) or the link under the sign-in page.",
            link: { label: "Terms of Service", to: "/terms" },
          },
        ],
      },
      {
        heading: "When the Terms are updated",
        body: [
          "When a new version asks for acceptance, owners and admins see it with a summary of what changed, within a few minutes even if they are already signed in (or as soon as they come back to the tab). They read it, tick the box and click Accept on behalf of the company. Until then the Terms stay on screen. Other users aren't asked.",
          "Each acceptance is recorded with the version, the person, the date and time, and where it came from.",
        ],
      },
      {
        heading: "What your company is responsible for",
        body: [
          "Your pay rules, rate multipliers, statutory tables, leave rules and every other setting, and the payroll they produce. Review each DTR and payroll before releasing pay or filing with the government.",
          "Settings that differ from DOLE standards must be confirmed by an admin and are recorded. See Company Settings, section Settings that differ from DOLE standards.",
          "Your employees' personal data: your company is the Personal Information Controller under the Data Privacy Act, and One Punch HRIS processes the data for you.",
        ],
      },
    ],
    related: ["company-settings", "statutory-tables", "billing-plans"],
  },
];
