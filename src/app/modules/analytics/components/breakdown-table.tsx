import { Card, Empty, Skeleton, Table } from "antd";
import type {
  AnalyticsBreakdown,
  AnalyticsRow,
} from "../models/analytics.model";
import { formatValue } from "../utils/analytics-format";
import { drillProps } from "@/shared/drilldown/drill-props";
import type { DrillAction } from "@/shared/drilldown/use-drill-down";

interface BreakdownTableProps {
  breakdown?: AnalyticsBreakdown;
  loading?: boolean;
  /** What clicking a row opens; rows without an action stay plain. */
  rowAction?: (row: AnalyticsRow) => DrillAction;
}

/** One breakdown (by department, by approver ...) as a sortable table. */
export function BreakdownTable({
  breakdown,
  loading,
  rowAction,
}: BreakdownTableProps) {
  return (
    <Card
      size="small"
      title={
        <span className="text-sm font-semibold">{breakdown?.title ?? ""}</span>
      }
      className="h-full"
    >
      {loading || !breakdown ? (
        <Skeleton active paragraph={{ rows: 4 }} />
      ) : breakdown.rows.length === 0 ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="Nothing to show for this period"
        />
      ) : (
        <Table<AnalyticsRow>
          size="small"
          // Two rows can share a label (two departments named alike); the key tells them apart.
          rowKey={(row) => row.key ?? row.label}
          onRow={(row) => {
            const action = rowAction?.(row);
            return action
              ? { ...drillProps(action), className: "cursor-pointer" }
              : {};
          }}
          pagination={
            breakdown.rows.length > 10 ? { pageSize: 10, size: "small" } : false
          }
          scroll={{ x: true }}
          dataSource={breakdown.rows}
          columns={[
            {
              title: "",
              dataIndex: "label",
              ellipsis: true,
            },
            ...breakdown.columns.map((c) => ({
              title: c.label,
              key: c.key,
              align: "right" as const,
              sorter: (a: AnalyticsRow, b: AnalyticsRow) =>
                (a.values[c.key] ?? 0) - (b.values[c.key] ?? 0),
              render: (_: unknown, row: AnalyticsRow) => (
                <span className="tabular-nums">
                  {formatValue(row.values[c.key] ?? 0, c.unit)}
                </span>
              ),
            })),
          ]}
        />
      )}
    </Card>
  );
}
