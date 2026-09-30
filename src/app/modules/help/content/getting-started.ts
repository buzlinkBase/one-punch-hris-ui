import type { HelpArticle } from "../models/help-article.model";

export const GETTING_STARTED_ARTICLES: HelpArticle[] = [
  {
    id: "welcome",
    title: "Welcome to One Punch HRIS",
    audience: "start",
    chapter: "Start here",
    summary:
      "What the system does, how it's organized, and which guides to read for your role.",
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
    sections: [
      {
        heading: "The top bar",
        steps: [
          {
            text: 'Quick search: type any screen name (e.g. "payslip") and pick it to jump straight there.',
          },
          {
            text: "Bell: your notifications. Approval updates, such as a request waiting on you or your request being approved, appear here. Click one to open that request.",
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
        ],
      },
      {
        heading: "The menu",
        body: [
          "The left menu is grouped by area: My Portal, Time Keeping, Change Schedule, DTR Generation, Payroll Generation, Applications, Setup, Reports and Security. You only see the areas your role can use. If you expect a screen and can't find it, ask your admin to check your role.",
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
];
