import { useState } from "react";
import { Alert, Card, Table, Tag, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import { toPh } from "@/shared/utils/ph-time.util";
import { TermsLink } from "@/app/modules/legal/components/terms-link";
import { COMPANY_POLICY_LABEL } from "../../constants/label.const";
import { useComplianceAcknowledgments } from "../../hooks/use-compliance-acknowledgment-queries";
import type { ComplianceAcknowledgmentResponse } from "../../models/api/response/compliance-acknowledgment-response.model";

const { Text } = Typography;
const L = COMPANY_POLICY_LABEL;

const COLUMNS: ColumnsType<ComplianceAcknowledgmentResponse> = [
  {
    title: L.ACK_COL_WHEN,
    dataIndex: "acknowledgedAtUtc",
    key: "acknowledgedAtUtc",
    width: 170,
    render: (value: string) => toPh(value).format("MMM D, YYYY h:mm A"),
  },
  {
    title: L.ACK_COL_SETTING,
    dataIndex: "settingLabel",
    key: "settingLabel",
    render: (label: string, row) => (
      <div>
        <Text strong>{label}</Text>{" "}
        {row.scope !== "company" && <Tag>{L.ACK_CLIENT_OVERRIDE}</Tag>}
      </div>
    ),
  },
  {
    title: L.ACK_COL_DEFAULT,
    dataIndex: "statutoryValue",
    key: "statutoryValue",
  },
  {
    title: L.ACK_COL_VALUE,
    dataIndex: "configuredValue",
    key: "configuredValue",
    render: (value: string) => <Text type="danger">{value}</Text>,
  },
  {
    title: L.ACK_COL_BY,
    dataIndex: "userEmail",
    key: "userEmail",
    render: (email: string | null) => email ?? "—",
  },
];

/**
 * Company Settings > Acknowledged Deviations: every time an admin confirmed a setting that differs
 * from the DOLE defaults (newest first). Read-only evidence kept for the Terms of Service.
 */
export default function ComplianceAcknowledgmentsTab() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const { data, isLoading } = useComplianceAcknowledgments(page, pageSize);

  return (
    <Card title={L.TAB_ACKNOWLEDGED_DEVIATIONS}>
      <Alert
        className="mb-4"
        type="info"
        showIcon
        message={L.ACK_INTRO}
        description={<TermsLink section={4}>{L.ACK_TERMS_LINK}</TermsLink>}
      />
      <Table
        size="small"
        rowKey="id"
        loading={isLoading}
        columns={COLUMNS}
        dataSource={data?.items ?? []}
        scroll={{ x: true }}
        locale={{ emptyText: L.ACK_EMPTY }}
        pagination={{
          current: page,
          pageSize,
          total: data?.total ?? 0,
          showSizeChanger: true,
          onChange: (next, size) => {
            setPage(size === pageSize ? next : 1);
            setPageSize(size);
          },
        }}
      />
    </Card>
  );
}
