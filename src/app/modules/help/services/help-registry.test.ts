import { describe, expect, it } from "vitest";
import { flattenNavPaths } from "@/shared/constants/navigation.const";
import { HELP_ARTICLES } from "../content";
import type { HelpArticle } from "../models/help-article.model";
import {
  HELP_AUDIENCES,
  articleForPath,
  chaptersFor,
  searchArticles,
  visibleArticles,
} from "./help-registry";

const article = (overrides: Partial<HelpArticle>): HelpArticle => ({
  id: "a",
  title: "A",
  audience: "start",
  chapter: "Start",
  summary: "",
  sections: [],
  ...overrides,
});

describe("visibleArticles", () => {
  it("shows untagged guides to everyone and tagged ones only with a matching permission", () => {
    const open = article({ id: "open" });
    const payroll = article({ id: "payroll", permission: "Payroll Run:View" });
    const either = article({
      id: "either",
      permission: ["Leave:View", "Overtime:View"],
    });
    const has =
      (...granted: string[]) =>
      (...codes: string[]) =>
        codes.some((c) => granted.includes(c));

    expect(
      visibleArticles([open, payroll, either], has()).map((a) => a.id),
    ).toEqual(["open"]);
    expect(
      visibleArticles([open, payroll, either], has("Overtime:View")).map(
        (a) => a.id,
      ),
    ).toEqual(["open", "either"]);
  });

  it("gives a portal-only employee no payroll or setup guides", () => {
    const employee = (...codes: string[]) =>
      codes.includes("Employee Self-Service Portal:View");
    const audiences = new Set(
      visibleArticles(HELP_ARTICLES, employee).map((a) => a.audience),
    );

    expect([...audiences].sort()).toEqual(["employee", "start"]);
  });
});

describe("articleForPath", () => {
  const list = [
    article({ id: "broad", paths: ["/setup"] }),
    article({ id: "specific", paths: ["/setup/employee"] }),
  ];

  it("picks the most specific matching screen", () => {
    expect(articleForPath(list, "/setup/employee/123")?.id).toBe("specific");
    expect(articleForPath(list, "/setup/department")?.id).toBe("broad");
  });

  it("doesn't match on a partial segment, and returns nothing without a guide", () => {
    expect(articleForPath(list, "/setup-extra")).toBeUndefined();
    expect(articleForPath(list, "/reports")).toBeUndefined();
  });

  it("finds the payroll run guide from the Payroll Run screen", () => {
    expect(
      articleForPath(HELP_ARTICLES, "/daily-time-record/for-payroll")?.id,
    ).toBe("payroll-run");
  });
});

describe("searchArticles", () => {
  it("finds guides by any words in their text, title matches first", () => {
    const ids = searchArticles(HELP_ARTICLES, "payslip").map((a) => a.id);

    // Both have "payslip" in their title, so they come before guides that only mention it.
    expect(ids.slice(0, 2).sort()).toEqual(["payroll-summary", "portal-pay"]);
  });

  it("searches the purpose and the example text of a guide", () => {
    const article = {
      id: "x",
      title: "Plain title",
      audience: "hr" as const,
      chapter: "C",
      summary: "Plain summary",
      purpose: ["Explains zebrafish rules"],
      sections: [
        {
          heading: "H",
          example: {
            title: "T",
            table: { columns: ["A"], rows: [["narwhal"]] },
          },
        },
      ],
    };

    expect(searchArticles([article], "zebrafish")).toHaveLength(1);
    expect(searchArticles([article], "narwhal")).toHaveLength(1);
    expect(searchArticles([article], "walrus")).toHaveLength(0);
  });

  it("returns everything for an empty query", () => {
    expect(searchArticles(HELP_ARTICLES, "  ")).toHaveLength(
      HELP_ARTICLES.length,
    );
  });
});

describe("chaptersFor", () => {
  it("groups a tab's guides by chapter in writing order", () => {
    const chapters = chaptersFor(HELP_ARTICLES, "admin").map((c) => c.chapter);

    expect(chapters[0]).toBe("Company setup");
  });
});

// Keeps the manual from rotting: every link and screen match must point at a real screen.
describe("help content integrity", () => {
  const knownRoutes = new Set([
    ...flattenNavPaths(),
    "/profile",
    "/setup/company-policy",
    "/daily-time-record/detail",
  ]);
  const isKnownRoute = (path: string) => knownRoutes.has(path);
  const coversKnownRoute = (path: string) =>
    [...knownRoutes].some(
      (route) => route === path || route.startsWith(`${path}/`),
    );

  it("has unique ids", () => {
    const ids = HELP_ARTICLES.map((a) => a.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("only relates to guides that exist", () => {
    const ids = new Set(HELP_ARTICLES.map((a) => a.id));
    const missing = HELP_ARTICLES.flatMap((a) =>
      (a.related ?? [])
        .filter((id) => !ids.has(id))
        .map((id) => `${a.id} → ${id}`),
    );
    expect(missing).toEqual([]);
  });

  it("only links to real screens", () => {
    const broken = HELP_ARTICLES.flatMap((a) =>
      a.sections.flatMap((s) =>
        (s.steps ?? [])
          .map((step) => step.link?.to)
          .filter((to): to is string => !!to && !isKnownRoute(to))
          .map((to) => `${a.id}: ${to}`),
      ),
    );
    expect(broken).toEqual([]);
  });

  it("only matches screens that exist", () => {
    const stale = HELP_ARTICLES.flatMap((a) =>
      (a.paths ?? [])
        .filter((path) => !coversKnownRoute(path))
        .map((path) => `${a.id}: ${path}`),
    );
    expect(stale).toEqual([]);
  });

  it("puts every guide in a known tab", () => {
    const tabs = new Set(HELP_AUDIENCES.map((a) => a.key));
    expect(HELP_ARTICLES.every((a) => tabs.has(a.audience))).toBe(true);
  });
});
