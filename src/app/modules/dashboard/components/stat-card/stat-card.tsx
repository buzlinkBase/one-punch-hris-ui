import type { ReactNode } from "react";
import { Card, Skeleton, Statistic, theme } from "antd";

interface StatCardProps {
  title: string;
  value: number | string;
  icon: ReactNode;
  color: string;
  loading?: boolean;
  suffix?: string;
  subtext?: string;
}

export default function StatCard({
  title,
  value,
  icon,
  color,
  loading,
  suffix,
  subtext,
}: StatCardProps) {
  const { token } = theme.useToken();
  return (
    <Card size="small" className="h-full">
      {loading ? (
        <Skeleton active paragraph={false} title={{ width: "60%" }} />
      ) : (
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 text-lg"
            style={{ background: `${color}1a`, color }}
          >
            {icon}
          </div>
          <div className="min-w-0">
            <Statistic
              title={
                <span
                  className="text-xs"
                  style={{ color: token.colorTextSecondary }}
                >
                  {title}
                </span>
              }
              value={value}
              suffix={suffix}
              valueStyle={{ fontSize: 20, fontWeight: 600, lineHeight: 1.2 }}
            />
            {subtext && (
              <span className="text-xs font-medium" style={{ color }}>
                {subtext}
              </span>
            )}
          </div>
        </div>
      )}
    </Card>
  );
}
