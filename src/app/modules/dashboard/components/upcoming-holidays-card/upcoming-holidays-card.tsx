import { Card, Empty, Skeleton, Tag, Typography } from "antd";
import { CalendarOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import type { UpcomingHoliday } from "../../models/api/response/dashboard-response.model";
import { DASHBOARD_LABEL } from "../../constants/label.const";

const { Title, Text } = Typography;

interface UpcomingHolidaysCardProps {
  data: UpcomingHoliday[];
  loading?: boolean;
}

export default function UpcomingHolidaysCard({
  data,
  loading,
}: UpcomingHolidaysCardProps) {
  return (
    <Card size="small" className="h-full">
      <Title level={5} className="mb-4!">
        {DASHBOARD_LABEL.UPCOMING_HOLIDAYS}
      </Title>
      {loading ? (
        <Skeleton active paragraph={{ rows: 4 }} />
      ) : data.length === 0 ? (
        <Empty description="No upcoming holidays" />
      ) : (
        <div className="flex flex-col gap-3">
          {data.map((holiday) => (
            <div key={holiday.id} className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                <CalendarOutlined />
              </div>
              <div className="min-w-0 flex-1">
                <p className="m-0 text-sm font-medium text-gray-800 truncate">
                  {holiday.name}
                </p>
                <Text type="secondary" className="text-xs">
                  {dayjs(holiday.date).format("MMM D, YYYY")}
                </Text>
              </div>
              <Tag color={holiday.type === "Regular" ? "green" : "orange"}>
                {holiday.type}
              </Tag>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
