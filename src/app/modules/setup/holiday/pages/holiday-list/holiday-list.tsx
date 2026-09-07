import { useMemo, useState } from "react";
import { Alert, Button, DatePicker, Space, Typography } from "antd";
import { PlusOutlined, ReloadOutlined } from "@ant-design/icons";
import { useNavigate } from "@tanstack/react-router";
import dayjs from "dayjs";
import { useHolidays, useDeleteHoliday } from "../../hooks/use-holiday-queries";
import HolidayTable from "../../components/holiday-table";
import { HOLIDAY_LABEL } from "../../constants/label.const";

const { Title } = Typography;

export default function HolidayList() {
  const navigate = useNavigate();
  const [year, setYear] = useState(() => dayjs().year());
  const {
    data: holidays = [],
    isLoading,
    refetch,
    isFetching,
  } = useHolidays(year);
  const { data: previousYearHolidays = [] } = useHolidays(year - 1);
  const { mutate: remove } = useDeleteHoliday();

  // Heuristic reminder, not a guarantee: movable holidays (Chinese New Year, Holy Week,
  // etc.) have no fixed formula and must be re-entered every year (isRecuring = false).
  // If this year has fewer of those than last year, HR may not have rolled them over yet.
  const nonRecurringWarning = useMemo(() => {
    const currentCount = holidays.filter((h) => !h.isRecuring).length;
    const previousCount = previousYearHolidays.filter(
      (h) => !h.isRecuring,
    ).length;
    if (previousCount > 0 && currentCount < previousCount) {
      return { currentCount, previousCount };
    }
    return null;
  }, [holidays, previousYearHolidays]);

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
            <DatePicker
              picker="year"
              value={dayjs().year(year)}
              onChange={(d) => {
                if (d) setYear(d.year());
              }}
              allowClear={false}
            />
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
      {nonRecurringWarning && (
        <Alert
          className="mb-3"
          type="warning"
          showIcon
          message={`Only ${nonRecurringWarning.currentCount} year-specific holiday(s) configured for ${year}, vs. ${nonRecurringWarning.previousCount} for ${year - 1}`}
          description="Movable holidays (e.g. Chinese New Year, Holy Week) have no fixed date and don't repeat automatically — confirm they've been added for this year."
        />
      )}
      <HolidayTable data={holidays} loading={isLoading} onDelete={remove} />
    </div>
  );
}
