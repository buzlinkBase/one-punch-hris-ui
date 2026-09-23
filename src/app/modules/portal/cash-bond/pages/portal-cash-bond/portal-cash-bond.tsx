import { Card, Col, Empty, Row, Statistic, Table, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import { useMyCashBond } from "../../../shared/hooks/use-my-employee-queries";
import type { MyCashBondRun } from "../../models/api/response/portal-cash-bond-response.model";

const { Title, Text } = Typography;

const fmt = (n: number) =>
  (n ?? 0).toLocaleString("en-PH", { minimumFractionDigits: 2 });

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
    render: fmt,
  },
];

export default function PortalCashBond() {
  const { data, isLoading } = useMyCashBond();
  const runs = data?.runs ?? [];

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
          {!isLoading && runs.length === 0 ? (
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
              </Row>
              <Table<MyCashBondRun>
                rowKey="payrollId"
                loading={isLoading}
                columns={columns}
                dataSource={runs}
                pagination={{ pageSize: 10 }}
              />
            </>
          )}
          <Text type="secondary" className="text-xs">
            Refunds, if any, are handled manually by HR as part of clearance —
            they are not automatically added to your pay.
          </Text>
        </Card>
      </div>
    </div>
  );
}
