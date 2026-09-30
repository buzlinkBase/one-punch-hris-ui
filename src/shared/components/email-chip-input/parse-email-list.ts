/** Largest batch the invite API accepts (AuthApi InvitationPolicy.MaxBatchSize). */
export const MAX_EMAILS = 100;

// Commas, semicolons, spaces, tabs and newlines -- what CSV, Excel, Google Sheets and plain text
// lists put between addresses.
const DELIMITERS = /[,;\s]+/;

// A practical RFC 5322 subset: the dot-atom local part and a dotted hostname. Quoted local parts
// and IP-literal domains are left out on purpose; nobody invites those.
const EMAIL_FORMAT =
  /^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)+$/i;

export function isValidEmail(email: string): boolean {
  return (
    email.length <= 254 && EMAIL_FORMAT.test(email) && !email.includes("..")
  );
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export interface ParsedEmailList {
  /** New addresses, normalized, in the order they appeared. */
  added: string[];
  /** Addresses dropped because they were already in the list or repeated in the text. */
  duplicates: number;
  /** True when addresses were dropped to stay within the limit. */
  truncated: boolean;
}

/**
 * Splits typed or pasted text into addresses to add to `existing`: normalized, de-duplicated
 * (against `existing` and within the text), and cut off at `max` addresses in total.
 */
export function parseEmailList(
  text: string,
  existing: readonly string[],
  max = MAX_EMAILS,
): ParsedEmailList {
  const seen = new Set(existing.map(normalizeEmail));
  const added: string[] = [];
  let duplicates = 0;
  let truncated = false;

  for (const raw of text.split(DELIMITERS)) {
    const email = normalizeEmail(raw);
    if (!email) continue;
    if (seen.has(email)) {
      duplicates += 1;
      continue;
    }
    if (seen.size >= max) {
      truncated = true;
      continue;
    }
    seen.add(email);
    added.push(email);
  }

  return { added, duplicates, truncated };
}
