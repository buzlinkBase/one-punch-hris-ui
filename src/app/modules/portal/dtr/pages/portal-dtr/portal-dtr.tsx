import { useState } from "react";
import { Button, Card, Space, Typography } from "antd";
import { ReloadOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { useMyDtrDetail } from "../../../shared/hooks/use-my-employee-queries";
import DtrDetailTable from "@/app/modules/daily-time-record/detail/components/dtr-detail-table";
import { MobileRangePicker } from "@/shared/components/mobile-range-picker";
import { getSemiMonthlyCutoff } from "@/shared/utils/cutoff.util";

const { Title } = Typography;

export default function PortalDtr() {
  const defaultCutoff = getSemiMonthlyCutoff();
  const [dateRange, setDateRange] = useState<[string, string]>([
    defaultCutoff.fromDate,
    defaultCutoff.toDate,
  ]);

  const { data, isLoading, isFetching, refetch } = useMyDtrDetail({
    from: dateRange[0],
    to: dateRange[1],
  });

  return (
    <div className="content-page">
      <div className="page-toolbar">
        <div className="page-toolbar-row">
          <div>
            <Title level={4} className="mb-0!">
              My Daily Time Record
            </Title>
            <p className="page-toolbar-subtitle">
              Your computed hours for the selected period.
            </p>
          </div>
          <Space wrap>
            <MobileRangePicker
              value={[dayjs(dateRange[0]), dayjs(dateRange[1])]}
              onChange={(dates) => {
                if (dates)
                  setDateRange([
                    dates[0]?.format("YYYY-MM-DD") ?? "",
                    dates[1]?.format("YYYY-MM-DD") ?? "",
                  ]);
              }}
            />
            <Button
              icon={<ReloadOutlined spin={isFetching} />}
              onClick={() => refetch()}
              loading={isFetching && !isLoading}
            />
          </Space>
        </div>
      </div>

      <div className="form-page-body">
        <Card>
          <DtrDetailTable
            data={data ?? []}
            loading={isLoading}
            readOnly
            dateFrom={dateRange[0]}
            dateTo={dateRange[1]}
          />
        </Card>
      </div>
    </div>
  );
}
