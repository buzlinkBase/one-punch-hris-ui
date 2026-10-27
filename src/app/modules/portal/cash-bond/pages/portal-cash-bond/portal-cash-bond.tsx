import { Card, Col, Empty, Row, Statistic, Table, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import { useMyCashBond } from "../../../shared/hooks/use-my-employee-queries";
import type {
  MyCashBondAdjustment,
  MyCashBondRun,
} from "../../models/api/response/portal-cash-bond-response.model";
import { formatMoney } from "@/shared/utils/money.util";
import { withRowKeys } from "@/shared/utils/row-key.util";

const { Title, Text } = Typography;

const columns: ColumnsType<MyCashBondRun> = [
  {
    title: "Pay Period",
    key: "period",
    render: (_, r) =>
      `${dayjs(r.payPeriodStart).format("MMM DD, YYYY")} — ${dayjs(r.payPeriodEnd).format("MMM DD, YYYY")}`,
  },
  {
    title: "Amount",
    dataIndex: "amount",
    key: "amount",
    align: "right",
    render: formatMoney,
  },
];

const adjustmentColumns: ColumnsType<MyCashBondAdjustment> = [
  {
    title: "Date",
    dataIndex: "entryDate",
    key: "date",
    render: (v: string) => dayjs(v).format("MMM DD, YYYY"),
  },
  { title: "Details", dataIndex: "particulars", key: "particulars" },
  {
    title: "Amount",
    dataIndex: "amount",
    key: "amount",
    align: "right",
    render: formatMoney,
  },
];

export default function PortalCashBond() {
  const { data, isLoading } = useMyCashBond();
  const runs = data?.runs ?? [];
  const adjustments = data?.adjustments ?? [];

  return (
    <div className="content-page">
      <div className="page-toolbar">
        <div className="page-toolbar-row">
          <div>
            <Title level={4} className="mb-0!">
              My Cash Bond
            </Title>
            <p className="page-toolbar-subtitle">
              Your Cash Bond rate and how much has been collected so far.
            </p>
          </div>
        </div>
      </div>

      <div className="form-page-body">
        <Card>
          {!isLoading && runs.length === 0 && adjustments.length === 0 ? (
            <Empty description="No cash bond deductions on file." />
          ) : (
            <>
              <Row gutter={16} className="mb-4">
                <Col>
                  <Card size="small">
                    <Statistic
                      title="Cash Bond Rate (per run)"
                      value={data?.cashBondRate ?? 0}
                      precision={2}
                      prefix="₱"
                    />
                  </Card>
                </Col>
                <Col>
                  <Card size="small">
                    <Statistic
                      title="Total Collected"
                      value={data?.totalCollected ?? 0}
                      precision={2}
                      prefix="₱"
                    />
                  </Card>
                </Col>
                {(data?.refunded ?? 0) > 0 && (
                  <Col>
                    <Card size="small">
                      <Statistic
                        title="Refunded in Last Pay"
                        value={data?.refunded ?? 0}
                        precision={2}
                        prefix="₱"
                      />
                    </Card>
                  </Col>
                )}
              </Row>
              {adjustments.length > 0 && (
                <div className="mb-4">
                  <Title level={5}>Beginning Balance & Adjustments</Title>
                  <Table<MyCashBondAdjustment>
                    scroll={{ x: "max-content" }}
                    columns={adjustmentColumns}
                    dataSource={withRowKeys(adjustments, (r) => r.entryDate)}
                    pagination={false}
                    size="small"
                  />
                </div>
              )}
              <Title level={5}>Payroll Deductions & Refund</Title>
              <Table<MyCashBondRun>
                scroll={{ x: "max-content" }}
                rowKey="payrollId"
                loading={isLoading}
                columns={columns}
                dataSource={runs}
                pagination={{ pageSize: 10 }}
              />
            </>
          )}
          <Text type="secondary" className="text-xs">
            Your cash bond is paid back in your Last Pay when you separate,
            unless HR holds it pending clearance. A refund shows as a negative
            amount above.
          </Text>
        </Card>
      </div>
    </div>
  );
}
