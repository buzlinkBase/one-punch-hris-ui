import {
  Descriptions,
  Tag,
  Typography,
  Button,
  Space,
  Skeleton,
  Table,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { useNavigate } from "@tanstack/react-router";
import dayjs from "dayjs";
import { useRouteParams } from "@/shared/hooks/use-route-params";
import { useAuditLog } from "../../hooks/use-audit-queries";
import {
  AUDIT_LABEL,
  AUDIT_ACTION_COLORS,
  AUDIT_SOURCE_LABELS,
  AUDIT_STATUS_COLORS,
} from "../../constants/label.const";
import type { AuditChange } from "../../models/api/response/audit-response.model";
import { NAVIGATION_BUTTON_LABEL } from "@/shared/constants/navigation.const";

const { Title, Text } = Typography;

const CHANGE_COLUMNS: ColumnsType<AuditChange> = [
  { title: AUDIT_LABEL.FIELD, dataIndex: "property", key: "property" },
  {
    title: AUDIT_LABEL.BEFORE,
    dataIndex: "oldValue",
    key: "oldValue",
    render: (value: string | null) => value ?? <Text type="secondary">—</Text>,
  },
  {
    title: AUDIT_LABEL.AFTER,
    dataIndex: "newValue",
    key: "newValue",
    render: (value: string | null) => value ?? <Text type="secondary">—</Text>,
  },
];

export default function AuditDetail() {
  const { id } = useRouteParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: audit, isLoading } = useAuditLog(id);

  return (
    <div className="content-page">
      <div className="page-toolbar">
        <div className="page-toolbar-row">
          <div>
            <Title level={4} className="mb-0!">
              {AUDIT_LABEL.DETAIL_TITLE}
            </Title>
            <p className="page-toolbar-subtitle">
              Full details of the selected audit log entry.
            </p>
          </div>
          <Space>
            <Button onClick={() => navigate({ to: "/security/audit" })}>
              {NAVIGATION_BUTTON_LABEL.BACK}
            </Button>
          </Space>
        </div>
      </div>

      <div className="form-page-body flex flex-col gap-4">
        {isLoading || !audit ? (
          <Skeleton active paragraph={{ rows: 8 }} />
        ) : (
          <>
            <Descriptions
              bordered
              column={{ xs: 1, sm: 1, md: 2 }}
              size="small"
            >
              <Descriptions.Item label={AUDIT_LABEL.TIMESTAMP} span={2}>
                {dayjs(audit.timestamp).format("MMMM DD, YYYY — HH:mm:ss")}
              </Descriptions.Item>

              <Descriptions.Item label={AUDIT_LABEL.ACTION}>
                <Tag color={AUDIT_ACTION_COLORS[audit.action] ?? "default"}>
                  {audit.action}
                </Tag>
              </Descriptions.Item>

              <Descriptions.Item label={AUDIT_LABEL.STATUS}>
                <Tag color={AUDIT_STATUS_COLORS[audit.status] ?? "default"}>
                  {audit.status}
                </Tag>
              </Descriptions.Item>

              <Descriptions.Item label={AUDIT_LABEL.MODULE}>
                {audit.module}
              </Descriptions.Item>

              <Descriptions.Item label={AUDIT_LABEL.RESOURCE_ID}>
                {audit.resourceId ? <code>{audit.resourceId}</code> : "—"}
              </Descriptions.Item>

              <Descriptions.Item label={AUDIT_LABEL.USER}>
                {audit.userName ?? "—"}
                {audit.userId && (
                  <span className="ml-2 text-xs text-gray-400">
                    ({audit.userId})
                  </span>
                )}
              </Descriptions.Item>

              <Descriptions.Item label={AUDIT_LABEL.SOURCE}>
                {(audit.source && AUDIT_SOURCE_LABELS[audit.source]) ??
                  audit.source ??
                  "—"}
              </Descriptions.Item>

              <Descriptions.Item label={AUDIT_LABEL.IP_ADDRESS} span={2}>
                {audit.ipAddress ?? "—"}
              </Descriptions.Item>

              <Descriptions.Item label={AUDIT_LABEL.DESCRIPTION} span={2}>
                {audit.description ?? "—"}
              </Descriptions.Item>

              <Descriptions.Item label={AUDIT_LABEL.USER_AGENT} span={2}>
                <span className="text-xs text-gray-500 break-all">
                  {audit.userAgent ?? "—"}
                </span>
              </Descriptions.Item>
            </Descriptions>

            <div>
              <Title level={5}>{AUDIT_LABEL.CHANGES}</Title>
              <Table
                rowKey="property"
                dataSource={audit.changes}
                columns={CHANGE_COLUMNS}
                size="small"
                pagination={false}
                locale={{ emptyText: AUDIT_LABEL.NO_CHANGES }}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
