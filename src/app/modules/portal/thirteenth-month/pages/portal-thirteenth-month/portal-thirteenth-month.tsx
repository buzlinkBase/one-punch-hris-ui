import { useState } from "react";
import {
  Button,
  Card,
  DatePicker,
  Descriptions,
  Empty,
  Popconfirm,
  Skeleton,
  Space,
  Tag,
  Tooltip,
  Typography,
} from "antd";
import {
  CheckCircleOutlined,
  PrinterOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import {
  useAcknowledgeMyPayroll,
  useMy13thMonth,
} from "../../../shared/hooks/use-my-employee-queries";
import type { ThirteenthMonthResponse } from "@/app/modules/reports/payroll-reports/models/api/response/payroll-reports.model";
import { openPdfInNewTab } from "@/shared/utils/download-file.util";
import { API_PREFIX, buildApiUrl } from "@/core/http/api-url.util";

const { Title } = Typography;

const ME_BASE_URL = buildApiUrl(API_PREFIX.hrms, "me");

const STATUS_LABEL: Record<ThirteenthMonthResponse["status"], string> = {
  NotGenerated: "Not Generated",
  Draft: "Draft",
  Posted: "Posted",
};

const STATUS_COLOR: Record<
  ThirteenthMonthResponse["status"],
  "success" | "processing" | "default"
> = {
  NotGenerated: "default",
  Draft: "processing",
  Posted: "success",
};

function formatMoney(value: number) {
  return (value ?? 0).toLocaleString("en-PH", { minimumFractionDigits: 2 });
}

export default function PortalThirteenthMonth() {
  const [year, setYear] = useState(dayjs().year());
  const { data, isLoading, isFetching, refetch } = useMy13thMonth(year);
  const { mutate: acknowledge, isPending: isAcknowledging } =
    useAcknowledgeMyPayroll();

  return (
    <div className="content-page">
      <div className="page-toolbar">
        <div className="page-toolbar-row">
          <div>
            <Title level={4} className="mb-0!">
              My 13th Month Pay
            </Title>
            <p className="page-toolbar-subtitle">
              Your 13th month entitlement for the selected year.
            </p>
          </div>
          <Space wrap>
            <DatePicker
              picker="year"
              value={dayjs().year(year)}
              allowClear={false}
              onChange={(d) => d && setYear(d.year())}
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
        {isLoading ? (
          <Skeleton active paragraph={{ rows: 6 }} />
        ) : !data ? (
          <Empty description="No payroll history found for this year yet." />
        ) : (
          <Card
            title={`${year} 13th Month Pay`}
            extra={
              <Space>
                <Tag color={STATUS_COLOR[data.status]}>
                  {STATUS_LABEL[data.status]}
                </Tag>
                {data.payrollId && (
                  <Button
                    icon={<PrinterOutlined />}
                    onClick={() =>
                      openPdfInNewTab(
                        `${ME_BASE_URL}/payrolls/${data.payrollId}/print`,
                      )
                    }
                  >
                    Print
                  </Button>
                )}
                {data.payrollId &&
                  (data.acknowledgedAt ? (
                    <Tooltip
                      title={`Acknowledged ${dayjs(data.acknowledgedAt).format("MMM D, YYYY h:mm A")}`}
                    >
                      <Tag icon={<CheckCircleOutlined />} color="success">
                        Acknowledged
                      </Tag>
                    </Tooltip>
                  ) : (
                    <Popconfirm
                      title="Acknowledge receipt of this document?"
                      description="Confirms you've received this document. This can't be undone."
                      onConfirm={() => acknowledge(data.payrollId!)}
                      okText="Acknowledge"
                    >
                      <Button loading={isAcknowledging}>
                        Acknowledge Receipt
                      </Button>
                    </Popconfirm>
                  ))}
              </Space>
            }
          >
            <Descriptions column={1} bordered size="middle">
              <Descriptions.Item label="Total Basic Pay for the Year">
                ₱{formatMoney(data.totalBasicPayForYear)}
              </Descriptions.Item>
              <Descriptions.Item label="Special Bonuses for the Year">
                ₱{formatMoney(data.totalSpecialBonusesForYear)}
              </Descriptions.Item>
              <Descriptions.Item label="13th Month Pay">
                <strong className="text-lg">
                  ₱{formatMoney(data.thirteenthMonthPay)}
                </strong>
              </Descriptions.Item>
              {data.netPay != null && (
                <Descriptions.Item label="Net Pay (after tax and deductions)">
                  ₱{formatMoney(data.netPay)}
                </Descriptions.Item>
              )}
            </Descriptions>
          </Card>
        )}
      </div>
    </div>
  );
}
