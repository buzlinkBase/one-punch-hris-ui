interface ConfirmCopyInput {
  /** Imperative verb, e.g. "Delete", "Remove", "Void". */
  verb: string;
  /** What is acted on, e.g. "leave type". */
  subject: string;
  /** Optional name of the specific record, e.g. "Annual Leave". */
  name?: string;
}

export interface ConfirmCopy {
  title: string;
  okText: string;
}

/**
 * Confirmation wording that names what is affected ("Delete leave type "Annual Leave"?" with an
 * OK button reading "Delete"), instead of a generic "Delete this record?" / "Yes".
 */
export function buildConfirmCopy({
  verb,
  subject,
  name,
}: ConfirmCopyInput): ConfirmCopy {
  const target = name ? `${subject} "${name}"` : `this ${subject}`;
  return { title: `${verb} ${target}?`, okText: verb };
}
