import { useState } from "react";
import {
  Button,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Modal,
  Radio,
  Table,
  Tag,
  Timeline,
  Typography,
  Upload,
  type UploadFile,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { PaperClipOutlined } from "@ant-design/icons";
import dayjs, { type Dayjs } from "dayjs";
import { getNotify } from "@/shared/utils/notify";
import { PermissionGate } from "@/shared/components/permission-gate/permission-gate";
import {
  useCerts2307,
  useCollectionNotes,
  useCreateMemo,
  useInvoiceHistory,
  useUpload2307,
} from "../../hooks/use-client-portal-queries";
import { BILLING_PERMISSION, peso } from "../../constants/label.const";
import { openPortalFile } from "../../utils/open-blob";
import type {
  Cert2307,
  CollectionNote,
  InvoiceStatus,
  Memo,
} from "../../models/api/response/client-portal-response.model";

const { Title, Text } = Typography;
const DATE = "YYYY-MM-DD";

interface Props {
  invoiceId: string;
  status: InvoiceStatus;
  memos: Memo[];
  withholdingExpected: number;
}

/** The parts of an invoice that only matter once it is approved or issued: memos, tax certificates, follow-ups and the change history. */
export function InvoiceExtras({
  invoiceId,
  status,
  memos,
  withholdingExpected,
}: Props) {
  const issued = status === "Issued";
  const approvedOrIssued = status === "Approved" || status === "Issued";

  const notes = useCollectionNotes(issued ? invoiceId : undefined);
  const certs = useCerts2307(approvedOrIssued ? invoiceId : undefined);
  const history = useInvoiceHistory(invoiceId);
  const createMemo = useCreateMemo();
  const upload = useUpload2307();

  const [memoOpen, setMemoOpen] = useState(false);
  const [certOpen, setCertOpen] = useState(false);
  const [memoForm] = Form.useForm<{
    kind: "Credit" | "Debit";
    subtotal: number;
    reason: string;
  }>();
  const [certForm] = Form.useForm<{
    amount: number;
    received: Dayjs;
    reference?: string;
    file: UploadFile[];
  }>();

  const openCert = (id: string) => openPortalFile(`withholding/${id}/file`);

  const memoColumns: ColumnsType<Memo> = [
    { title: "Memo", dataIndex: "number" },
    {
      title: "Type",
      key: "kind",
      render: (_, m) =>
        m.kind === "Credit" ? (
          <Tag color="green">Credit</Tag>
        ) : (
          <Tag color="orange">Debit</Tag>
        ),
    },
    { title: "Date", dataIndex: "memoDate" },
    { title: "Reason", dataIndex: "reason" },
    {
      title: "Amount (with VAT)",
      key: "total",
      align: "right",
      render: (_, m) => peso(m.total),
    },
    { title: "By", dataIndex: "createdBy" },
  ];

  const certColumns: ColumnsType<Cert2307> = [
    { title: "Received", dataIndex: "receivedDate" },
    { title: "Reference", render: (_, c) => c.reference ?? "—", key: "ref" },
    {
      title: "Tax withheld",
      key: "amount",
      align: "right",
      render: (_, c) => peso(c.amountWithheld),
    },
    {
      title: "File",
      key: "file",
      render: (_, c) => (
        <Button
          type="link"
          size="small"
          icon={<PaperClipOutlined />}
          onClick={() => openCert(c.id)}
        >
          {c.fileName}
        </Button>
      ),
    },
  ];

  const noteColumns: ColumnsType<CollectionNote> = [
    {
      title: "When",
      key: "at",
      render: (_, n) => dayjs(n.at).format("MMM D, h:mm A"),
    },
    { title: "How", dataIndex: "kind" },
    { title: "Who", dataIndex: "contact" },
    { title: "Note", dataIndex: "note" },
    {
      title: "Promised",
      key: "promised",
      render: (_, n) => n.promisedDate ?? "—",
    },
    { title: "By", dataIndex: "by" },
  ];

  return (
    <>
      {(memos.length > 0 || issued) && (
        <div className="rounded-lg bg-white p-4">
          <div className="mb-3 flex items-center justify-between">
            <Title level={5} className="m-0!">
              Credit and debit memos
            </Title>
            {issued && (
              <PermissionGate permission={BILLING_PERMISSION.APPROVE}>
                <Button size="small" onClick={() => setMemoOpen(true)}>
                  Issue a memo
                </Button>
              </PermissionGate>
            )}
          </div>
          <Table<Memo>
            rowKey="id"
            size="small"
            pagination={false}
            dataSource={memos}
            columns={memoColumns}
            scroll={{ x: "max-content" }}
            locale={{ emptyText: "No memos." }}
          />
        </div>
      )}

      {approvedOrIssued && withholdingExpected > 0 && (
        <div className="rounded-lg bg-white p-4">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <Title level={5} className="m-0!">
                BIR Form 2307
              </Title>
              <Text type="secondary">
                Expected tax withheld by the client: {peso(withholdingExpected)}
              </Text>
            </div>
            <PermissionGate permission={BILLING_PERMISSION.MANAGE}>
              <Button size="small" onClick={() => setCertOpen(true)}>
                Record a certificate
              </Button>
            </PermissionGate>
          </div>
          <Table<Cert2307>
            rowKey="id"
            size="small"
            pagination={false}
            dataSource={certs.data ?? []}
            columns={certColumns}
            scroll={{ x: "max-content" }}
            locale={{ emptyText: "No certificate received yet." }}
          />
        </div>
      )}

      {issued && (notes.data?.length ?? 0) > 0 && (
        <div className="rounded-lg bg-white p-4">
          <Title level={5}>Collection follow-ups</Title>
          <Table<CollectionNote>
            rowKey="id"
            size="small"
            pagination={false}
            dataSource={notes.data ?? []}
            columns={noteColumns}
            scroll={{ x: "max-content" }}
          />
        </div>
      )}

      <div className="rounded-lg bg-white p-4">
        <Title level={5}>Change history</Title>
        <Timeline
          items={(history.data ?? []).map((h) => ({
            children: (
              <div>
                <Text strong>{h.action}</Text>{" "}
                <Text type="secondary" className="text-xs">
                  {h.actor ?? "—"} · {dayjs(h.at).format("MMM D, YYYY h:mm A")}
                </Text>
                {h.detail && <div className="text-sm">{h.detail}</div>}
              </div>
            ),
          }))}
        />
      </div>

      <Modal
        title="Issue a credit or debit memo"
        open={memoOpen}
        okText="Issue memo"
        confirmLoading={createMemo.isPending}
        onCancel={() => setMemoOpen(false)}
        onOk={() => memoForm.submit()}
        destroyOnHidden
      >
        <Form
          form={memoForm}
          layout="vertical"
          initialValues={{ kind: "Credit" }}
          onFinish={async (values) => {
            await createMemo.mutateAsync({ invoiceId, ...values });
            getNotify().success({ message: "Memo issued." });
            setMemoOpen(false);
            memoForm.resetFields();
          }}
        >
          <Form.Item label="Type" name="kind">
            <Radio.Group
              options={[
                { value: "Credit", label: "Credit (client owes less)" },
                { value: "Debit", label: "Debit (client owes more)" },
              ]}
            />
          </Form.Item>
          <Form.Item
            label="Amount before VAT"
            name="subtotal"
            extra="VAT is added using this client's VAT rate."
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
            label="Reason"
            name="reason"
            rules={[{ required: true, min: 3, message: "Give a reason." }]}
          >
            <Input.TextArea rows={2} maxLength={500} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Record a BIR Form 2307"
        open={certOpen}
        okText="Save"
        confirmLoading={upload.isPending}
        onCancel={() => setCertOpen(false)}
        onOk={() => certForm.submit()}
        destroyOnHidden
      >
        <Form
          form={certForm}
          layout="vertical"
          initialValues={{ received: dayjs(), amount: withholdingExpected }}
          onFinish={async (values) => {
            const file = values.file?.[0]?.originFileObj;
            if (!file) return;
            const body = new FormData();
            body.set("invoiceId", invoiceId);
            body.set("amountWithheld", String(values.amount));
            body.set("receivedDate", values.received.format(DATE));
            if (values.reference) body.set("reference", values.reference);
            body.set("file", file);
            await upload.mutateAsync(body);
            getNotify().success({ message: "Certificate recorded." });
            setCertOpen(false);
            certForm.resetFields();
          }}
        >
          <Form.Item
            label="Tax withheld"
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
            label="Date received"
            name="received"
            rules={[{ required: true, message: "Required." }]}
          >
            <DatePicker className="w-full" />
          </Form.Item>
          <Form.Item label="Reference (quarter, form no.)" name="reference">
            <Input maxLength={100} />
          </Form.Item>
          <Form.Item
            label="Certificate file"
            name="file"
            valuePropName="fileList"
            getValueFromEvent={(e: { fileList: UploadFile[] }) =>
              e.fileList.slice(-1)
            }
            rules={[{ required: true, message: "Attach the certificate." }]}
            extra="PDF, PNG or JPEG, up to 10 MB."
          >
            <Upload
              accept=".pdf,.png,.jpg,.jpeg"
              beforeUpload={() => false}
              maxCount={1}
            >
              <Button icon={<PaperClipOutlined />}>Choose file</Button>
            </Upload>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
