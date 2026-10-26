import { useState } from "react";
import {
  Button,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Modal,
  Select,
  Table,
  Tag,
  Typography,
  Upload,
  type UploadFile,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  FileAddOutlined,
  ThunderboltOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import { useNavigate } from "@tanstack/react-router";
import dayjs, { type Dayjs } from "dayjs";
import { getNotify } from "@/shared/utils/notify";
import { MobileRangePicker } from "@/shared/components/mobile-range-picker";
import { PermissionGate } from "@/shared/components/permission-gate/permission-gate";
import {
  useGenerateInvoice,
  useInvoices,
  usePortalClients,
  useUploadInvoice,
} from "../../hooks/use-client-portal-queries";
import {
  BILLING_LABEL,
  BILLING_PATH,
  BILLING_PERMISSION,
  INVOICE_STATUS_TAG,
  peso,
} from "../../constants/label.const";
import type { InvoiceSummary } from "../../models/api/response/client-portal-response.model";

const { Title, Text } = Typography;
const DATE = "YYYY-MM-DD";
const PAGE_SIZE = 20;

const STATUS_FILTER = [
  { value: "Draft", label: "Draft" },
  { value: "ForReview", label: "Under review" },
  { value: "Approved", label: "Approved" },
  { value: "Issued", label: "Issued" },
  { value: "Voided", label: "Void" },
];

interface GenerateForm {
  clientId: string;
  range: [Dayjs, Dayjs];
}

interface UploadForm {
  clientId: string;
  number: string;
  invoiceDate: Dayjs;
  dueDate: Dayjs;
  period: [Dayjs, Dayjs];
  subtotal: number;
  vatAmount: number;
  notes?: string;
  file: UploadFile[];
}

export default function InvoiceList() {
  const navigate = useNavigate();
  const clients = usePortalClients();
  const [clientId, setClientId] = useState<string | undefined>();
  const [status, setStatus] = useState<string | undefined>();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [generateOpen, setGenerateOpen] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [generateForm] = Form.useForm<GenerateForm>();
  const [uploadForm] = Form.useForm<UploadForm>();

  const invoices = useInvoices({
    clientId,
    status,
    search: search || undefined,
    page,
    pageSize: PAGE_SIZE,
  });
  const generate = useGenerateInvoice();
  const upload = useUploadInvoice();

  const clientOptions = (clients.data ?? []).map((c) => ({
    value: c.id,
    label: `${c.name} (${c.code})`,
  }));

  const onGenerate = async (values: GenerateForm) => {
    const result = await generate.mutateAsync({
      clientId: values.clientId,
      from: values.range[0].format(DATE),
      to: values.range[1].format(DATE),
      siteId: null,
      notes: null,
    });
    getNotify().success({ message: "Draft invoice created." });
    setGenerateOpen(false);
    generateForm.resetFields();
    void navigate({ to: BILLING_PATH.invoice(result.summary.id) });
  };

  const onUpload = async (values: UploadForm) => {
    const file = values.file?.[0]?.originFileObj;
    if (!file) return;
    const body = new FormData();
    body.set("clientId", values.clientId);
    body.set("number", values.number);
    body.set("invoiceDate", values.invoiceDate.format(DATE));
    body.set("dueDate", values.dueDate.format(DATE));
    body.set("periodFrom", values.period[0].format(DATE));
    body.set("periodTo", values.period[1].format(DATE));
    body.set("subtotal", String(values.subtotal));
    body.set("vatAmount", String(values.vatAmount ?? 0));
    if (values.notes) body.set("notes", values.notes);
    body.set("file", file);
    const result = await upload.mutateAsync(body);
    getNotify().success({ message: "Invoice recorded as a draft." });
    setUploadOpen(false);
    uploadForm.resetFields();
    void navigate({ to: BILLING_PATH.invoice(result.summary.id) });
  };

  const columns: ColumnsType<InvoiceSummary> = [
    {
      title: "Invoice",
      key: "number",
      render: (_, r) => (
        <Button
          type="link"
          className="p-0!"
          onClick={() => navigate({ to: BILLING_PATH.invoice(r.id) })}
        >
          {r.number ?? "Draft (no number yet)"}
        </Button>
      ),
    },
    { title: "Client", dataIndex: "clientName" },
    {
      title: "Period",
      key: "period",
      render: (_, r) => `${r.periodFrom} → ${r.periodTo}`,
    },
    { title: "Due", dataIndex: "dueDate" },
    {
      title: "Total",
      key: "total",
      align: "right",
      render: (_, r) => peso(r.total),
    },
    {
      title: "Balance",
      key: "balance",
      align: "right",
      render: (_, r) => (r.status === "Voided" ? "—" : peso(r.balance)),
    },
    {
      title: "Source",
      key: "source",
      render: (_, r) => <Tag>{r.source}</Tag>,
    },
    {
      title: "Status",
      key: "status",
      render: (_, r) => {
        const tag = INVOICE_STATUS_TAG[r.displayStatus] ?? {
          color: "default",
          label: r.displayStatus,
        };
        return (
          <Tag color={tag.color}>
            {tag.label}
            {r.displayStatus === "Overdue" ? ` · ${r.daysOverdue}d` : ""}
          </Tag>
        );
      },
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <Title level={3} className="m-0!">
            {BILLING_LABEL.INVOICES_TITLE}
          </Title>
          <Text type="secondary">{BILLING_LABEL.INVOICES_SUBTITLE}</Text>
        </div>
        <PermissionGate permission={BILLING_PERMISSION.MANAGE}>
          <div className="flex gap-2">
            <Button
              icon={<UploadOutlined />}
              onClick={() => setUploadOpen(true)}
            >
              Upload invoice
            </Button>
            <Button
              type="primary"
              icon={<ThunderboltOutlined />}
              onClick={() => setGenerateOpen(true)}
            >
              Generate from time logs
            </Button>
          </div>
        </PermissionGate>
      </div>

      <div className="flex flex-wrap gap-3 rounded-lg bg-white p-4">
        <Select
          allowClear
          showSearch
          optionFilterProp="label"
          placeholder="All clients"
          className="min-w-56"
          value={clientId}
          options={clientOptions}
          onChange={(value) => {
            setClientId(value);
            setPage(1);
          }}
        />
        <Select
          allowClear
          placeholder="Any status"
          className="min-w-40"
          value={status}
          options={STATUS_FILTER}
          onChange={(value) => {
            setStatus(value);
            setPage(1);
          }}
        />
        <Input.Search
          allowClear
          placeholder="Invoice number"
          className="w-52"
          onSearch={(value) => {
            setSearch(value);
            setPage(1);
          }}
        />
      </div>

      <Table<InvoiceSummary>
        rowKey="id"
        loading={invoices.isLoading || invoices.isFetching}
        dataSource={invoices.data?.rows ?? []}
        columns={columns}
        scroll={{ x: "max-content" }}
        pagination={{
          current: page,
          pageSize: PAGE_SIZE,
          total: invoices.data?.total ?? 0,
          showSizeChanger: false,
          onChange: setPage,
          hideOnSinglePage: true,
        }}
      />

      <Modal
        title="Generate invoice from time logs"
        open={generateOpen}
        onCancel={() => setGenerateOpen(false)}
        onOk={() => generateForm.submit()}
        okText="Create draft"
        confirmLoading={generate.isPending}
        destroyOnHidden
      >
        <Form
          form={generateForm}
          layout="vertical"
          onFinish={onGenerate}
          initialValues={{
            range: [dayjs().startOf("month"), dayjs().endOf("month")],
          }}
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
            />
          </Form.Item>
          <Form.Item
            label="Billing period"
            name="range"
            extra="Only time logs that were verified (and, if the client requires it, signed off) can be billed."
            rules={[{ required: true, message: "Choose the period." }]}
          >
            <MobileRangePicker allowClear={false} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Upload an invoice"
        open={uploadOpen}
        onCancel={() => setUploadOpen(false)}
        onOk={() => uploadForm.submit()}
        okText="Save as draft"
        confirmLoading={upload.isPending}
        destroyOnHidden
      >
        <Form
          form={uploadForm}
          layout="vertical"
          onFinish={onUpload}
          initialValues={{ invoiceDate: dayjs(), vatAmount: 0 }}
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
            />
          </Form.Item>
          <Form.Item
            label="Official invoice number"
            name="number"
            extra="Exactly as issued from your registered invoicing system."
            rules={[{ required: true, message: "Enter the invoice number." }]}
          >
            <Input maxLength={60} />
          </Form.Item>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Form.Item
              label="Invoice date"
              name="invoiceDate"
              rules={[{ required: true, message: "Required." }]}
            >
              <DatePicker className="w-full" />
            </Form.Item>
            <Form.Item
              label="Due date"
              name="dueDate"
              rules={[{ required: true, message: "Required." }]}
            >
              <DatePicker className="w-full" />
            </Form.Item>
          </div>
          <Form.Item
            label="Period covered"
            name="period"
            rules={[{ required: true, message: "Choose the period." }]}
          >
            <MobileRangePicker allowClear={false} />
          </Form.Item>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Form.Item
              label="Amount before VAT"
              name="subtotal"
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
            <Form.Item label="VAT amount" name="vatAmount">
              <InputNumber className="w-full" min={0} precision={2} />
            </Form.Item>
          </div>
          <Form.Item
            label="Invoice file"
            name="file"
            valuePropName="fileList"
            getValueFromEvent={(e: { fileList: UploadFile[] }) =>
              e.fileList.slice(-1)
            }
            rules={[{ required: true, message: "Attach the invoice." }]}
            extra="PDF, PNG or JPEG, up to 10 MB."
          >
            <Upload
              accept=".pdf,.png,.jpg,.jpeg"
              beforeUpload={() => false}
              maxCount={1}
            >
              <Button icon={<FileAddOutlined />}>Choose file</Button>
            </Upload>
          </Form.Item>
          <Form.Item label="Notes (optional)" name="notes">
            <Input.TextArea rows={2} maxLength={1000} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
