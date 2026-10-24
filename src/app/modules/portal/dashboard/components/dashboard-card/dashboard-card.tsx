import type { ReactNode } from "react";
import { Card, Skeleton } from "antd";
import { DRILL_CLASS, drillProps } from "@/shared/drilldown/drill-props";
import type { DrillAction } from "@/shared/drilldown/use-drill-down";

interface DashboardCardProps {
  title: string;
  loading?: boolean;
  /** Opens the detail page; the card stays plain when the person cannot open it. */
  drillAction?: DrillAction;
  children: ReactNode;
}

/** Shared shell for every My Dashboard widget: title, skeleton while loading, drill-down. */
export function DashboardCard({
  title,
  loading,
  drillAction,
  children,
}: DashboardCardProps) {
  return (
    <Card
      size="small"
      title={title}
      className={drillAction ? DRILL_CLASS : undefined}
      {...drillProps(drillAction)}
    >
      {loading ? <Skeleton active paragraph={{ rows: 2 }} /> : children}
    </Card>
  );
}
