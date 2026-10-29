import type { ReactElement, ReactNode } from "react";
import { Popconfirm } from "antd";
import { buildConfirmCopy } from "@/shared/utils/confirm-copy.util";
import { useCompanyClosed } from "@/app/modules/billing/hooks/use-company-closed";

interface ConfirmActionProps {
  /** Imperative verb shown in the title and on the OK button. Defaults to "Delete". */
  verb?: string;
  subject: string;
  name?: string;
  /** What else is affected, e.g. "Its attached schedule rows are removed too." */
  consequence?: ReactNode;
  /** Red OK button. Defaults to true; pass false for non-destructive confirmations. */
  destructive?: boolean;
  onConfirm: () => void;
  children: ReactElement;
}

/**
 * Popconfirm with specific wording (see buildConfirmCopy) and a destructive OK button. Renders
 * nothing -- the action included -- while the company is closed (read-only, suspended, on hold).
 */
export function ConfirmAction({
  verb = "Delete",
  subject,
  name,
  consequence,
  destructive = true,
  onConfirm,
  children,
}: ConfirmActionProps) {
  const closed = useCompanyClosed();
  const { title, okText } = buildConfirmCopy({ verb, subject, name });
  if (closed) return null;
  return (
    <Popconfirm
      title={title}
      description={consequence}
      okText={okText}
      cancelText="Keep"
      okButtonProps={{ danger: destructive }}
      onConfirm={onConfirm}
    >
      {children}
    </Popconfirm>
  );
}
