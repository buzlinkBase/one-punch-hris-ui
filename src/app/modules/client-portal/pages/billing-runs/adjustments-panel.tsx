import { useState } from "react";
import {
  Button,
  Form,
  Input,
  InputNumber,
  Modal,
  Radio,
  Select,
  Table,
  Tag,
  Typography,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { PlusOutlined } from "@ant-design/icons";
import { useNavigate } from "@tanstack/react-router";
import dayjs from "dayjs";
import { getNotify } from "@/shared/utils/notify";
import { PermissionGate } from "@/shared/components/permission-gate/permission-gate";
import {
  useBillingAdjustments,
  useCancelAdjustment,
  useCreateAdjustment,
} from "../../hooks/use-billing-format-queries";
import {
  BILLING_PATH,
  BILLING_PERMISSION,
  peso,
} from "../../constants/label.const";
import type {
  AdjustmentStatus,
  Arrangement,
  BillingAdjustment,
} from "../../models/api/billing-format.model";

const { Title, Text } = Typography;

const STATUS_TAG: Record<AdjustmentStatus, { color: string; label: string }> = {
  Pending: { color: "gold", label: "Waiting for the next run" },
  Applied: { color: "green", label: "Billed" },
  Cancelled: { color: "default", label: "Cancelled" },
};

interface AdjustmentForm {
  arrangementId?: string;
  direction: "credit" | "charge";
  amount: number;
  description: string;
  reason: string;
}

interface AdjustmentsPanelProps {
  clientId: string;
  arrangements: Arrangement[];
}

/**
 * Corrections carried into the client's next billing run: late DTR corrections, missed or double-billed hours, and disputes settled
 * that way. The next run adds each waiting one to its arrangement's invoice, where the agency fee and taxes apply.
 */
export function AdjustmentsPanel({
  clientId,
  arrangements,
}: AdjustmentsPanelProps) {
  const navigate = useNavigate();
  const adjustments = useBillingAdjustments(clientId);
  const create = useCreateAdjustment();
  const cancel = useCancelAdjustment();
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm<AdjustmentForm>();

  const columns: ColumnsType<BillingAdjustment> = [
    {
      title: "Adjustment",
      key: "description",
      render: (_, a) => (
        <div>
          <div>{a.description}</div>
          <Text type="secondary" className="text-xs">
            {a.reason} · {a.createdBy}, {dayjs(a.createdAt).format("MMM D")}
          </Text>
        </div>
      ),
    },
    {
      title: "Billed with",
      key: "arrangement",
      render: (_, a) => a.arrangementName ?? "First arrangement billed",
    },
    {
      title: "Amount",
      key: "amount",
      align: "right",
      render: (_, a) => (
        <Text type={a.amount < 0 ? "danger" : undefined}>{peso(a.amount)}</Text>
      ),
    },
    {
      title: "Status",
      key: "status",
      render: (_, a) => (
        <div className="flex flex-wrap items-center gap-1">
          <Tag color={STATUS_TAG[a.status].color}>
            {STATUS_TAG[a.status].label}
          </Tag>
          {a.appliedInvoiceId && (
            <Button
              type="link"
              size="small"
              className="p-0"
              onClick={() =>
                navigate({ to: BILLING_PATH.invoice(a.appliedInvoiceId!) })
              }
            >
              {a.appliedInvoiceNumber}
            </Button>
          )}
        </div>
      ),
    },
    {
      title: "",
      key: "actions",
      align: "right",
      render: (_, a) =>
        a.status === "Pending" ? (
          <PermissionGate permission={BILLING_PERMISSION.MANAGE}>
            <Button
              size="small"
              danger
              loading={cancel.isPending}
              onClick={async () => {
                await cancel.mutateAsync(a.id);
                getNotify().success({ message: "Adjustment cancelled." });
              }}
            >
              Cancel
            </Button>
          </PermissionGate>
        ) : null,
    },
  ];

  return (
    <div className="rounded-lg bg-white p-4">
      <div className="mb-2 flex items-center justify-between gap-2">
        <Title level={5} className="m-0!">
          Carried-over adjustments
        </Title>
        <PermissionGate permission={BILLING_PERMISSION.MANAGE}>
          <Button
            size="small"
            icon={<PlusOutlined />}
            onClick={() => setOpen(true)}
          >
            Add adjustment
          </Button>
        </PermissionGate>
      </div>
      <Text type="secondary" className="mb-3 block">
        Corrections for the next billing: late DTR corrections, missed or
        double-billed hours, and disputes settled this way. Amounts are for
        personnel; the agency fee and VAT follow the billing format.
      </Text>
      <Table<BillingAdjustment>
        rowKey="id"
        size="small"
        loading={adjustments.isLoading}
        dataSource={adjustments.data ?? []}
        columns={columns}
        pagination={{ pageSize: 10, hideOnSinglePage: true }}
        scroll={{ x: "max-content" }}
        locale={{ emptyText: "No adjustments." }}
      />

      <Modal
        title="Add an adjustment for the next billing"
        open={open}
        okText="Add"
        confirmLoading={create.isPending}
        onCancel={() => setOpen(false)}
        onOk={() => form.submit()}
        destroyOnHidden
      >
        <Form
          form={form}
          layout="vertical"
          preserve={false}
          initialValues={{ direction: "credit" }}
          onFinish={async (values) => {
            await create.mutateAsync({
              clientId,
              arrangementId: values.arrangementId ?? null,
              amount:
                values.direction === "credit" ? -values.amount : values.amount,
              description: values.description.trim(),
              reason: values.reason.trim(),
            });
            getNotify().success({ message: "Adjustment added." });
            setOpen(false);
          }}
        >
          <Form.Item name="direction">
            <Radio.Group
              options={[
                { value: "credit", label: "Credit the client" },
                { value: "charge", label: "Charge the client" },
              ]}
            />
          </Form.Item>
          <Form.Item
            label="Amount for personnel"
            name="amount"
            rules={[
              {
                required: true,
                type: "number",
                min: 0.01,
                message: "Enter the amount.",
              },
            ]}
          >
            <InputNumber className="w-full" min={0} precision={2} />
          </Form.Item>
          <Form.Item
            label="Billed with"
            name="arrangementId"
            extra="Leave empty for the first arrangement billed in the next run."
          >
            <Select
              allowClear
              placeholder="First arrangement billed"
              options={arrangements.map((a) => ({
                value: a.id,
                label: a.name,
              }))}
            />
          </Form.Item>
          <Form.Item
            label="As it reads on the invoice"
            name="description"
            rules={[{ required: true, message: "Required." }]}
          >
            <Input
              maxLength={300}
              placeholder="Less: absent Oct 3, night shift"
            />
          </Form.Item>
          <Form.Item
            label="Reason"
            name="reason"
            rules={[{ required: true, min: 3, message: "Give a reason." }]}
          >
            <Input.TextArea rows={2} maxLength={1000} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
