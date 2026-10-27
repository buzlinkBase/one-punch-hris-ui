import { useState } from "react";
import {
  Alert,
  Button,
  Descriptions,
  Form,
  Input,
  InputNumber,
  Modal,
  Select,
  Space,
  Spin,
  Switch,
  Table,
  Tag,
  Typography,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  ArrowLeftOutlined,
  DownloadOutlined,
  PrinterOutlined,
} from "@ant-design/icons";
import { useNavigate } from "@tanstack/react-router";
import dayjs from "dayjs";
import { getNotify } from "@/shared/utils/notify";
import { useRouteParams } from "@/shared/hooks/use-route-params";
import { PermissionGate } from "@/shared/components/permission-gate/permission-gate";
import {
  useAddAdjustment,
  useInvoice,
  useInvoiceStep,
  useRemoveAdjustment,
  useResendInvoice,
  useSetInvoiceDelivery,
  useVoidInvoice,
} from "../../hooks/use-client-portal-queries";
import {
  BILLING_PATH,
  BILLING_PERMISSION,
  INVOICE_STATUS_TAG,
  peso,
} from "../../constants/label.const";
import { openPortalFile, savePortalFile } from "../../utils/open-blob";
import { InvoiceExtras } from "./invoice-extras";
import type {
  DeliveryMode,
  InvoiceDelivery,
  InvoiceLine,
  PaymentSummary,
} from "../../models/api/response/client-portal-response.model";

const { Title, Text } = Typography;
const stamp = (value: string | null) =>
  value ? dayjs(value).format("MMM D, YYYY h:mm A") : "";

export default function InvoiceDetail() {
  const { id } = useRouteParams<{ id?: string }>();
  const navigate = useNavigate();
  const query = useInvoice(id);
  const step = useInvoiceStep();
  const resend = useResendInvoice();
  const voidInvoice = useVoidInvoice();
  const setDelivery = useSetInvoiceDelivery();
  const addAdjustment = useAddAdjustment();
  const removeAdjustment = useRemoveAdjustment();

  const [voidOpen, setVoidOpen] = useState(false);
  const [adjustOpen, setAdjustOpen] = useState(false);
  const [resendOpen, setResendOpen] = useState(false);
  const [voidForm] = Form.useForm<{ reason: string }>();
  const [adjustForm] = Form.useForm<{
    description: string;
    amount: number;
    reason: string;
  }>();
  const [resendForm] = Form.useForm<{ emails: string[] }>();

  if (query.isLoading) return <Spin />;
  const invoice = query.data;
  if (!invoice || !id) {
    return <Alert type="error" showIcon message="Invoice not found." />;
  }

  const { summary } = invoice;
  const tag = INVOICE_STATUS_TAG[summary.displayStatus] ?? {
    color: "default",
    label: summary.displayStatus,
  };
  const editable = summary.status === "Draft" || summary.status === "ForReview";
  const beforeIssue =
    summary.status !== "Issued" && summary.status !== "Voided";

  const run = async (
    action: () => Promise<unknown>,
    success: string,
  ): Promise<void> => {
    await action();
    getNotify().success({ message: success });
  };

  const openFile = async (
    path: string,
    kind: "tab" | "save",
    fileName: string,
    type: string,
  ) => {
    if (kind === "tab") await openPortalFile(path, type);
    else await savePortalFile(path, fileName);
  };

  const lineColumns: ColumnsType<InvoiceLine> = [
    {
      title: "Description",
      key: "description",
      render: (_, l) => (
        <div>
          <div>{l.description}</div>
          {l.reason && (
            <Text type="secondary" className="text-xs">
              {l.reason}
            </Text>
          )}
        </div>
      ),
    },
    {
      title: "Hours / qty",
      key: "qty",
      align: "right",
      render: (_, l) => l.quantity.toFixed(2),
    },
    {
      title: "Rate",
      key: "rate",
      align: "right",
      render: (_, l) => l.unitRate.toFixed(2),
    },
    {
      title: "Amount",
      key: "amount",
      align: "right",
      render: (_, l) => peso(l.amount),
    },
    {
      title: "",
      key: "actions",
      align: "right",
      render: (_, l) =>
        l.kind === "Adjustment" && editable ? (
          <PermissionGate permission={BILLING_PERMISSION.MANAGE}>
            <Button
              size="small"
              danger
              onClick={() =>
                run(
                  () => removeAdjustment.mutateAsync({ id, lineId: l.id }),
                  "Adjustment removed.",
                )
              }
            >
              Remove
            </Button>
          </PermissionGate>
        ) : null,
    },
  ];

  const deliveryColumns: ColumnsType<InvoiceDelivery> = [
    { title: "Sent", key: "at", render: (_, d) => stamp(d.at) },
    { title: "To", dataIndex: "toEmails" },
    { title: "By", dataIndex: "sentBy" },
    {
      title: "Result",
      key: "result",
      render: (_, d) =>
        d.succeeded ? (
          <Tag color="green">Handed to mail service</Tag>
        ) : (
          <Tag color="red">{d.error ?? "Failed"}</Tag>
        ),
    },
  ];

  const paymentColumns: ColumnsType<PaymentSummary> = [
    { title: "Date", dataIndex: "paymentDate" },
    { title: "Reference", dataIndex: "reference" },
    { title: "Method", dataIndex: "method" },
    {
      title: "Applied",
      key: "allocated",
      align: "right",
      render: (_, p) => peso(p.allocated),
    },
    {
      title: "Status",
      key: "status",
      render: (_, p) =>
        p.checkStatus === "PostDated" ? (
          <Tag color="gold">Post-dated check</Tag>
        ) : p.checkStatus === "Bounced" ? (
          <Tag color="red">Bounced</Tag>
        ) : (
          <Tag color="green">Counted</Tag>
        ),
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <Button
          aria-label="Back"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate({ to: BILLING_PATH.INVOICES })}
        />
        <Title level={3} className="m-0! mr-auto">
          {summary.number ?? "Draft invoice"}
        </Title>
        <Tag color={tag.color}>{tag.label}</Tag>
        <Button
          icon={<PrinterOutlined />}
          onClick={() =>
            openFile(`invoices/${id}/print`, "tab", "invoice.html", "text/html")
          }
        >
          View / print
        </Button>
        {summary.hasFile && (
          <Button
            icon={<DownloadOutlined />}
            onClick={() =>
              openFile(
                `invoices/${id}/file`,
                "save",
                invoice.fileName ?? "invoice",
                "application/octet-stream",
              )
            }
          >
            Original file
          </Button>
        )}
        {invoice.dtrSummaryRecords > 0 && (
          <Button
            icon={<DownloadOutlined />}
            onClick={() =>
              openFile(
                `invoices/${id}/dtr-summary.csv`,
                "save",
                `dtr-summary-${summary.number ?? id}.csv`,
                "text/csv",
              )
            }
          >
            DTR summary
          </Button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2 rounded-lg bg-white p-4">
        <Text strong className="mr-2">
          Next step
        </Text>
        {summary.status === "Draft" && (
          <PermissionGate permission={BILLING_PERMISSION.MANAGE}>
            <Button
              type="primary"
              loading={step.isPending}
              onClick={() =>
                run(
                  () => step.mutateAsync({ id, step: "submit" }),
                  "Sent for review.",
                )
              }
            >
              Send for review
            </Button>
          </PermissionGate>
        )}
        {summary.status === "ForReview" && (
          <PermissionGate permission={BILLING_PERMISSION.APPROVE}>
            <Button
              type="primary"
              loading={step.isPending}
              onClick={() =>
                run(
                  () => step.mutateAsync({ id, step: "approve" }),
                  "Invoice approved and locked.",
                )
              }
            >
              Approve
            </Button>
          </PermissionGate>
        )}
        {summary.status === "Approved" && (
          <PermissionGate permission={BILLING_PERMISSION.ISSUE}>
            <Button
              type="primary"
              loading={step.isPending}
              onClick={() =>
                run(
                  () => step.mutateAsync({ id, step: "issue" }),
                  summary.delivery === "Email"
                    ? "Invoice issued and emailed."
                    : "Invoice issued (kept as a record).",
                )
              }
            >
              {summary.delivery === "Email" ? "Issue and email" : "Issue"}
            </Button>
          </PermissionGate>
        )}
        {summary.status === "Issued" && summary.delivery === "Email" && (
          <PermissionGate permission={BILLING_PERMISSION.ISSUE}>
            <Button onClick={() => setResendOpen(true)}>Send again</Button>
          </PermissionGate>
        )}
        {summary.status !== "Voided" && (
          <PermissionGate permission={BILLING_PERMISSION.APPROVE}>
            <Button danger onClick={() => setVoidOpen(true)}>
              Void
            </Button>
          </PermissionGate>
        )}
        {summary.status === "Issued" && summary.delivery === "RecordOnly" && (
          <Text type="secondary">Kept as a record. Nothing is emailed.</Text>
        )}
      </div>

      {summary.status === "Voided" && (
        <Alert
          type="error"
          showIcon
          message={`Voided by ${invoice.voidedBy} on ${stamp(invoice.voidedAt)}`}
          description={invoice.voidReason}
        />
      )}

      <div className="rounded-lg bg-white p-4">
        <Descriptions
          size="small"
          bordered
          column={{ xs: 1, sm: 2, md: 3 }}
          items={[
            { key: "client", label: "Client", children: summary.clientName },
            { key: "source", label: "Source", children: summary.source },
            {
              key: "period",
              label: "Period",
              children: `${summary.periodFrom} → ${summary.periodTo}`,
            },
            {
              key: "date",
              label: "Invoice date",
              children: summary.invoiceDate,
            },
            { key: "due", label: "Due date", children: summary.dueDate },
            {
              key: "paid",
              label: "Paid / balance",
              children: `${peso(summary.amountPaid)} / ${peso(summary.balance)}${
                summary.memoTotal !== 0
                  ? ` (memos ${summary.memoTotal > 0 ? "+" : ""}${peso(summary.memoTotal)})`
                  : ""
              }`,
            },
            {
              key: "prepared",
              label: "Prepared by",
              children: invoice.createdBy,
            },
            {
              key: "reviewed",
              label: "Sent for review",
              children: invoice.submittedBy
                ? `${invoice.submittedBy}, ${stamp(invoice.submittedAt)}`
                : "—",
            },
            {
              key: "approved",
              label: "Approved by",
              children: invoice.approvedBy
                ? `${invoice.approvedBy}, ${stamp(invoice.approvedAt)}`
                : "—",
            },
            {
              key: "issued",
              label: "Issued by",
              children: invoice.issuedBy
                ? `${invoice.issuedBy}, ${stamp(invoice.issuedAt)}`
                : "—",
            },
            {
              key: "withholding",
              label: "Expected withholding (2307)",
              children: peso(invoice.withholdingExpected),
            },
          ]}
        />

        {beforeIssue && (
          <PermissionGate permission={BILLING_PERMISSION.MANAGE}>
            <div className="mt-4 flex flex-wrap items-center gap-4">
              <Space>
                <Text>Delivery</Text>
                <Select<DeliveryMode>
                  value={summary.delivery}
                  className="w-52"
                  loading={setDelivery.isPending}
                  options={[
                    { value: "Email", label: "Email to client" },
                    { value: "RecordOnly", label: "Billing record only" },
                  ]}
                  onChange={(mode) =>
                    run(
                      () =>
                        setDelivery.mutateAsync({
                          id,
                          mode,
                          showInPortal: summary.showInPortal,
                        }),
                      "Delivery updated.",
                    )
                  }
                />
              </Space>
              <Space>
                <Text>Show in client portal</Text>
                <Switch
                  checked={summary.showInPortal}
                  loading={setDelivery.isPending}
                  onChange={(showInPortal) =>
                    run(
                      () =>
                        setDelivery.mutateAsync({
                          id,
                          mode: summary.delivery,
                          showInPortal,
                        }),
                      "Portal visibility updated.",
                    )
                  }
                />
              </Space>
            </div>
          </PermissionGate>
        )}
      </div>

      <div className="rounded-lg bg-white p-4">
        <div className="mb-3 flex items-center justify-between">
          <Title level={5} className="m-0!">
            Lines
          </Title>
          {editable && summary.source === "Generated" && (
            <PermissionGate permission={BILLING_PERMISSION.MANAGE}>
              <Button size="small" onClick={() => setAdjustOpen(true)}>
                Add adjustment
              </Button>
            </PermissionGate>
          )}
        </div>
        <Table<InvoiceLine>
          rowKey="id"
          size="small"
          pagination={false}
          dataSource={invoice.lines}
          columns={lineColumns}
          scroll={{ x: "max-content" }}
          summary={() => (
            <>
              <Table.Summary.Row>
                <Table.Summary.Cell index={0} colSpan={3} align="right">
                  Subtotal
                </Table.Summary.Cell>
                <Table.Summary.Cell index={1} align="right">
                  {peso(invoice.subtotal)}
                </Table.Summary.Cell>
                <Table.Summary.Cell index={2} />
              </Table.Summary.Row>
              <Table.Summary.Row>
                <Table.Summary.Cell index={0} colSpan={3} align="right">
                  VAT
                </Table.Summary.Cell>
                <Table.Summary.Cell index={1} align="right">
                  {peso(invoice.vatAmount)}
                </Table.Summary.Cell>
                <Table.Summary.Cell index={2} />
              </Table.Summary.Row>
              <Table.Summary.Row>
                <Table.Summary.Cell index={0} colSpan={3} align="right">
                  <b>Total</b>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={1} align="right">
                  <b>{peso(summary.total)}</b>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={2} />
              </Table.Summary.Row>
            </>
          )}
        />
      </div>

      {invoice.deliveries.length > 0 && (
        <div className="rounded-lg bg-white p-4">
          <Title level={5}>Delivery history</Title>
          <Table<InvoiceDelivery>
            rowKey="id"
            size="small"
            pagination={false}
            dataSource={invoice.deliveries}
            columns={deliveryColumns}
            scroll={{ x: "max-content" }}
          />
        </div>
      )}

      {invoice.payments.length > 0 && (
        <div className="rounded-lg bg-white p-4">
          <Title level={5}>Payments</Title>
          <Table<PaymentSummary>
            rowKey="id"
            size="small"
            pagination={false}
            dataSource={invoice.payments}
            columns={paymentColumns}
            scroll={{ x: "max-content" }}
          />
        </div>
      )}

      <InvoiceExtras
        invoiceId={id}
        status={summary.status}
        memos={invoice.memos}
        withholdingExpected={invoice.withholdingExpected}
      />

      <Modal
        title="Void this invoice"
        open={voidOpen}
        okText="Void invoice"
        okButtonProps={{ danger: true }}
        confirmLoading={voidInvoice.isPending}
        onCancel={() => setVoidOpen(false)}
        onOk={() => voidForm.submit()}
        destroyOnHidden
      >
        <Alert
          type="warning"
          showIcon
          className="mb-3"
          message="The number stays on record as void and is never reused. To correct an invoice, void it and prepare a new one."
        />
        <Form
          form={voidForm}
          layout="vertical"
          onFinish={async (values) => {
            await run(
              () => voidInvoice.mutateAsync({ id, reason: values.reason }),
              "Invoice voided.",
            );
            setVoidOpen(false);
            voidForm.resetFields();
          }}
        >
          <Form.Item
            label="Reason"
            name="reason"
            rules={[{ required: true, min: 3, message: "Give a reason." }]}
          >
            <Input.TextArea rows={3} maxLength={500} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Add an adjustment"
        open={adjustOpen}
        okText="Add"
        confirmLoading={addAdjustment.isPending}
        onCancel={() => setAdjustOpen(false)}
        onOk={() => adjustForm.submit()}
        destroyOnHidden
      >
        <Form
          form={adjustForm}
          layout="vertical"
          onFinish={async (values) => {
            await run(
              () => addAdjustment.mutateAsync({ id, body: values }),
              "Adjustment added.",
            );
            setAdjustOpen(false);
            adjustForm.resetFields();
          }}
        >
          <Form.Item
            label="Description"
            name="description"
            rules={[{ required: true, message: "Describe the adjustment." }]}
          >
            <Input maxLength={300} />
          </Form.Item>
          <Form.Item
            label="Amount (use a minus sign to deduct)"
            name="amount"
            rules={[
              { required: true, type: "number", message: "Enter the amount." },
            ]}
          >
            <InputNumber className="w-full" precision={2} />
          </Form.Item>
          <Form.Item
            label="Reason"
            name="reason"
            rules={[
              { required: true, min: 3, message: "A reason is required." },
            ]}
          >
            <Input.TextArea rows={2} maxLength={500} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Send the invoice again"
        open={resendOpen}
        okText="Send"
        confirmLoading={resend.isPending}
        onCancel={() => setResendOpen(false)}
        onOk={() => resendForm.submit()}
        destroyOnHidden
      >
        <Form
          form={resendForm}
          layout="vertical"
          onFinish={async (values) => {
            await run(
              () =>
                resend.mutateAsync({ id, extraEmails: values.emails ?? [] }),
              "Invoice sent.",
            );
            setResendOpen(false);
            resendForm.resetFields();
          }}
        >
          <Form.Item
            label="Also send to (optional)"
            name="emails"
            extra="It always goes to the client's billing contacts."
          >
            <Select
              mode="tags"
              tokenSeparators={[",", ";", " "]}
              open={false}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
