import { useState } from "react";
import { Alert, App, Button, Card, Table, Tag, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import { toPh } from "@/shared/utils/ph-time.util";
import { TermsLink } from "@/app/modules/legal/components/terms-link";
import { useHasPermission } from "@/shared/hooks/use-has-permission";
import { COMPANY_POLICY_LABEL } from "../../constants/label.const";
import {
  useComplianceAcknowledgments,
  useConfirmOutstandingDeviations,
  useOutstandingDeviations,
} from "../../hooks/use-compliance-acknowledgment-queries";
import type {
  ComplianceAcknowledgmentResponse,
  OutstandingDeviationResponse,
  TermsLivenessState,
} from "../../models/api/response/compliance-acknowledgment-response.model";

const { Text } = Typography;
const L = COMPANY_POLICY_LABEL;

type Scoped = { scope: string };

function settingColumn<T extends Scoped>(): ColumnsType<T>[number] {
  return {
    title: L.ACK_COL_SETTING,
    dataIndex: "settingLabel",
    key: "settingLabel",
    render: (label: string, row: T) => (
      <div>
        <Text strong>{label}</Text>{" "}
        {row.scope !== "company" && <Tag>{L.ACK_CLIENT_OVERRIDE}</Tag>}
      </div>
    ),
  };
}

const COLUMNS: ColumnsType<ComplianceAcknowledgmentResponse> = [
  {
    title: L.ACK_COL_WHEN,
    dataIndex: "acknowledgedAtUtc",
    key: "acknowledgedAtUtc",
    width: 170,
    render: (value: string) => toPh(value).format("MMM D, YYYY h:mm A"),
  },
  settingColumn<ComplianceAcknowledgmentResponse>(),
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

const OUTSTANDING_COLUMNS: ColumnsType<OutstandingDeviationResponse> = [
  settingColumn<OutstandingDeviationResponse>(),
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
    title: L.ACK_COL_WHERE,
    dataIndex: "sources",
    key: "sources",
    render: (sources: string[], row) => (
      <div className="flex flex-col">
        {sources.map((source) => (
          <span key={source}>{source}</span>
        ))}
        {row.sourceCount > sources.length && (
          <Text type="secondary">
            and {row.sourceCount - sources.length} more
          </Text>
        )}
      </div>
    ),
  },
];

// Why confirmations aren't being recorded, when they aren't.
const TERMS_STATE_MESSAGE: Partial<Record<TermsLivenessState, string>> = {
  NotLive: L.ACK_TERMS_NOT_LIVE,
  Unreachable: L.ACK_TERMS_UNREACHABLE,
};

/**
 * Company Settings > DOLE Deviation Log: settings in effect that differ from the DOLE defaults
 * but have no log entry yet, then every logged change (who and when, newest first). The log is
 * evidence kept for the Terms of Service.
 */
export default function ComplianceAcknowledgmentsTab() {
  const { modal, message } = App.useApp();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const { data, isLoading } = useComplianceAcknowledgments(page, pageSize);
  const { data: outstanding, isLoading: outstandingLoading } =
    useOutstandingDeviations();
  const { mutateAsync: confirmAll, isPending: confirming } =
    useConfirmOutstandingDeviations();
  const canEdit = useHasPermission("Organization Setup:Edit");

  const termsState = outstanding?.termsState;
  const termsMessage = termsState ? TERMS_STATE_MESSAGE[termsState] : undefined;
  const outstandingItems = outstanding?.items ?? [];

  const handleConfirmAll = () =>
    modal.confirm({
      title: L.ACK_CONFIRM_ALL_TITLE,
      content: L.ACK_CONFIRM_ALL_CONTENT,
      okText: L.ACK_CONFIRM_ALL,
      onOk: async () => {
        await confirmAll();
        message.success(L.ACK_CONFIRM_ALL_DONE);
      },
    });

  return (
    <Card title={L.TAB_ACKNOWLEDGED_DEVIATIONS}>
      <Alert
        className="mb-4"
        type="info"
        showIcon
        message={L.ACK_INTRO}
        description={<TermsLink section={4}>{L.ACK_TERMS_LINK}</TermsLink>}
      />
      {termsMessage && (
        <Alert
          className="mb-4"
          type={termsState === "Unreachable" ? "error" : "warning"}
          showIcon
          message={termsMessage}
        />
      )}

      {outstandingItems.length > 0 && (
        <div className="mb-6">
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <Text strong>
              {L.ACK_OUTSTANDING_TITLE}{" "}
              <Tag color="warning">{outstandingItems.length}</Tag>
            </Text>
            {canEdit && termsState === "Live" && (
              <Button
                type="primary"
                loading={confirming}
                onClick={handleConfirmAll}
              >
                {L.ACK_CONFIRM_ALL}
              </Button>
            )}
          </div>
          <Text type="secondary" className="mb-2 block">
            {L.ACK_OUTSTANDING_INTRO}
          </Text>
          <Table
            size="small"
            rowKey={(row) =>
              `${row.scope}|${row.settingKey}|${row.configuredValue}`
            }
            loading={outstandingLoading}
            columns={OUTSTANDING_COLUMNS}
            dataSource={outstandingItems}
            scroll={{ x: true }}
            pagination={false}
          />
        </div>
      )}

      {outstandingItems.length > 0 && (
        <Text strong className="mb-2 block">
          {L.ACK_CONFIRMED_TITLE}
        </Text>
      )}
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
