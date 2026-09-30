import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type {
  AnalyticsPoint,
  AnalyticsSeries,
} from "../../models/analytics.model";
import { formatAxisValue, formatValue } from "../../utils/analytics-format";
import { formatPeriod } from "../../utils/analytics-filter";
import { useChartTheme } from "./chart-theme";

/** line: a trend. bar: side-by-side values per month. stacked: parts that add up to a total. */
export type TrendChartKind = "line" | "bar" | "stacked";

interface TrendChartProps {
  kind: TrendChartKind;
  points: AnalyticsPoint[];
  /** In color order. All share one unit -- one chart, one axis. */
  series: AnalyticsSeries[];
}

/** A series' color key -- an SVG fill, since the color is data rather than a style. */
function Swatch({ color }: { color: string }) {
  return (
    <svg aria-hidden width="10" height="10" className="shrink-0">
      <rect width="10" height="10" rx="2" fill={color} />
    </svg>
  );
}

interface TooltipEntry {
  dataKey?: unknown;
  value?: unknown;
  color?: string;
}

interface ChartTooltipProps {
  active?: boolean;
  payload?: ReadonlyArray<TooltipEntry>;
  label?: unknown;
  series: AnalyticsSeries[];
  showTotal: boolean;
}

function ChartTooltip({
  active,
  payload,
  label,
  series,
  showTotal,
}: ChartTooltipProps) {
  if (!active || !payload?.length) return null;
  const unit = series[0]?.unit ?? "Count";
  const total = payload.reduce((sum, p) => sum + Number(p.value ?? 0), 0);
  return (
    <div className="rounded-md border border-(--ant-color-border-secondary) bg-(--ant-color-bg-elevated) px-3 py-2 text-xs shadow-md">
      <div className="mb-1 font-semibold">{String(label ?? "")}</div>
      {payload.map((p) => {
        const s = series.find((x) => x.key === p.dataKey);
        return (
          <div key={String(p.dataKey)} className="flex items-center gap-2">
            <Swatch color={p.color ?? ""} />

            <span className="text-(--ant-color-text-secondary)">
              {s?.label ?? String(p.dataKey)}
            </span>
            <span className="ml-auto pl-4 font-medium tabular-nums">
              {formatValue(Number(p.value ?? 0), s?.unit ?? unit)}
            </span>
          </div>
        );
      })}
      {showTotal && payload.length > 1 && (
        <div className="mt-1 flex gap-2 border-t border-(--ant-color-border-secondary) pt-1">
          <span className="text-(--ant-color-text-secondary)">Total</span>
          <span className="ml-auto pl-4 font-semibold tabular-nums">
            {formatValue(total, unit)}
          </span>
        </div>
      )}
    </div>
  );
}

/** A monthly trend with the house marks: 2px lines, 8px dots, 4px rounded bar ends, a legend for 2+ series. */
export function TrendChart({ kind, points, series }: TrendChartProps) {
  const chart = useChartTheme();
  const unit = series[0]?.unit ?? "Count";
  const data = points.map((p) => ({
    period: formatPeriod(p.period),
    ...p.values,
  }));
  const colorOf = (index: number) => chart.series[index % chart.series.length];

  const axes = (
    <>
      <CartesianGrid vertical={false} stroke={chart.grid} />
      <XAxis
        dataKey="period"
        tickLine={false}
        axisLine={{ stroke: chart.grid }}
        tick={{ fill: chart.axisText, fontSize: 12 }}
        minTickGap={12}
      />
      <YAxis
        width={60}
        tickLine={false}
        axisLine={false}
        tick={{ fill: chart.axisText, fontSize: 12 }}
        tickFormatter={(v: number) => formatAxisValue(v, unit)}
        allowDecimals={unit !== "Count"}
      />
      <Tooltip
        cursor={
          kind === "line" ? { stroke: chart.grid } : { fill: chart.cursor }
        }
        content={(props) => (
          <ChartTooltip
            active={props.active}
            payload={props.payload}
            label={props.label}
            series={series}
            showTotal={kind === "stacked"}
          />
        )}
      />
    </>
  );

  return (
    <div>
      {series.length > 1 && (
        <ul className="mb-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-(--ant-color-text-secondary)">
          {series.map((s, i) => (
            <li key={s.key} className="flex items-center gap-1.5">
              <Swatch color={colorOf(i)} />

              {s.label}
            </li>
          ))}
        </ul>
      )}
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          {kind === "line" ? (
            <LineChart
              data={data}
              margin={{ top: 8, right: 12, bottom: 0, left: 0 }}
            >
              {axes}
              {series.map((s, i) => (
                <Line
                  key={s.key}
                  type="linear"
                  dataKey={s.key}
                  name={s.label}
                  stroke={colorOf(i)}
                  strokeWidth={2}
                  dot={{ r: 4, strokeWidth: 2, stroke: chart.surface }}
                  activeDot={{ r: 5, strokeWidth: 2, stroke: chart.surface }}
                  isAnimationActive={false}
                />
              ))}
            </LineChart>
          ) : (
            <BarChart
              data={data}
              margin={{ top: 8, right: 12, bottom: 0, left: 0 }}
              barGap={2}
            >
              {axes}
              {series.map((s, i) => {
                const isTop = kind === "bar" || i === series.length - 1;
                return (
                  <Bar
                    key={s.key}
                    dataKey={s.key}
                    name={s.label}
                    fill={colorOf(i)}
                    stackId={kind === "stacked" ? "total" : undefined}
                    // A 1px surface stroke on each side makes the 2px gap between fills.
                    stroke={chart.surface}
                    strokeWidth={1}
                    radius={isTop ? [4, 4, 0, 0] : 0}
                    maxBarSize={36}
                    isAnimationActive={false}
                  />
                );
              })}
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}
