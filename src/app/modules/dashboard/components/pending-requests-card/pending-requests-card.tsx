import type { ReactNode } from "react";
import { Card, Empty, Skeleton, Tag, Typography, theme } from "antd";
import {
  CalendarOutlined,
  ClockCircleOutlined,
  FieldTimeOutlined,
  RetweetOutlined,
  SwapOutlined,
  GlobalOutlined,
  MinusCircleOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import type {
  PendingRequest,
  PendingRequestType,
} from "../../models/api/response/dashboard-response.model";
import { DASHBOARD_LABEL } from "../../constants/label.const";

const { Title, Text } = Typography;

interface PendingRequestsCardProps {
  data: PendingRequest[];
  loading?: boolean;
}

const REQUEST_TYPE_LABEL: Record<PendingRequestType, string> = {
  leave: "Leave",
  "change-rest-day": "Rest Day Change",
  "change-holiday": "Holiday Change",
  "work-rotation": "Work Rotation",
  overtime: "Overtime",
  undertime: "Undertime",
  "official-business": "Official Business",
};

const REQUEST_TYPE_ICON: Record<PendingRequestType, ReactNode> = {
  leave: <CalendarOutlined />,
  "change-rest-day": <SwapOutlined />,
  "change-holiday": <FieldTimeOutlined />,
  "work-rotation": <RetweetOutlined />,
  overtime: <ClockCircleOutlined />,
  undertime: <MinusCircleOutlined />,
  "official-business": <GlobalOutlined />,
};

const REQUEST_TYPE_COLOR: Record<PendingRequestType, string> = {
  leave: "#52C41A",
  "change-rest-day": "#1890FF",
  "change-holiday": "#722ED1",
  "work-rotation": "#13C2C2",
  overtime: "#FAAD14",
  undertime: "#FF7A45",
  "official-business": "#1DA081",
};

export default function PendingRequestsCard({
  data,
  loading,
}: PendingRequestsCardProps) {
  const { token } = theme.useToken();
  return (
    <Card size="small" className="h-full">
      <Title level={5} className="mb-4!">
        {DASHBOARD_LABEL.PENDING_APPROVALS}
      </Title>
      {loading ? (
        <Skeleton active paragraph={{ rows: 4 }} />
      ) : data.length === 0 ? (
        <Empty description="No pending approvals" />
      ) : (
        <div className="flex flex-col gap-3">
          {data.map((req) => {
            const color = REQUEST_TYPE_COLOR[req.type] ?? "#8C8C8C";
            return (
              <div
                key={req.id}
                className="flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs"
                    style={{ background: `${color}15`, color }}
                  >
                    {REQUEST_TYPE_ICON[req.type]}
                  </div>
                  <div className="min-w-0">
                    <p
                      className="m-0 text-sm font-medium truncate"
                      style={{ color: token.colorText }}
                    >
                      {req.employeeName}
                    </p>
                    <Text type="secondary" className="text-xs">
                      {REQUEST_TYPE_LABEL[req.type]} ·{" "}
                      {dayjs(req.submittedAt).format("MMM D")}
                    </Text>
                  </div>
                </div>
                <Tag color="gold" className="shrink-0">
                  Pending
                </Tag>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
