import type { ClipboardEvent, KeyboardEvent } from "react";
import { Tag, Tooltip } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import { MAX_EMAILS, parseEmailList } from "./parse-email-list";

/** How a chip reads, from the validation matrix of the batch invite story. */
export type EmailChipTone =
  "ready" | "checking" | "member" | "conflict" | "pending" | "invalid";

export interface EmailChipStatus {
  tone: EmailChipTone;
  message: string;
}

const TONE_TAG: Record<
  EmailChipTone,
  { color?: string; variant?: "outlined" | "solid"; className?: string }
> = {
  ready: { variant: "outlined", className: "border-(--ant-color-primary)!" },
  checking: { variant: "outlined" },
  member: { color: "error", variant: "outlined" },
  conflict: { color: "warning", variant: "outlined" },
  pending: { color: "gold", variant: "outlined" },
  invalid: { color: "error", variant: "solid" },
};

// Keys that turn the typed text into a chip. Tab only does so while there's text to commit, so
// an empty field still tabs to the next control.
const COMMIT_KEYS = new Set(["Enter", ",", ";", " ", "Tab"]);

interface EmailChipInputProps {
  id?: string;
  emails: string[];
  onChange: (emails: string[]) => void;
  statusOf: (email: string) => EmailChipStatus;
  /** Text typed but not yet turned into a chip (kept by the parent, e.g. for a discard guard). */
  draft: string;
  onDraftChange: (text: string) => void;
  /** "Duplicate email removed." / "Only the first 100 emails were imported." */
  onNotice?: (message: string) => void;
  disabled?: boolean;
  max?: number;
  placeholder?: string;
}

/**
 * An email field that turns typed or pasted addresses into removable chips, each colored by
 * its status. Accepts lists separated by commas, semicolons, spaces, tabs or new lines (CSV,
 * Excel, Google Sheets, plain text), drops duplicates and stops at `max` addresses.
 */
export function EmailChipInput({
  id,
  emails,
  onChange,
  statusOf,
  draft,
  onDraftChange,
  onNotice,
  disabled,
  max = MAX_EMAILS,
  placeholder = "Type or paste email addresses",
}: EmailChipInputProps) {
  const commit = (text: string) => {
    const result = parseEmailList(text, emails, max);
    onDraftChange("");
    if (result.added.length > 0) onChange([...emails, ...result.added]);
    if (result.duplicates > 0) onNotice?.("Duplicate email removed.");
    if (result.truncated)
      onNotice?.(`Only the first ${max} emails were imported.`);
  };

  const remove = (email: string) =>
    onChange(emails.filter((existing) => existing !== email));

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (COMMIT_KEYS.has(e.key) && draft.trim()) {
      e.preventDefault();
      commit(draft);
    } else if (e.key === "Enter") {
      e.preventDefault();
    } else if (e.key === "Backspace" && !draft && emails.length > 0) {
      remove(emails[emails.length - 1]);
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    commit(`${draft} ${e.clipboardData.getData("text")}`);
  };

  const handleChipKeyDown = (
    e: KeyboardEvent<HTMLSpanElement>,
    email: string,
  ) => {
    if (e.key === "Backspace" || e.key === "Delete") {
      e.preventDefault();
      remove(email);
    }
  };

  return (
    <div
      className={`flex max-h-60 min-h-10 flex-wrap items-center gap-1 overflow-y-auto rounded-md border border-(--ant-color-border) bg-(--ant-color-bg-container) px-2 py-1 focus-within:border-(--ant-color-primary) ${
        disabled ? "opacity-60" : ""
      }`}
    >
      {emails.map((email) => {
        const status = statusOf(email);
        const tag = TONE_TAG[status.tone];
        return (
          <Tooltip key={email} title={status.message}>
            <Tag
              color={tag.color}
              variant={tag.variant}
              className={`m-0 ${tag.className ?? ""}`}
              icon={
                status.tone === "checking" ? <LoadingOutlined /> : undefined
              }
              closable={!disabled}
              onClose={(e) => {
                e.preventDefault();
                remove(email);
              }}
              tabIndex={disabled ? -1 : 0}
              aria-label={`${email}: ${status.message}`}
              onKeyDown={(e) => handleChipKeyDown(e, email)}
            >
              {email}
            </Tag>
          </Tooltip>
        );
      })}
      <input
        id={id}
        className="min-w-48 flex-1 border-0 bg-transparent py-1 text-sm text-(--ant-color-text) outline-none"
        value={draft}
        disabled={disabled}
        placeholder={emails.length === 0 ? placeholder : undefined}
        aria-label="Email addresses"
        onChange={(e) => onDraftChange(e.target.value)}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        onBlur={() => draft.trim() && commit(draft)}
      />
    </div>
  );
}
