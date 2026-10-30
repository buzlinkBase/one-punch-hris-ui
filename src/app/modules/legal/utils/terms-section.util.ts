/**
 * The anchor of a Terms heading: "4. Customer Configuration ..." -> "section-4", so the app can link
 * to a numbered section (e.g. /terms#section-4 from the DOLE-deviation acknowledgment) whatever its
 * wording. A heading without a number gets a slug of its text.
 */
export function termsSectionId(heading: string): string {
  const numbered = /^\s*(\d+)\.\s/.exec(heading);
  if (numbered) return `section-${numbered[1]}`;
  return heading
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** The level-2 headings of a Markdown document, in order -- the Terms' table of contents. */
export function termsSections(
  markdown: string,
): { id: string; title: string }[] {
  return markdown
    .split(/\r?\n/)
    .filter((line) => line.startsWith("## "))
    .map((line) => line.slice(3).trim())
    .map((title) => ({ id: termsSectionId(title), title }));
}
