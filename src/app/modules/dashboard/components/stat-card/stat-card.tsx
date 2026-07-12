import type { ReactNode } from "react";
import { Card, Skeleton, Statistic } from "antd";

interface StatCardProps {
  title: string;
  value: number;
  icon: ReactNode;
  color: string;
  loading?: boolean;
  suffix?: string;
}

export default function StatCard({
  title,
  value,
  icon,
  color,
  loading,
  suffix,
}: StatCardProps) {
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
          <Statistic
            title={<span className="text-xs text-gray-500">{title}</span>}
            value={value}
            suffix={suffix}
            valueStyle={{ fontSize: 22, fontWeight: 600 }}
          />
        </div>
      )}
    </Card>
  );
}
