import { Card, Empty, Skeleton, Typography } from "antd";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useChartTheme } from "@/app/modules/analytics/components/charts/chart-theme";
import {
  CARD_EDGE_TONE_CLASS,
  type CardTone,
} from "@/shared/constants/card-tone.const";
import { DRILL_HINT } from "@/shared/drilldown/drill-props";
import type { DrillAction } from "@/shared/drilldown/use-drill-down";
import type { DashboardCount } from "../../models/api/response/dashboard-response.model";

const { Title } = Typography;

interface CountBarCardProps {
  title: string;
  data: DashboardCount[];
  loading?: boolean;
  /** Bars run left to right, for long labels such as branch names. */
  horizontal?: boolean;
  /** Turns an API label ("PartTime") into what people read ("Part Time"). */
  formatLabel?: (label: string) => string;
  /** What clicking a bar opens; bars without an action stay plain. */
  drillAction?: (row: DashboardCount) => DrillAction;
  /** The card's accent color. */
  tone?: CardTone;
}

/** A titled bar chart of a few labelled counts. */
export default function CountBarCard({
  title,
  data,
  loading,
  horizontal,
  formatLabel = (l) => l,
  drillAction,
  tone = "primary",
}: CountBarCardProps) {
  const chart = useChartTheme();
  const rows = data.map((d) => ({
    label: formatLabel(d.label),
    count: d.count,
    action: drillAction?.(d),
  }));
  const isEmpty = rows.every((r) => r.count === 0);
  const open = (_: unknown, index: number) => rows[index]?.action?.();
  // One Cell per bar, so only the bars that open something get a pointer.
  const cells = rows.map((r, i) => (
    <Cell
      key={`${r.label}-${i}`}
      className={r.action ? "cursor-pointer" : undefined}
    />
  ));

  const tooltip = (
    <Tooltip
      cursor={{ fill: chart.cursor }}
      content={({ active, payload }) =>
        active && payload?.length ? (
          <div className="rounded-md border border-(--ant-color-border-secondary) bg-(--ant-color-bg-elevated) px-3 py-2 text-xs shadow-md">
            <span className="text-(--ant-color-text-secondary)">
              {String(payload[0].payload.label)}
            </span>{" "}
            <span className="font-semibold tabular-nums">
              {Number(payload[0].value ?? 0).toLocaleString()}
            </span>
            {payload[0].payload.action && (
              <div className="mt-1 text-(--ant-color-text-tertiary)">
                {DRILL_HINT}
              </div>
            )}
          </div>
        ) : null
      }
    />
  );

  return (
    <Card size="small" className={`h-full ${CARD_EDGE_TONE_CLASS[tone]}`}>
      <Title level={5} className="mb-3!">
        {title}
      </Title>
      {loading ? (
        <Skeleton active paragraph={{ rows: 5 }} />
      ) : isEmpty ? (
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No data" />
      ) : (
        <div className="h-60 w-full">
          <ResponsiveContainer width="100%" height="100%">
            {horizontal ? (
              <BarChart
                data={rows}
                layout="vertical"
                margin={{ top: 4, right: 16, bottom: 0, left: 0 }}
              >
                <CartesianGrid horizontal={false} stroke={chart.grid} />
                <XAxis
                  type="number"
                  allowDecimals={false}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: chart.axisText, fontSize: 12 }}
                />
                <YAxis
                  type="category"
                  dataKey="label"
                  width={96}
                  tickLine={false}
                  axisLine={{ stroke: chart.grid }}
                  tick={{ fill: chart.axisText, fontSize: 12 }}
                />
                {tooltip}
                <Bar
                  dataKey="count"
                  fill={chart.series[0]}
                  radius={[0, 4, 4, 0]}
                  maxBarSize={22}
                  isAnimationActive={false}
                  onClick={open}
                >
                  {cells}
                </Bar>
              </BarChart>
            ) : (
              <BarChart
                data={rows}
                margin={{ top: 8, right: 12, bottom: 0, left: 0 }}
              >
                <CartesianGrid vertical={false} stroke={chart.grid} />
                <XAxis
                  dataKey="label"
                  tickLine={false}
                  axisLine={{ stroke: chart.grid }}
                  tick={{ fill: chart.axisText, fontSize: 12 }}
                  minTickGap={8}
                />
                <YAxis
                  width={40}
                  allowDecimals={false}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: chart.axisText, fontSize: 12 }}
                />
                {tooltip}
                <Bar
                  dataKey="count"
                  fill={chart.series[0]}
                  radius={[4, 4, 0, 0]}
                  maxBarSize={40}
                  isAnimationActive={false}
                  onClick={open}
                >
                  {cells}
                </Bar>
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
}
