import { useState } from "react";
import {
  Alert,
  Button,
  Drawer,
  Form,
  Input,
  InputNumber,
  Radio,
  Select,
  Table,
  Tabs,
  Tag,
  Typography,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { useNavigate } from "@tanstack/react-router";
import dayjs from "dayjs";
import { getNotify } from "@/shared/utils/notify";
import { PermissionGate } from "@/shared/components/permission-gate/permission-gate";
import {
  useCommentDispute,
  usePortalClients,
  usePortalDispute,
  usePortalDisputes,
  useResolveDispute,
  useReviewDispute,
} from "../../hooks/use-client-portal-queries";
import {
  BILLING_PATH,
  BILLING_PERMISSION,
  peso,
} from "../../constants/label.const";
import type {
  DisputeStatus,
  DisputeSummary,
} from "../../models/api/response/client-portal-response.model";

const { Title, Text } = Typography;

const STATUS_TAG: Record<DisputeStatus, { color: string; label: string }> = {
  Open: { color: "red", label: "Open" },
  UnderReview: { color: "orange", label: "Under review" },
  Resolved: { color: "green", label: "Resolved" },
  Declined: { color: "default", label: "Declined" },
};

function DisputeDrawer({
  id,
  onClose,
}: {
  id: string | null;
  onClose: () => void;
}) {
  const navigate = useNavigate();
  const dispute = usePortalDispute(id ?? undefined);
  const comment = useCommentDispute();
  const review = useReviewDispute();
  const resolve = useResolveDispute();
  const [commentText, setCommentText] = useState("");
  const [form] = Form.useForm<{
    decision: "accept" | "decline";
    outcome: string;
    creditSubtotal?: number;
  }>();
  const decision = Form.useWatch("decision", form);

  const d = dispute.data;
  const closed =
    d?.summary.status === "Resolved" || d?.summary.status === "Declined";

  const send = async () => {
    if (!id || !commentText.trim()) return;
    await comment.mutateAsync({ id, body: commentText });
    setCommentText("");
  };

  const submitResolution = async (values: {
    decision: "accept" | "decline";
    outcome: string;
    creditSubtotal?: number;
  }) => {
    if (!id) return;
    await resolve.mutateAsync({
      id,
      accept: values.decision === "accept",
      outcome: values.outcome,
      creditSubtotal:
        values.decision === "accept" ? (values.creditSubtotal ?? null) : null,
    });
    getNotify().success({
      message: "Dispute closed. The client was notified in the thread.",
    });
    form.resetFields();
  };

  return (
    <Drawer
      open={!!id}
      onClose={onClose}
      size="large"
      title={d ? `Dispute — invoice ${d.summary.invoiceNumber}` : "Dispute"}
      destroyOnHidden
    >
      {d && (
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <Tag color={STATUS_TAG[d.summary.status].color}>
              {STATUS_TAG[d.summary.status].label}
            </Tag>
            <Text>{d.summary.clientName}</Text>
            <Text strong>{peso(d.summary.disputedAmount)}</Text>
            <Button
              size="small"
              onClick={() =>
                navigate({ to: BILLING_PATH.invoice(d.summary.invoiceId) })
              }
            >
              Open invoice
            </Button>
          </div>

          <div className="rounded border border-gray-100 p-3">
            <Text type="secondary" className="text-xs">
              Raised by {d.summary.raisedBy},{" "}
              {dayjs(d.summary.createdAt).format("MMM D, YYYY h:mm A")}
            </Text>
            {d.lineDescription && (
              <div className="text-sm">About: {d.lineDescription}</div>
            )}
            <div className="mt-1">{d.summary.reason}</div>
          </div>

          <div className="flex flex-col gap-2">
            {d.comments.map((c) => (
              <div
                key={c.id}
                className={`rounded p-2 text-sm ${c.fromAgency ? "bg-[#e8f6f2]" : "bg-gray-50"}`}
              >
                <Text strong>{c.author}</Text>{" "}
                <Text type="secondary" className="text-xs">
                  {c.fromAgency ? "agency" : "client"} ·{" "}
                  {dayjs(c.at).format("MMM D, h:mm A")}
                </Text>
                <div>{c.body}</div>
              </div>
            ))}
          </div>

          {!closed && (
            <PermissionGate permission={BILLING_PERMISSION.MANAGE}>
              <div className="flex flex-col gap-2">
                <Input.TextArea
                  rows={2}
                  maxLength={2000}
                  value={commentText}
                  placeholder="Reply to the client, or ask for more information"
                  onChange={(e) => setCommentText(e.target.value)}
                />
                <div className="flex gap-2">
                  <Button
                    loading={comment.isPending}
                    disabled={!commentText.trim()}
                    onClick={send}
                  >
                    Send reply
                  </Button>
                  {d.summary.status === "Open" && (
                    <Button
                      loading={review.isPending}
                      onClick={() => id && review.mutate(id)}
                    >
                      Start review
                    </Button>
                  )}
                </div>
              </div>

              <div className="rounded border border-gray-100 p-3">
                <Title level={5} className="mt-0!">
                  Close this dispute
                </Title>
                <Form
                  form={form}
                  layout="vertical"
                  onFinish={submitResolution}
                  initialValues={{ decision: "accept" }}
                >
                  <Form.Item name="decision">
                    <Radio.Group
                      options={[
                        { value: "accept", label: "Accept" },
                        { value: "decline", label: "Decline" },
                      ]}
                    />
                  </Form.Item>
                  {decision !== "decline" && (
                    <Form.Item
                      label="Credit to the client (before VAT)"
                      name="creditSubtotal"
                      extra="Leave empty if you will void and re-issue the invoice instead."
                    >
                      <InputNumber className="w-full" min={0} precision={2} />
                    </Form.Item>
                  )}
                  <Form.Item
                    label={
                      decision === "decline"
                        ? "Why it is declined (shown to the client)"
                        : "What was done"
                    }
                    name="outcome"
                    rules={[{ required: true, min: 3, message: "Required." }]}
                  >
                    <Input.TextArea rows={2} maxLength={2000} />
                  </Form.Item>
                  {decision !== "decline" && (
                    <Alert
                      type="info"
                      showIcon
                      className="mb-3"
                      message="A credit changes what the client owes, so it needs the Approve permission."
                    />
                  )}
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={resolve.isPending}
                  >
                    {decision === "decline"
                      ? "Decline dispute"
                      : "Accept and close"}
                  </Button>
                </Form>
              </div>
            </PermissionGate>
          )}

          {closed && d.summary.outcome && (
            <Alert
              type={d.summary.status === "Resolved" ? "success" : "info"}
              showIcon
              message={`${d.summary.status} by ${d.resolvedBy}`}
              description={d.summary.outcome}
            />
          )}
        </div>
      )}
    </Drawer>
  );
}

export default function DisputeList() {
  const clients = usePortalClients();
  const [clientId, setClientId] = useState<string | undefined>();
  const [tab, setTab] = useState<"active" | "closed">("active");
  const all = usePortalDisputes(clientId);
  const [openId, setOpenId] = useState<string | null>(null);

  const rows = (all.data ?? []).filter((d) =>
    tab === "active"
      ? d.status === "Open" || d.status === "UnderReview"
      : d.status === "Resolved" || d.status === "Declined",
  );

  const columns: ColumnsType<DisputeSummary> = [
    { title: "Invoice", dataIndex: "invoiceNumber" },
    { title: "Client", dataIndex: "clientName" },
    {
      title: "Disputed",
      key: "amount",
      align: "right",
      render: (_, d) => peso(d.disputedAmount),
    },
    { title: "Reason", dataIndex: "reason", ellipsis: true },
    {
      title: "Raised",
      key: "raised",
      render: (_, d) => dayjs(d.createdAt).format("MMM D, YYYY"),
    },
    {
      title: "Status",
      key: "status",
      render: (_, d) => (
        <Tag color={STATUS_TAG[d.status].color}>
          {STATUS_TAG[d.status].label}
        </Tag>
      ),
    },
    {
      title: "",
      key: "actions",
      align: "right",
      render: (_, d) => (
        <Button size="small" onClick={() => setOpenId(d.id)}>
          Open
        </Button>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div>
        <Title level={3} className="m-0!">
          Billing Disputes
        </Title>
        <Text type="secondary">
          Objections clients raise about an invoice. A dispute holds its amount
          back from payment reminders until it is closed.
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
            { key: "active", label: "Open" },
            { key: "closed", label: "Closed" },
          ]}
        />
        <Table<DisputeSummary>
          rowKey="id"
          loading={all.isLoading}
          dataSource={rows}
          columns={columns}
          scroll={{ x: "max-content" }}
          pagination={{ pageSize: 20, hideOnSinglePage: true }}
        />
      </div>
      <DisputeDrawer id={openId} onClose={() => setOpenId(null)} />
    </div>
  );
}
