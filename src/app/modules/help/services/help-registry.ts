import type { HelpArticle, HelpAudience } from "../models/help-article.model";

export const HELP_AUDIENCES: { key: HelpAudience; label: string }[] = [
  { key: "start", label: "Getting Started" },
  { key: "admin", label: "Owner & Admin" },
  { key: "hr", label: "HR & Payroll" },
  { key: "approver", label: "Approvers" },
  { key: "employee", label: "Employees" },
];

/** Whether the signed-in user holds any of these permission codes. */
export type PermissionCheck = (...codes: string[]) => boolean;

/** The guides this person may see: untagged ones, and ones whose permission they hold. */
export function visibleArticles(
  articles: HelpArticle[],
  hasAnyPermission: PermissionCheck,
): HelpArticle[] {
  return articles.filter((article) => {
    if (!article.permission) return true;
    const codes = Array.isArray(article.permission)
      ? article.permission
      : [article.permission];
    return hasAnyPermission(...codes);
  });
}

const matchesPath = (pathname: string, path: string) =>
  pathname === path || pathname.startsWith(`${path}/`);

/** The guide for the screen at `pathname`: the one naming the most specific matching path. */
export function articleForPath(
  articles: HelpArticle[],
  pathname: string,
): HelpArticle | undefined {
  let best: { article: HelpArticle; length: number } | undefined;
  for (const article of articles) {
    for (const path of article.paths ?? []) {
      if (matchesPath(pathname, path) && path.length > (best?.length ?? -1)) {
        best = { article, length: path.length };
      }
    }
  }
  return best?.article;
}

function searchableText(article: HelpArticle): string {
  return [
    article.title,
    article.chapter,
    article.summary,
    ...(article.purpose ?? []),
    ...article.sections.flatMap((section) => [
      section.heading,
      ...(section.body ?? []),
      ...(section.steps ?? []).map((step) => step.text),
      ...(section.tips ?? []),
      section.warning ?? "",
      section.example?.title ?? "",
      section.example?.note ?? "",
      ...(section.example?.lines ?? []),
      ...(section.example?.table?.rows.flat() ?? []),
    ]),
  ]
    .join(" ")
    .toLowerCase();
}

/** Guides containing every word of the query, title matches first. */
export function searchArticles(
  articles: HelpArticle[],
  query: string,
): HelpArticle[] {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (words.length === 0) return articles;
  const matches = articles.filter((article) => {
    const text = searchableText(article);
    return words.every((word) => text.includes(word));
  });
  const inTitle = (article: HelpArticle) =>
    words.some((word) => article.title.toLowerCase().includes(word)) ? 0 : 1;
  return [...matches].sort((a, b) => inTitle(a) - inTitle(b));
}

/** A tab's guides grouped by chapter, in the order they're written. */
export function chaptersFor(
  articles: HelpArticle[],
  audience: HelpAudience,
): { chapter: string; articles: HelpArticle[] }[] {
  const chapters = new Map<string, HelpArticle[]>();
  for (const article of articles.filter((a) => a.audience === audience)) {
    chapters.set(article.chapter, [
      ...(chapters.get(article.chapter) ?? []),
      article,
    ]);
  }
  return [...chapters].map(([chapter, list]) => ({
    chapter,
    articles: list,
  }));
}
