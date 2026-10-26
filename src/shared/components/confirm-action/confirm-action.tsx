import type { ReactElement, ReactNode } from "react";
import { Popconfirm } from "antd";
import { buildConfirmCopy } from "@/shared/utils/confirm-copy.util";

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

/** Popconfirm with specific wording (see buildConfirmCopy) and a destructive OK button. */
export function ConfirmAction({
  verb = "Delete",
  subject,
  name,
  consequence,
  destructive = true,
  onConfirm,
  children,
}: ConfirmActionProps) {
  const { title, okText } = buildConfirmCopy({ verb, subject, name });
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
