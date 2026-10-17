import { Card, Empty, Skeleton, Tag, Typography } from "antd";
import { GiftOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import type { UpcomingBirthday } from "../../models/api/response/dashboard-response.model";
import { DASHBOARD_LABEL } from "../../constants/label.const";

const { Title, Text } = Typography;

interface UpcomingBirthdaysCardProps {
  data: UpcomingBirthday[];
  loading?: boolean;
}

function whenLabel(item: UpcomingBirthday): string {
  if (item.daysUntil === 0) return "Today";
  if (item.daysUntil === 1) return "Tomorrow";
  // Year is irrelevant; 2000 is a leap year so Feb 29 formats correctly.
  return dayjs(new Date(2000, item.month - 1, item.day)).format("MMM D");
}

export default function UpcomingBirthdaysCard({
  data,
  loading,
}: UpcomingBirthdaysCardProps) {
  return (
    <Card size="small" className="h-full">
      <Title level={5} className="mb-4!">
        {DASHBOARD_LABEL.UPCOMING_BIRTHDAYS}
      </Title>
      {loading ? (
        <Skeleton active paragraph={{ rows: 4 }} />
      ) : data.length === 0 ? (
        <Empty description="No birthdays in the next 30 days" />
      ) : (
        <div className="flex flex-col gap-3">
          {data.map((item) => (
            <div key={item.id} className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 bg-[#1DA081]/10 text-[#1DA081]">
                <GiftOutlined />
              </div>
              <div className="min-w-0 flex-1">
                <p className="m-0 text-sm font-medium truncate">{item.name}</p>
                <Text type="secondary" className="text-xs">
                  {whenLabel(item)}
                  {item.departmentName ? ` · ${item.departmentName}` : ""}
                </Text>
              </div>
              <Tag color={item.shareBirthday ? "green" : "default"}>
                {item.shareBirthday ? "Shared" : "Private"}
              </Tag>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
