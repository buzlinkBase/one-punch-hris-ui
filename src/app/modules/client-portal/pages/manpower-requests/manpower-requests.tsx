import { useState } from "react";
import {
  Alert,
  Button,
  Form,
  Input,
  Modal,
  Radio,
  Select,
  Table,
  Tabs,
  Tag,
  Typography,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import { getNotify } from "@/shared/utils/notify";
import { PermissionGate } from "@/shared/components/permission-gate/permission-gate";
import {
  useDecideManpower,
  useDispatchManpower,
  useManpowerRequests,
  usePortalClients,
} from "../../hooks/use-client-portal-queries";
import { OPERATIONS_PERMISSION } from "../../constants/label.const";
import type {
  ManpowerRequestRow,
  ManpowerStatus,
} from "../../models/api/response/client-portal-response.model";

const { Title, Text } = Typography;

const STATUS_TAG: Record<ManpowerStatus, { color: string; label: string }> = {
  Pending: { color: "orange", label: "Waiting" },
  Approved: { color: "green", label: "Approved" },
  Declined: { color: "red", label: "Declined" },
  Cancelled: { color: "default", label: "Cancelled" },
};

export default function ManpowerRequests() {
  const clients = usePortalClients();
  const [clientId, setClientId] = useState<string | undefined>();
  const [tab, setTab] = useState<"Pending" | "ready" | "all">("Pending");
  const fetched = useManpowerRequests(
    clientId,
    tab === "Pending" ? "Pending" : tab === "ready" ? "Approved" : undefined,
  );
  // "Ready to schedule" = approved but not yet handed to scheduling.
  const requests = {
    ...fetched,
    data:
      tab === "ready"
        ? (fetched.data ?? []).filter((r) => !r.dispatchedAt)
        : fetched.data,
  };
  const decide = useDecideManpower();
  const dispatch = useDispatchManpower();
  const [deciding, setDeciding] = useState<ManpowerRequestRow | null>(null);
  const [form] = Form.useForm<{
    decision: "approve" | "decline";
    note?: string;
  }>();
  const decision = Form.useWatch("decision", form);

  const columns: ColumnsType<ManpowerRequestRow> = [
    {
      title: "Request",
      key: "request",
      render: (_, r) => (
        <div>
          <div className="font-medium">
            {r.kind === "ExtraGuards"
              ? `${r.guardsNeeded} extra guard${r.guardsNeeded === 1 ? "" : "s"}`
              : r.permanent
                ? "Permanent schedule change"
                : "Temporary schedule change"}
          </div>
          <Text type="secondary" className="text-xs">
            {r.reason}
          </Text>
          {r.details && <div className="text-xs">{r.details}</div>}
        </div>
      ),
    },
    { title: "Client", dataIndex: "clientName" },
    { title: "Site", dataIndex: "siteName" },
    {
      title: "When",
      key: "when",
      render: (_, r) => (
        <div>
          <div>
            {r.fromDate === r.toDate
              ? r.fromDate
              : `${r.fromDate} → ${r.toDate}`}
          </div>
          {r.startTime && r.endTime && (
            <Text type="secondary" className="text-xs">
              {r.startTime.slice(0, 5)}–{r.endTime.slice(0, 5)}
            </Text>
          )}
        </div>
      ),
    },
    {
      title: "Asked by",
      key: "by",
      render: (_, r) => `${r.raisedBy}, ${dayjs(r.createdAt).format("MMM D")}`,
    },
    {
      title: "Status",
      key: "status",
      render: (_, r) => (
        <div>
          <Tag color={STATUS_TAG[r.status].color}>
            {STATUS_TAG[r.status].label}
          </Tag>
          {r.status === "Approved" && (
            <Text type="secondary" className="block text-xs">
              {r.dispatchedAt ? "Sent to scheduling" : "Waiting for scheduling"}
            </Text>
          )}
          {r.decisionNote && <div className="text-xs">{r.decisionNote}</div>}
        </div>
      ),
    },
    {
      title: "",
      key: "actions",
      align: "right",
      render: (_, r) => (
        <PermissionGate permission={OPERATIONS_PERMISSION.MANAGE}>
          {r.status === "Pending" && (
            <Button size="small" type="primary" onClick={() => setDeciding(r)}>
              Decide
            </Button>
          )}
          {r.status === "Approved" && !r.dispatchedAt && (
            <Button
              size="small"
              loading={dispatch.isPending}
              onClick={async () => {
                await dispatch.mutateAsync(r.id);
                getNotify().success({ message: "Marked as scheduled." });
              }}
            >
              Mark as scheduled
            </Button>
          )}
        </PermissionGate>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div>
        <Title level={3} className="m-0!">
          Manpower Requests
        </Title>
        <Text type="secondary">
          Extra guards and schedule changes clients ask for. Approved requests
          are handed to the scheduling system.
        </Text>
      </div>
      <div className="rounded-lg bg-white p-4">
        <Select
          allowClear
          showSearch
          optionFilterProp="label"
          placeholder="All clients"
          className="mb-3 min-w-64"
          value={clientId}
          options={(clients.data ?? []).map((c) => ({
            value: c.id,
            label: `${c.name} (${c.code})`,
          }))}
          onChange={setClientId}
        />
        <Tabs
          activeKey={tab}
          onChange={(key) => setTab(key as typeof tab)}
          items={[
            { key: "Pending", label: "Waiting for a decision" },
            { key: "ready", label: "Ready to schedule" },
            { key: "all", label: "History" },
          ]}
        />
        <Table<ManpowerRequestRow>
          rowKey="id"
          loading={requests.isLoading}
          dataSource={requests.data ?? []}
          columns={columns}
          scroll={{ x: "max-content" }}
          pagination={{ pageSize: 20, hideOnSinglePage: true }}
        />
      </div>

      <Modal
        title="Decide on this request"
        open={!!deciding}
        okText={decision === "decline" ? "Decline" : "Approve"}
        okButtonProps={{ danger: decision === "decline" }}
        confirmLoading={decide.isPending}
        onCancel={() => setDeciding(null)}
        onOk={() => form.submit()}
        destroyOnHidden
      >
        {deciding && (
          <Alert
            type="info"
            showIcon
            className="mb-3"
            message={`${deciding.clientName} · ${deciding.siteName}`}
            description={deciding.reason}
          />
        )}
        <Form
          form={form}
          layout="vertical"
          initialValues={{ decision: "approve" }}
          onFinish={async (values) => {
            if (!deciding) return;
            await decide.mutateAsync({
              id: deciding.id,
              approve: values.decision === "approve",
              note: values.note ?? null,
            });
            getNotify().success({
              message: "Decision recorded. The client can see it.",
            });
            setDeciding(null);
            form.resetFields();
          }}
        >
          <Form.Item name="decision">
            <Radio.Group
              options={[
                { value: "approve", label: "Approve" },
                { value: "decline", label: "Decline" },
              ]}
            />
          </Form.Item>
          <Form.Item
            label={
              decision === "decline"
                ? "Why (shown to the client)"
                : "Note to the client (optional)"
            }
            name="note"
            rules={
              decision === "decline"
                ? [{ required: true, message: "Give a reason." }]
                : []
            }
          >
            <Input.TextArea rows={3} maxLength={1000} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
