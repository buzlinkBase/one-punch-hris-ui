import type { ReactNode } from "react";
import { Card, Empty, Skeleton, Typography } from "antd";
import {
  ClockCircleOutlined,
  FileTextOutlined,
  LogoutOutlined,
  SwapOutlined,
  UserAddOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import type {
  ActivityType,
  RecentActivity,
} from "../../models/api/response/dashboard-response.model";
import { DASHBOARD_LABEL } from "../../constants/label.const";

dayjs.extend(relativeTime);

const { Title, Text } = Typography;

interface RecentActivityCardProps {
  data: RecentActivity[];
  loading?: boolean;
}

const ACTIVITY_ICON: Record<ActivityType, ReactNode> = {
  "punch-in": <ClockCircleOutlined />,
  "punch-out": <LogoutOutlined />,
  "leave-request": <FileTextOutlined />,
  "new-hire": <UserAddOutlined />,
  "schedule-change": <SwapOutlined />,
  document: <FileTextOutlined />,
};

const ACTIVITY_COLOR: Record<ActivityType, string> = {
  "punch-in": "#1DA081",
  "punch-out": "#1890FF",
  "leave-request": "#FAAD14",
  "new-hire": "#722ED1",
  "schedule-change": "#13C2C2",
  document: "#8C8C8C",
};

export default function RecentActivityCard({
  data,
  loading,
}: RecentActivityCardProps) {
  return (
    <Card size="small" className="h-full">
      <Title level={5} className="mb-4!">
        {DASHBOARD_LABEL.RECENT_ACTIVITY}
      </Title>
      {loading ? (
        <Skeleton active paragraph={{ rows: 5 }} />
      ) : data.length === 0 ? (
        <Empty description="No recent activity" />
      ) : (
        <div className="flex flex-col gap-4">
          {data.map((activity) => (
            <div key={activity.id} className="flex items-start gap-3">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-sm"
                style={{
                  background: `${ACTIVITY_COLOR[activity.type]}1a`,
                  color: ACTIVITY_COLOR[activity.type],
                }}
              >
                {ACTIVITY_ICON[activity.type]}
              </div>
              <div className="min-w-0 flex-1">
                <p className="m-0 text-sm text-gray-800">
                  <span className="font-medium">{activity.employeeName}</span>{" "}
                  <span className="text-gray-500">{activity.description}</span>
                </p>
                <Text type="secondary" className="text-xs">
                  {dayjs(activity.timestamp).fromNow()}
                </Text>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
