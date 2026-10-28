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
import {
  THIRTEENTH_MONTH_LABEL,
  THIRTEENTH_MONTH_STATUS_COLOR,
  THIRTEENTH_MONTH_STATUS_LABEL,
  isStillUnpaid,
} from "@/app/modules/reports/payroll-reports/constants/thirteenth-month.const";
import { openPdfInNewTab } from "@/shared/utils/download-file.util";
import { API_PREFIX, buildApiUrl } from "@/core/http/api-url.util";
import { formatMoney } from "@/shared/utils/money.util";

const { Title } = Typography;

const ME_BASE_URL = buildApiUrl(API_PREFIX.hrms, "me");

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
              Your 13th month is your basic pay earned this year ÷ 12. It grows
              with every payroll until the year's last cutoff.
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
              aria-label="Refresh"
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
                <Tag color={THIRTEENTH_MONTH_STATUS_COLOR[data.status]}>
                  {THIRTEENTH_MONTH_STATUS_LABEL[data.status]}
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
              <Descriptions.Item label={THIRTEENTH_MONTH_LABEL.BASIC_PAY}>
                ₱{formatMoney(data.totalBasicPayForYear)}
              </Descriptions.Item>
              <Descriptions.Item label={THIRTEENTH_MONTH_LABEL.SPECIAL_BONUSES}>
                ₱{formatMoney(data.totalSpecialBonusesForYear)}
              </Descriptions.Item>
              <Descriptions.Item label={THIRTEENTH_MONTH_LABEL.EARNED}>
                <strong className="text-lg">
                  ₱{formatMoney(data.thirteenthMonthPay)}
                </strong>
              </Descriptions.Item>
              {data.netPay != null && (
                <Descriptions.Item label={THIRTEENTH_MONTH_LABEL.RELEASED}>
                  ₱{formatMoney(data.netPay)}
                </Descriptions.Item>
              )}
              {isStillUnpaid(data) && (
                <Descriptions.Item label={THIRTEENTH_MONTH_LABEL.STILL_UNPAID}>
                  <strong className="text-orange-600">
                    ₱{formatMoney(data.stillUnpaid)}
                  </strong>
                  <div className="text-xs opacity-70">
                    Earned in payrolls after your 13th month was released. Ask
                    HR about when it will be paid.
                  </div>
                </Descriptions.Item>
              )}
            </Descriptions>
          </Card>
        )}
      </div>
    </div>
  );
}
