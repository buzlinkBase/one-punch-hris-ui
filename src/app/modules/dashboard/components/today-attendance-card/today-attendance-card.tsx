import { Card, Empty, Skeleton, Typography } from "antd";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { useChartTheme } from "@/app/modules/analytics/components/charts/chart-theme";
import type { DashboardStats } from "../../models/api/response/dashboard-response.model";
import { DASHBOARD_LABEL } from "../../constants/label.const";

const { Title } = Typography;

interface TodayAttendanceCardProps {
  stats?: DashboardStats;
  loading?: boolean;
}

/** Today's attendance as parts of the employees seen today (a late employee is counted as late, not present). */
export default function TodayAttendanceCard({
  stats,
  loading,
}: TodayAttendanceCardProps) {
  const chart = useChartTheme();

  const parts = stats
    ? [
        {
          label: DASHBOARD_LABEL.PRESENT,
          // Late staff are also present in the API's count, so they're split out here.
          count: Math.max(stats.presentToday - stats.lateToday, 0),
        },
        { label: DASHBOARD_LABEL.LATE, count: stats.lateToday },
        { label: DASHBOARD_LABEL.ABSENT, count: stats.absentToday },
        { label: DASHBOARD_LABEL.ON_LEAVE, count: stats.onLeaveToday },
      ]
    : [];
  const total = parts.reduce((sum, p) => sum + p.count, 0);

  return (
    <Card size="small" className="h-full">
      <Title level={5} className="mb-3!">
        {DASHBOARD_LABEL.TODAY_ATTENDANCE}
      </Title>
      {loading || !stats ? (
        <Skeleton active paragraph={{ rows: 5 }} />
      ) : total === 0 ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="No attendance recorded today"
        />
      ) : (
        <div className="flex flex-col items-center gap-3">
          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={parts}
                  dataKey="count"
                  nameKey="label"
                  innerRadius="60%"
                  outerRadius="90%"
                  paddingAngle={2}
                  stroke={chart.surface}
                  isAnimationActive={false}
                >
                  {parts.map((p, i) => (
                    <Cell key={p.label} fill={chart.series[i]} />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) =>
                    active && payload?.length ? (
                      <div className="rounded-md border border-(--ant-color-border-secondary) bg-(--ant-color-bg-elevated) px-3 py-2 text-xs shadow-md">
                        <span className="text-(--ant-color-text-secondary)">
                          {String(payload[0].name)}
                        </span>{" "}
                        <span className="font-semibold tabular-nums">
                          {Number(payload[0].value ?? 0)}
                        </span>
                      </div>
                    ) : null
                  }
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <ul className="m-0 grid w-full list-none grid-cols-2 gap-x-4 gap-y-1 p-0 text-xs">
            {parts.map((p, i) => (
              <li key={p.label} className="flex items-center gap-1.5">
                <svg aria-hidden width="10" height="10" className="shrink-0">
                  <rect width="10" height="10" rx="2" fill={chart.series[i]} />
                </svg>
                <span className="text-(--ant-color-text-secondary)">
                  {p.label}
                </span>
                <span className="ml-auto font-medium tabular-nums">
                  {p.count}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  );
}
