import { Fragment } from "react";
import { splitLinks } from "./split-links";

interface LinkifiedTextProps {
  text: string;
  className?: string;
}

/**
 * Renders plain text as-is (line breaks kept) with http(s) URLs made clickable. Never renders
 * HTML from the text, so a message can't inject markup.
 */
export function LinkifiedText({ text, className }: LinkifiedTextProps) {
  return (
    <div className={`whitespace-pre-wrap wrap-break-word ${className ?? ""}`}>
      {splitLinks(text).map((part, index) =>
        part.isLink ? (
          <a
            key={index}
            href={part.value}
            target="_blank"
            rel="noopener noreferrer"
          >
            {part.value}
          </a>
        ) : (
          <Fragment key={index}>{part.value}</Fragment>
        ),
      )}
    </div>
  );
}
