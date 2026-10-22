import { useState } from "react";
import { Card, Empty, Segmented, Skeleton, Table } from "antd";
import type {
  AnalyticsPoint,
  AnalyticsSeries,
} from "../models/analytics.model";
import { formatValue } from "../utils/analytics-format";
import { formatPeriod } from "../utils/analytics-filter";
import type { DrillAction } from "@/shared/drilldown/use-drill-down";
import { TrendChart, type TrendChartKind } from "./charts/trend-chart";

interface ChartCardProps {
  title: string;
  kind: TrendChartKind;
  points: AnalyticsPoint[];
  series: AnalyticsSeries[];
  loading?: boolean;
  className?: string;
  /** What clicking a month opens, per series. */
  pointAction?: (period: string, seriesKey: string) => DrillAction;
}

type View = "chart" | "table";

/** A titled trend chart with a Table view of the same numbers (for screen readers, print and exact values). */
export function ChartCard({
  title,
  kind,
  points,
  series,
  loading,
  className,
  pointAction,
}: ChartCardProps) {
  const [view, setView] = useState<View>("chart");
  const isEmpty =
    points.length === 0 ||
    points.every((p) => series.every((s) => !p.values[s.key]));

  return (
    <Card
      size="small"
      title={<span className="text-sm font-semibold">{title}</span>}
      extra={
        <Segmented<View>
          size="small"
          value={view}
          onChange={setView}
          options={[
            { label: "Chart", value: "chart" },
            { label: "Table", value: "table" },
          ]}
        />
      }
      className={`h-full ${className ?? ""}`}
    >
      {loading ? (
        <Skeleton active paragraph={{ rows: 6 }} />
      ) : isEmpty ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="No data for this period"
        />
      ) : view === "chart" ? (
        <TrendChart
          kind={kind}
          points={points}
          series={series}
          pointAction={pointAction}
        />
      ) : (
        <Table
          size="small"
          rowKey="period"
          pagination={false}
          scroll={{ x: true, y: 256 }}
          dataSource={points}
          columns={[
            {
              title: "Month",
              dataIndex: "period",
              render: (period: string) => formatPeriod(period),
            },
            ...series.map((s) => ({
              title: s.label,
              key: s.key,
              align: "right" as const,
              render: (_: unknown, p: AnalyticsPoint) =>
                formatValue(p.values[s.key] ?? 0, s.unit),
            })),
          ]}
        />
      )}
    </Card>
  );
}
