const URL_PATTERN = /(https?:\/\/[^\s<>"']+)/g;

export interface TextPart {
  value: string;
  isLink: boolean;
}

/** Splits plain text into text and http(s) URL parts, in order. */
export function splitLinks(text: string): TextPart[] {
  return text
    .split(URL_PATTERN)
    .filter((part) => part.length > 0)
    .map((part) => ({ value: part, isLink: /^https?:\/\//.test(part) }));
}
