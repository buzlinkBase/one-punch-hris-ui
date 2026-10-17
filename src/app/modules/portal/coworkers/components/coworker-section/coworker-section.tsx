import type { ReactNode } from "react";
import { Card, Empty, Skeleton } from "antd";

interface CoworkerSectionProps {
  title: string;
  icon: ReactNode;
  loading?: boolean;
  isEmpty: boolean;
  emptyText: string;
  children: ReactNode;
}

/** A titled card with loading and empty states around a grid of coworker cards. */
export default function CoworkerSection({
  title,
  icon,
  loading,
  isEmpty,
  emptyText,
  children,
}: CoworkerSectionProps) {
  return (
    <Card
      size="small"
      className="mb-3"
      title={
        <span>
          <span className="mr-2">{icon}</span>
          {title}
        </span>
      }
    >
      {loading ? (
        <Skeleton active paragraph={{ rows: 2 }} />
      ) : isEmpty ? (
        <Empty description={emptyText} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {children}
        </div>
      )}
    </Card>
  );
}
