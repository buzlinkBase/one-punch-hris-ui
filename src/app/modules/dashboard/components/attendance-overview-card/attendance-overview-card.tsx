import { Card, Skeleton, Typography } from "antd";
import type { AttendanceTrendPoint } from "../../models/api/response/dashboard-response.model";
import { DASHBOARD_LABEL } from "../../constants/label.const";

const { Title, Text } = Typography;

interface AttendanceOverviewCardProps {
  data: AttendanceTrendPoint[];
  loading?: boolean;
}

const SERIES = [
  { key: "present" as const, label: "Present", color: "#1DA081" },
  { key: "late" as const, label: "Late", color: "#FAAD14" },
  { key: "absent" as const, label: "Absent", color: "#F5222D" },
];

export default function AttendanceOverviewCard({
  data,
  loading,
}: AttendanceOverviewCardProps) {
  const max = Math.max(1, ...data.map((d) => d.present + d.late + d.absent));

  return (
    <Card size="small" className="h-full">
      <div className="flex items-start justify-between mb-4">
        <div>
          <Title level={5} className="mb-0!">
            {DASHBOARD_LABEL.ATTENDANCE_OVERVIEW}
          </Title>
          <Text type="secondary" className="text-xs">
            {DASHBOARD_LABEL.ATTENDANCE_OVERVIEW_SUBTITLE}
          </Text>
        </div>
        <div className="flex gap-3">
          {SERIES.map((s) => (
            <div key={s.key} className="flex items-center gap-1.5">
              <span
                className="w-2 h-2 rounded-full inline-block"
                style={{ background: s.color }}
              />
              <span className="text-xs text-gray-500">{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {loading ? (
        <Skeleton active paragraph={{ rows: 4 }} />
      ) : (
        <div className="flex items-end gap-3" style={{ height: 180 }}>
          {data.map((point) => {
            const total = point.present + point.late + point.absent;
            const heightPct = (total / max) * 100;
            return (
              <div
                key={point.date}
                className="flex-1 flex flex-col items-center gap-2 h-full justify-end"
              >
                <div
                  className="w-full rounded-md overflow-hidden flex flex-col justify-end"
                  style={{ height: `${heightPct}%`, minHeight: 4 }}
                  title={`Present ${point.present} · Late ${point.late} · Absent ${point.absent}`}
                >
                  {SERIES.map((s) => (
                    <div
                      key={s.key}
                      style={{
                        background: s.color,
                        height: `${(point[s.key] / total) * 100}%`,
                      }}
                    />
                  ))}
                </div>
                <span className="text-[11px] text-gray-400">{point.date}</span>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
