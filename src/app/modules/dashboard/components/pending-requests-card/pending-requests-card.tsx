import { Card, Empty, Skeleton, Tag, Typography } from "antd";
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
  leave: "Leave Request",
  "change-rest-day": "Change Rest Day",
  "change-holiday": "Change Holiday",
  "work-rotation": "Work Rotation",
  overtime: "Overtime",
};

export default function PendingRequestsCard({
  data,
  loading,
}: PendingRequestsCardProps) {
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
          {data.map((req) => (
            <div
              key={req.id}
              className="flex items-center justify-between gap-3"
            >
              <div className="min-w-0">
                <p className="m-0 text-sm font-medium text-gray-800 truncate">
                  {req.employeeName}
                </p>
                <Text type="secondary" className="text-xs">
                  {REQUEST_TYPE_LABEL[req.type]} ·{" "}
                  {dayjs(req.submittedAt).format("MMM D")}
                </Text>
              </div>
              <Tag color="gold" className="shrink-0">
                Pending
              </Tag>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
