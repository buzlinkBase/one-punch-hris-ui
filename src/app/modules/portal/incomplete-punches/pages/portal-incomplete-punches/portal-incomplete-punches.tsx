import { useMemo, useState } from "react";
import { Button, Card, Space, Typography } from "antd";
import { FileAddOutlined, ReloadOutlined } from "@ant-design/icons";
import { useNavigate } from "@tanstack/react-router";
import dayjs from "dayjs";
import { useMyIncompletePunches } from "../../../shared/hooks/use-my-employee-queries";
import CleanColumnarTable from "@/app/modules/timekeeping/raw-logs/components/clean-columnar-table";
import { MobileRangePicker } from "@/shared/components/mobile-range-picker";
import { getSemiMonthlyCutoff } from "@/shared/utils/cutoff.util";
import { filterIncompletePunches } from "@/app/modules/timekeeping/incomplete-punches/utils/incomplete-punch.util";
import { buildPassSlipPrefill } from "../../utils/pass-slip-prefill.util";

const { Title } = Typography;

export default function PortalIncompletePunches() {
  const navigate = useNavigate();
  const defaultCutoff = getSemiMonthlyCutoff();
  const [dateRange, setDateRange] = useState<[string, string]>([
    defaultCutoff.fromDate,
    defaultCutoff.toDate,
  ]);

  const { data, isLoading, isFetching, refetch } = useMyIncompletePunches({
    from: dateRange[0],
    to: dateRange[1],
  });

  // Same rule as the admin Incomplete Punches screen -- only days missing a punch.
  const incomplete = useMemo(() => filterIncompletePunches(data ?? []), [data]);

  return (
    <div className="content-page">
      <div className="page-toolbar">
        <div className="page-toolbar-row">
          <div>
            <Title level={4} className="mb-0!">
              My Incomplete / Missing Logs
            </Title>
            <p className="page-toolbar-subtitle">
              Days in the selected period with no punches or a missing
              time-in/time-out pair.
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
          <CleanColumnarTable
            data={incomplete}
            loading={isLoading}
            renderAction={(record) => (
              <Button
                size="small"
                icon={<FileAddOutlined />}
                onClick={() =>
                  navigate({
                    to: "/portal/pass-slip/create",
                    search: buildPassSlipPrefill(record),
                  })
                }
              >
                File Pass Slip
              </Button>
            )}
          />
        </Card>
      </div>
    </div>
  );
}
