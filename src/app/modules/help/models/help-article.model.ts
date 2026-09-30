/** Who a guide is written for -- also the Help Center's tabs, in this order. */
export type HelpAudience = "start" | "admin" | "hr" | "approver" | "employee";

export interface HelpLink {
  label: string;
  /** An app route, e.g. "/setup/employee". */
  to: string;
}

export interface HelpStep {
  text: string;
  link?: HelpLink;
}

export interface HelpSection {
  heading: string;
  body?: string[];
  steps?: HelpStep[];
  tips?: string[];
  warning?: string;
}

export interface HelpArticle {
  id: string;
  title: string;
  audience: HelpAudience;
  /** Groups guides within a tab, e.g. "Company setup". */
  chapter: string;
  summary: string;
  /** Any-of, like the sidebar: the guide shows only to someone holding one of these. */
  permission?: string | string[];
  /** Screens this guide explains -- the ? button on them opens it. */
  paths?: string[];
  sections: HelpSection[];
  /** Ids of guides to read next. */
  related?: string[];
}
