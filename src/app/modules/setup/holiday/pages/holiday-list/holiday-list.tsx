import { Button, Space, Typography } from "antd";
import { PlusOutlined, ReloadOutlined } from "@ant-design/icons";
import { useNavigate } from "@tanstack/react-router";
import { useHolidays, useDeleteHoliday } from "../../hooks/use-holiday-queries";
import HolidayTable from "../../components/holiday-table";
import { HOLIDAY_LABEL } from "../../constants/label.const";

const { Title } = Typography;

export default function HolidayList() {
  const navigate = useNavigate();
  const { data: holidays = [], isLoading, refetch, isFetching } = useHolidays();
  const { mutate: remove } = useDeleteHoliday();

  return (
    <div className="content-page">
      <div className="page-toolbar">
        <div className="page-toolbar-row">
          <div>
            <Title level={4} className="mb-0!">
              {HOLIDAY_LABEL.TITLE}
            </Title>
            <p className="page-toolbar-subtitle">
              Maintain holiday calendars used for scheduling and payroll rules.
            </p>
          </div>
          <Space>
            <Button
              icon={<ReloadOutlined spin={isFetching} />}
              onClick={() => refetch()}
              loading={isFetching && !isLoading}
            />
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => navigate({ to: "/setup/holiday/create" })}
            >
              Add Holiday
            </Button>
          </Space>
        </div>
      </div>
      <HolidayTable data={holidays} loading={isLoading} onDelete={remove} />
    </div>
  );
}
