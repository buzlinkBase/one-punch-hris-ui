import type { ReactNode } from "react";
import { Empty } from "antd";

interface AppEmptyProps {
  /** What is missing, e.g. "No leave applications found". */
  description: ReactNode;
  /** Optional next step, e.g. an "Add" button. */
  action?: ReactNode;
}

/** The one empty-state look, used inside tables, cards and panels. */
export function AppEmpty({ description, action }: AppEmptyProps) {
  return (
    <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={description}>
      {action}
    </Empty>
  );
}
