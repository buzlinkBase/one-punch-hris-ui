import type { HelpArticle } from "../models/help-article.model";
import { GETTING_STARTED_ARTICLES } from "./getting-started";
import { ADMIN_ARTICLES } from "./admin-setup";
import { HR_PAYROLL_ARTICLES } from "./hr-payroll";
import { APPROVER_ARTICLES } from "./approvers";
import { EMPLOYEE_ARTICLES } from "./employees";
import { FAQ_ARTICLES } from "./faq";

/** Every guide in the Help Center, in reading order within each tab. */
export const HELP_ARTICLES: HelpArticle[] = [
  ...GETTING_STARTED_ARTICLES,
  ...FAQ_ARTICLES,
  ...ADMIN_ARTICLES,
  ...HR_PAYROLL_ARTICLES,
  ...APPROVER_ARTICLES,
  ...EMPLOYEE_ARTICLES,
];
