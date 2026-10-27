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

/** A worked sample: a scenario or calculation in lines, and/or a small table. */
export interface HelpExample {
  title: string;
  note?: string;
  lines?: string[];
  table?: { columns: string[]; rows: string[][] };
}

export interface HelpSection {
  heading: string;
  body?: string[];
  steps?: HelpStep[];
  tips?: string[];
  warning?: string;
  example?: HelpExample;
}

export interface HelpArticle {
  id: string;
  title: string;
  audience: HelpAudience;
  /** Groups guides within a tab, e.g. "Company setup". */
  chapter: string;
  summary: string;
  /** "What it's for": why the feature exists, who uses it and when. */
  purpose?: string[];
  /** Any-of, like the sidebar: the guide shows only to someone holding one of these. */
  permission?: string | string[];
  /** Screens this guide explains -- the ? button on them opens it. */
  paths?: string[];
  sections: HelpSection[];
  /** Ids of guides to read next. */
  related?: string[];
}
