import type { ReactNode } from "react";
import { Card, Skeleton } from "antd";
import { DRILL_CLASS, drillProps } from "@/shared/drilldown/drill-props";
import type { DrillAction } from "@/shared/drilldown/use-drill-down";
import {
  CARD_HEAD_TONE_CLASS,
  type CardTone,
} from "@/shared/constants/card-tone.const";

interface DashboardCardProps {
  title: string;
  loading?: boolean;
  /** Opens the detail page; the card stays plain when the person cannot open it. */
  drillAction?: DrillAction;
  /** The card's accent color. */
  tone?: CardTone;
  children: ReactNode;
}

/** Shared shell for every My Dashboard widget: title, skeleton while loading, drill-down. */
export function DashboardCard({
  title,
  loading,
  drillAction,
  tone = "primary",
  children,
}: DashboardCardProps) {
  const className = [CARD_HEAD_TONE_CLASS[tone], drillAction ? DRILL_CLASS : ""]
    .filter(Boolean)
    .join(" ");
  return (
    <Card
      size="small"
      title={title}
      className={className}
      {...drillProps(drillAction)}
    >
      {loading ? <Skeleton active paragraph={{ rows: 2 }} /> : children}
    </Card>
  );
}
