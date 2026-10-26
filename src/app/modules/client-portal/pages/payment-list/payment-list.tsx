import { useState } from "react";
import {
  Alert,
  Button,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Modal,
  Select,
  Table,
  Tabs,
  Typography,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { PlusOutlined } from "@ant-design/icons";
import dayjs, { type Dayjs } from "dayjs";
import { getNotify } from "@/shared/utils/notify";
import { PermissionGate } from "@/shared/components/permission-gate/permission-gate";
import {
  useConfirmPayment,
  useInvoices,
  usePortalClients,
  usePortalPayments,
  useRecordPayment,
  useRejectPayment,
  useSetCheckStatus,
} from "../../hooks/use-client-portal-queries";
import { clientPortalApi } from "../../services/client-portal.api";
import {
  BILLING_LABEL,
  BILLING_PERMISSION,
  PAYMENT_METHOD_OPTIONS,
  peso,
} from "../../constants/label.const";
import { openBlobInNewTab } from "../../utils/open-blob";
import type { Payment } from "../../models/api/response/client-portal-response.model";

const { Title, Text } = Typography;
const DATE = "YYYY-MM-DD";

interface RecordForm {
  clientId: string;
  paymentDate: Dayjs;
  amount: number;
  method: "BankTransfer" | "Check" | "Cash" | "Online";
  reference: string;
  checkNumber?: string;
  checkBank?: string;
  checkDate?: Dayjs;
  receiptNumber?: string;
  invoiceIds?: string[];
}

export default function PaymentList() {
  const clients = usePortalClients();
  const [clientId, setClientId] = useState<string | undefined>();
  const [tab, setTab] = useState<"Pending" | "Confirmed" | "Rejected">(
    "Pending",
  );
  const payments = usePortalPayments(clientId, tab);
  const record = useRecordPayment();
  const confirm = useConfirmPayment();
  const reject = useRejectPayment();
  const checkStatus = useSetCheckStatus();

  const [recordOpen, setRecordOpen] = useState(false);
  const [rejecting, setRejecting] = useState<Payment | null>(null);
  const [confirming, setConfirming] = useState<Payment | null>(null);
  const [recordForm] = Form.useForm<RecordForm>();
  const [rejectForm] = Form.useForm<{ reason: string }>();
  const [confirmForm] = Form.useForm<{ receiptNumber?: string }>();
  const [formClient, setFormClient] = useState<string | undefined>();
  const [formMethod, setFormMethod] = useState<string>("BankTransfer");

  const formInvoices = useInvoices({
    clientId: formClient,
    status: "Issued",
    page: 1,
    pageSize: 100,
  });
  const openInvoices = (formInvoices.data?.rows ?? []).filter(
    (i) => i.balance > 0,
  );

  const clientOptions = (clients.data ?? []).map((c) => ({
    value: c.id,
    label: `${c.name} (${c.code})`,
  }));

  const onRecord = async (values: RecordForm) => {
    // The payment is applied to the chosen invoices oldest first, each up to what it still owes; any rest stays as client credit.
    let remaining = values.amount;
    const allocations = [];
    for (const id of values.invoiceIds ?? []) {
      const invoice = openInvoices.find((i) => i.id === id);
      if (!invoice || remaining <= 0) continue;
      const amount = Math.min(invoice.balance, remaining);
      allocations.push({ invoiceId: id, amount });
      remaining -= amount;
    }
    await record.mutateAsync({
      clientId: values.clientId,
      paymentDate: values.paymentDate.format(DATE),
      amount: values.amount,
      method: values.method,
      reference: values.reference ?? "",
      checkNumber: values.checkNumber ?? null,
      checkBank: values.checkBank ?? null,
      checkDate: values.checkDate ? values.checkDate.format(DATE) : null,
      receiptNumber: values.receiptNumber ?? null,
      notes: null,
      allocations,
    });
    getNotify().success({
      message:
        remaining > 0
          ? `Payment recorded. ${peso(remaining)} is kept as client credit.`
          : "Payment recorded.",
    });
    setRecordOpen(false);
    recordForm.resetFields();
  };

  const viewProof = async (id: string) => {
    const blob = await clientPortalApi.fetchBlob(`payments/${id}/proof`);
    openBlobInNewTab(blob, blob.type);
  };

  const columns: ColumnsType<Payment> = [
    {
      title: "Date",
      key: "date",
      render: (_, p) => p.summary.paymentDate,
    },
    { title: "Client", dataIndex: "clientName" },
    {
      title: "Amount",
      key: "amount",
      align: "right",
      render: (_, p) => peso(p.summary.amount),
    },
    {
      title: "Method / reference",
      key: "method",
      render: (_, p) => (
        <div>
          <div>{p.summary.method}</div>
          <Text type="secondary" className="text-xs">
            {p.summary.reference}
            {p.checkNumber ? ` · check ${p.checkNumber}` : ""}
          </Text>
        </div>
      ),
    },
    {
      title: "Applied",
      key: "applied",
      align: "right",
      render: (_, p) => (
        <div>
          <div>{peso(p.summary.allocated)}</div>
          {p.summary.unallocated > 0 && p.summary.status === "Confirmed" && (
            <Text type="warning" className="text-xs">
              {peso(p.summary.unallocated)} credit
            </Text>
          )}
        </div>
      ),
    },
    {
      title: "Check",
      key: "check",
      render: (_, p) =>
        p.summary.method !== "Check" ? null : (
          <Select
            size="small"
            value={p.summary.checkStatus}
            className="w-32"
            disabled={p.summary.status !== "Confirmed"}
            options={[
              { value: "PostDated", label: "Post-dated" },
              { value: "Cleared", label: "Cleared" },
              { value: "Bounced", label: "Bounced" },
            ]}
            onChange={(status) =>
              checkStatus.mutate({ id: p.summary.id, status })
            }
          />
        ),
    },
    {
      title: "",
      key: "actions",
      align: "right",
      render: (_, p) => (
        <div className="flex justify-end gap-2">
          {p.summary.hasProof && (
            <Button size="small" onClick={() => viewProof(p.summary.id)}>
              View proof
            </Button>
          )}
          {p.summary.status === "Pending" && (
            <PermissionGate permission={BILLING_PERMISSION.MANAGE}>
              <Button
                size="small"
                type="primary"
                onClick={() => setConfirming(p)}
              >
                Confirm
              </Button>
              <Button size="small" danger onClick={() => setRejecting(p)}>
                Reject
              </Button>
            </PermissionGate>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <Title level={3} className="m-0!">
            {BILLING_LABEL.PAYMENTS_TITLE}
          </Title>
          <Text type="secondary">{BILLING_LABEL.PAYMENTS_SUBTITLE}</Text>
        </div>
        <PermissionGate permission={BILLING_PERMISSION.MANAGE}>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setRecordOpen(true)}
          >
            Record payment
          </Button>
        </PermissionGate>
      </div>

      <div className="rounded-lg bg-white p-4">
        <Select
          allowClear
          showSearch
          optionFilterProp="label"
          placeholder="All clients"
          className="mb-3 min-w-64"
          value={clientId}
          options={clientOptions}
          onChange={setClientId}
        />
        <Tabs
          activeKey={tab}
          onChange={(key) => setTab(key as typeof tab)}
          items={[
            { key: "Pending", label: "Waiting for review" },
            { key: "Confirmed", label: "Confirmed" },
            { key: "Rejected", label: "Rejected" },
          ]}
        />
        <Table<Payment>
          rowKey={(p) => p.summary.id}
          loading={payments.isLoading}
          dataSource={payments.data ?? []}
          columns={columns}
          scroll={{ x: "max-content" }}
          pagination={{ pageSize: 20, hideOnSinglePage: true }}
        />
      </div>

      <Modal
        title="Record a payment"
        open={recordOpen}
        okText="Record"
        confirmLoading={record.isPending}
        onCancel={() => setRecordOpen(false)}
        onOk={() => recordForm.submit()}
        destroyOnHidden
      >
        <Form
          form={recordForm}
          layout="vertical"
          onFinish={onRecord}
          initialValues={{ paymentDate: dayjs(), method: "BankTransfer" }}
        >
          <Form.Item
            label="Client"
            name="clientId"
            rules={[{ required: true, message: "Choose a client." }]}
          >
            <Select
              showSearch
              optionFilterProp="label"
              options={clientOptions}
              onChange={(value) => {
                setFormClient(value);
                recordForm.setFieldValue("invoiceIds", []);
              }}
            />
          </Form.Item>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Form.Item
              label="Amount received"
              name="amount"
              rules={[
                {
                  required: true,
                  type: "number",
                  min: 0.01,
                  message: "Required.",
                },
              ]}
            >
              <InputNumber className="w-full" min={0} precision={2} />
            </Form.Item>
            <Form.Item
              label="Payment date"
              name="paymentDate"
              rules={[{ required: true, message: "Required." }]}
            >
              <DatePicker className="w-full" />
            </Form.Item>
          </div>
          <Form.Item label="Method" name="method">
            <Select
              options={PAYMENT_METHOD_OPTIONS}
              onChange={(value) => setFormMethod(value)}
            />
          </Form.Item>
          {formMethod === "Check" && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Form.Item
                label="Check no."
                name="checkNumber"
                rules={[{ required: true, message: "Required." }]}
              >
                <Input />
              </Form.Item>
              <Form.Item label="Bank" name="checkBank">
                <Input />
              </Form.Item>
              <Form.Item
                label="Check date"
                name="checkDate"
                rules={[{ required: true, message: "Required." }]}
              >
                <DatePicker className="w-full" />
              </Form.Item>
            </div>
          )}
          <Form.Item label="Reference" name="reference">
            <Input maxLength={100} />
          </Form.Item>
          <Form.Item
            label="Apply to invoices"
            name="invoiceIds"
            extra="Applied in the order chosen, each up to what it owes. Any rest stays as client credit."
          >
            <Select
              mode="multiple"
              placeholder={
                formClient ? "Choose invoices" : "Choose a client first"
              }
              disabled={!formClient}
              options={openInvoices.map((i) => ({
                value: i.id,
                label: `${i.number} · owes ${peso(i.balance)}`,
              }))}
            />
          </Form.Item>
          <Form.Item
            label="Official receipt no. (optional)"
            name="receiptNumber"
          >
            <Input maxLength={60} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Confirm this payment"
        open={!!confirming}
        okText="Confirm"
        confirmLoading={confirm.isPending}
        onCancel={() => setConfirming(null)}
        onOk={() => confirmForm.submit()}
        destroyOnHidden
      >
        {confirming && (
          <Alert
            type="info"
            showIcon
            className="mb-3"
            message={`${peso(confirming.summary.amount)} ${confirming.summary.reference}`}
            description={
              confirming.summary.claimedInvoiceId
                ? "It will be applied to the invoice the client named, up to what it owes. Any rest stays as credit."
                : "The client did not name an invoice, so it is kept as credit until you apply it."
            }
          />
        )}
        <Form
          form={confirmForm}
          layout="vertical"
          onFinish={async (values) => {
            if (!confirming) return;
            await confirm.mutateAsync({
              id: confirming.summary.id,
              receiptNumber: values.receiptNumber ?? null,
              allocations: null,
            });
            getNotify().success({ message: "Payment confirmed." });
            setConfirming(null);
            confirmForm.resetFields();
          }}
        >
          <Form.Item
            label="Official receipt no. (optional)"
            name="receiptNumber"
          >
            <Input maxLength={60} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Reject this proof of payment"
        open={!!rejecting}
        okText="Reject"
        okButtonProps={{ danger: true }}
        confirmLoading={reject.isPending}
        onCancel={() => setRejecting(null)}
        onOk={() => rejectForm.submit()}
        destroyOnHidden
      >
        <Form
          form={rejectForm}
          layout="vertical"
          onFinish={async (values) => {
            if (!rejecting) return;
            await reject.mutateAsync({
              id: rejecting.summary.id,
              reason: values.reason,
            });
            getNotify().success({
              message: "Rejected. The client can see why.",
            });
            setRejecting(null);
            rejectForm.resetFields();
          }}
        >
          <Form.Item
            label="Reason (shown to the client)"
            name="reason"
            rules={[{ required: true, min: 3, message: "Give a reason." }]}
          >
            <Input.TextArea rows={3} maxLength={500} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
