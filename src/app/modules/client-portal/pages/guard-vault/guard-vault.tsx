import { useState } from "react";
import {
  Alert,
  Button,
  DatePicker,
  Drawer,
  Form,
  Input,
  Modal,
  Select,
  Table,
  Tabs,
  Tag,
  Typography,
  Upload,
  type UploadFile,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { PaperClipOutlined, UploadOutlined } from "@ant-design/icons";
import { type Dayjs } from "dayjs";
import { getNotify } from "@/shared/utils/notify";
import { PermissionGate } from "@/shared/components/permission-gate/permission-gate";
import {
  useDeleteVaultDocument,
  usePortalClients,
  useSaveVaultAlertSettings,
  useUploadVaultDocument,
  useVaultAlertSettings,
  useVaultDocuments,
  useVaultExpiring,
  useVaultGuards,
} from "../../hooks/use-client-portal-queries";
import { clientPortalApi } from "../../services/client-portal.api";
import {
  DOCUMENT_KIND_OPTIONS,
  OPERATIONS_PERMISSION,
} from "../../constants/label.const";
import { openBlobInNewTab } from "../../utils/open-blob";
import type {
  GuardDocument,
  GuardVaultRow,
} from "../../models/api/response/client-portal-response.model";

const { Title, Text } = Typography;
const DATE = "YYYY-MM-DD";

const STATUS_TAG: Record<
  GuardDocument["status"],
  { color: string; label: string }
> = {
  Valid: { color: "green", label: "Valid" },
  ExpiringSoon: { color: "orange", label: "Expiring soon" },
  Expired: { color: "red", label: "Expired" },
  NoExpiry: { color: "default", label: "No expiry" },
};

interface UploadForm {
  kind: string;
  title: string;
  number?: string;
  issuedOn?: Dayjs;
  expiresOn?: Dayjs;
  file: UploadFile[];
}

/** Who is emailed when a guard's document reaches a warning step (60, 30, 14 and 7 days before expiry, and when it has expired). */
function AlertAddresses() {
  const settings = useVaultAlertSettings();
  const save = useSaveVaultAlertSettings();
  const [draft, setDraft] = useState<string | null>(null);
  const value = draft ?? settings.data?.emails ?? "";

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-lg bg-white p-4">
      <Text strong>Email expiry alerts to</Text>
      <Input
        className="max-w-md"
        placeholder="hr@company.com, manager@company.com"
        value={value}
        disabled={settings.isLoading}
        onChange={(e) => setDraft(e.target.value)}
      />
      <PermissionGate permission={OPERATIONS_PERMISSION.MANAGE}>
        <Button
          loading={save.isPending}
          disabled={draft === null}
          onClick={async () => {
            await save.mutateAsync(value);
            setDraft(null);
            getNotify().success({ message: "Alert addresses saved." });
          }}
        >
          Save
        </Button>
      </PermissionGate>
    </div>
  );
}

export default function GuardVault() {
  const clients = usePortalClients();
  const [clientId, setClientId] = useState<string | undefined>();
  const [guard, setGuard] = useState<GuardVaultRow | null>(null);
  const guards = useVaultGuards(clientId);
  const expiring = useVaultExpiring(60, clientId);
  const documents = useVaultDocuments(clientId, guard?.guardId);
  const upload = useUploadVaultDocument();
  const remove = useDeleteVaultDocument();
  const [uploadOpen, setUploadOpen] = useState(false);
  const [form] = Form.useForm<UploadForm>();

  const open = async (id: string) => {
    const blob = await clientPortalApi.fetchBlob(`vault/documents/${id}/file`);
    openBlobInNewTab(blob, blob.type);
  };

  const documentColumns: ColumnsType<GuardDocument> = [
    { title: "Document", dataIndex: "title" },
    { title: "Number", render: (_, d) => d.number ?? "—", key: "number" },
    { title: "Expires", render: (_, d) => d.expiresOn ?? "—", key: "expires" },
    {
      title: "Status",
      key: "status",
      render: (_, d) => (
        <Tag color={STATUS_TAG[d.status].color}>
          {STATUS_TAG[d.status].label}
          {d.daysToExpiry !== null &&
          d.daysToExpiry >= 0 &&
          d.status === "ExpiringSoon"
            ? ` · ${d.daysToExpiry}d`
            : ""}
        </Tag>
      ),
    },
    {
      title: "",
      key: "actions",
      align: "right",
      render: (_, d) => (
        <div className="flex justify-end gap-2">
          <Button
            size="small"
            icon={<PaperClipOutlined />}
            onClick={() => open(d.id)}
          >
            Open
          </Button>
          <PermissionGate permission={OPERATIONS_PERMISSION.MANAGE}>
            <Button
              size="small"
              danger
              onClick={() =>
                Modal.confirm({
                  title: `Delete "${d.title}"?`,
                  okButtonProps: { danger: true },
                  onOk: () => remove.mutateAsync(d.id),
                })
              }
            >
              Delete
            </Button>
          </PermissionGate>
        </div>
      ),
    },
  ];

  const guardColumns: ColumnsType<GuardVaultRow> = [
    { title: "Code", dataIndex: "code", width: 110 },
    { title: "Guard", dataIndex: "name" },
    { title: "Documents", dataIndex: "documents", align: "right" },
    {
      title: "Next expiry",
      key: "next",
      render: (_, g) => g.nextExpiry ?? "—",
    },
    {
      title: "Alerts",
      key: "alerts",
      render: (_, g) => (
        <div className="flex gap-1">
          {g.expired > 0 && <Tag color="red">{g.expired} expired</Tag>}
          {g.expiringSoon > 0 && (
            <Tag color="orange">{g.expiringSoon} expiring</Tag>
          )}
        </div>
      ),
    },
    {
      title: "",
      key: "actions",
      align: "right",
      render: (_, g) => (
        <Button size="small" onClick={() => setGuard(g)}>
          Documents
        </Button>
      ),
    },
  ];

  const submit = async (values: UploadForm) => {
    const file = values.file?.[0]?.originFileObj;
    if (!guard || !file) return;
    const body = new FormData();
    body.set("guardId", guard.guardId);
    body.set("kind", values.kind);
    body.set("title", values.title);
    if (values.number) body.set("number", values.number);
    if (values.issuedOn) body.set("issuedOn", values.issuedOn.format(DATE));
    if (values.expiresOn) body.set("expiresOn", values.expiresOn.format(DATE));
    body.set("file", file);
    await upload.mutateAsync(body);
    getNotify().success({ message: "Document saved." });
    setUploadOpen(false);
    form.resetFields();
  };

  return (
    <div className="flex flex-col gap-4">
      <div>
        <Title level={3} className="m-0!">
          Guard Documents
        </Title>
        <Text type="secondary">
          Licenses, clearances and certificates of deployed guards. Clients see
          the documents of guards who work at their sites.
        </Text>
      </div>

      <AlertAddresses />

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
          items={[
            {
              key: "guards",
              label: "Guards",
              children: (
                <Table<GuardVaultRow>
                  rowKey="guardId"
                  size="small"
                  loading={guards.isLoading}
                  dataSource={guards.data ?? []}
                  columns={guardColumns}
                  scroll={{ x: "max-content" }}
                  pagination={{ pageSize: 25, hideOnSinglePage: true }}
                />
              ),
            },
            {
              key: "expiring",
              label: `Expiring within 60 days (${expiring.data?.length ?? 0})`,
              children: (
                <Table<GuardDocument>
                  rowKey="id"
                  size="small"
                  loading={expiring.isLoading}
                  dataSource={expiring.data ?? []}
                  scroll={{ x: "max-content" }}
                  pagination={{ pageSize: 25, hideOnSinglePage: true }}
                  columns={[
                    { title: "Guard", dataIndex: "guardName" },
                    ...documentColumns.slice(0, 3),
                    documentColumns[3],
                  ]}
                />
              ),
            },
          ]}
        />
      </div>

      <Drawer
        open={!!guard}
        onClose={() => setGuard(null)}
        size="large"
        title={guard ? `${guard.name} — documents` : ""}
        extra={
          <PermissionGate permission={OPERATIONS_PERMISSION.MANAGE}>
            <Button
              type="primary"
              icon={<UploadOutlined />}
              onClick={() => setUploadOpen(true)}
            >
              Add document
            </Button>
          </PermissionGate>
        }
        destroyOnHidden
      >
        {guard && guard.expired > 0 && (
          <Alert
            type="error"
            showIcon
            className="mb-3"
            message={`${guard.expired} document(s) have expired.`}
          />
        )}
        <Table<GuardDocument>
          rowKey="id"
          size="small"
          loading={documents.isLoading}
          dataSource={documents.data ?? []}
          columns={documentColumns}
          pagination={false}
        />
      </Drawer>

      <Modal
        title="Add a document"
        open={uploadOpen}
        okText="Save"
        confirmLoading={upload.isPending}
        onCancel={() => setUploadOpen(false)}
        onOk={() => form.submit()}
        destroyOnHidden
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={submit}
          initialValues={{ kind: "License" }}
        >
          <Form.Item label="Type" name="kind">
            <Select options={DOCUMENT_KIND_OPTIONS} />
          </Form.Item>
          <Form.Item
            label="Title"
            name="title"
            rules={[{ required: true, message: "Required." }]}
          >
            <Input maxLength={200} />
          </Form.Item>
          <Form.Item label="Number" name="number">
            <Input maxLength={100} />
          </Form.Item>
          <div className="grid grid-cols-2 gap-3">
            <Form.Item label="Issued" name="issuedOn">
              <DatePicker className="w-full" />
            </Form.Item>
            <Form.Item
              label="Expires"
              name="expiresOn"
              extra="Leave empty if it never expires."
            >
              <DatePicker className="w-full" />
            </Form.Item>
          </div>
          <Form.Item
            label="File"
            name="file"
            valuePropName="fileList"
            getValueFromEvent={(e: { fileList: UploadFile[] }) =>
              e.fileList.slice(-1)
            }
            rules={[{ required: true, message: "Attach the document." }]}
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
    </div>
  );
}
