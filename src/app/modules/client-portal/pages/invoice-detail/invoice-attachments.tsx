import { useState } from "react";
import {
  Button,
  Form,
  Input,
  InputNumber,
  Modal,
  Select,
  Switch,
  Table,
  Typography,
  Upload,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import type { UploadFile } from "antd/es/upload/interface";
import { PlusOutlined, UploadOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { getNotify } from "@/shared/utils/notify";
import { PermissionGate } from "@/shared/components/permission-gate/permission-gate";
import {
  useInvoiceAttachments,
  useRemoveAttachment,
  useUpdateAttachment,
  useUploadAttachment,
} from "../../hooks/use-billing-format-queries";
import { clientPortalApi } from "../../services/client-portal.api";
import {
  ATTACHMENT_CATEGORY_OPTIONS,
  BILLING_PERMISSION,
} from "../../constants/label.const";
import { openBlobInNewTab } from "../../utils/open-blob";
import type {
  AttachmentCategory,
  InvoiceAttachment,
} from "../../models/api/billing-format.model";
import type { InvoiceStatus } from "../../models/api/response/client-portal-response.model";

const { Title, Text } = Typography;

const CATEGORY_LABEL: Record<string, string> = Object.fromEntries(
  ATTACHMENT_CATEGORY_OPTIONS.map((o) => [o.value, o.label]),
);

interface UploadForm {
  category: AttachmentCategory;
  title?: string;
  sortOrder: number;
  includeInPacket: boolean;
  visibleToClient: boolean;
  files: UploadFile[];
}

interface InvoiceAttachmentsProps {
  invoiceId: string;
  status: InvoiceStatus;
}

/**
 * Supporting files of an invoice (signed DTR, OT request and missed-log forms, the official sales invoice). They print after the
 * generated sections of the billing packet, in their order. They can be removed only before the invoice is issued.
 */
export function InvoiceAttachments({
  invoiceId,
  status,
}: InvoiceAttachmentsProps) {
  const attachments = useInvoiceAttachments(invoiceId);
  const upload = useUploadAttachment();
  const update = useUpdateAttachment();
  const remove = useRemoveAttachment();
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm<UploadForm>();
  const voided = status === "Voided";
  const removable = status !== "Issued" && !voided;

  const toggle = (
    a: InvoiceAttachment,
    change: Partial<
      Pick<InvoiceAttachment, "includeInPacket" | "visibleToClient">
    >,
  ) =>
    update.mutateAsync({
      id: a.id,
      request: {
        category: a.category,
        title: a.title,
        sortOrder: a.sortOrder,
        includeInPacket: a.includeInPacket,
        visibleToClient: a.visibleToClient,
        ...change,
      },
    });

  const columns: ColumnsType<InvoiceAttachment> = [
    { title: "Order", dataIndex: "sortOrder", width: 70, align: "right" },
    {
      title: "Attachment",
      key: "title",
      render: (_, a) => (
        <div>
          <Button
            type="link"
            className="p-0"
            onClick={async () =>
              openBlobInNewTab(
                await clientPortalApi.fetchBlob(
                  `invoices/attachments/${a.id}/file`,
                ),
                a.contentType,
              )
            }
          >
            {a.title}
          </Button>
          <div>
            <Text type="secondary" className="text-xs">
              {CATEGORY_LABEL[a.category] ?? a.category} · {a.fileName} ·{" "}
              {a.uploadedBy}, {dayjs(a.uploadedAt).format("MMM D, YYYY")}
            </Text>
          </div>
        </div>
      ),
    },
    {
      title: "In packet",
      key: "packet",
      render: (_, a) => (
        <Switch
          size="small"
          checked={a.includeInPacket}
          disabled={voided}
          onChange={(includeInPacket) => toggle(a, { includeInPacket })}
        />
      ),
    },
    {
      title: "Client sees it",
      key: "client",
      render: (_, a) => (
        <Switch
          size="small"
          checked={a.visibleToClient}
          disabled={voided}
          onChange={(visibleToClient) => toggle(a, { visibleToClient })}
        />
      ),
    },
    {
      title: "",
      key: "actions",
      align: "right",
      render: (_, a) =>
        removable ? (
          <PermissionGate permission={BILLING_PERMISSION.MANAGE}>
            <Button
              size="small"
              danger
              loading={remove.isPending}
              onClick={async () => {
                await remove.mutateAsync(a.id);
                getNotify().success({ message: "Attachment removed." });
              }}
            >
              Remove
            </Button>
          </PermissionGate>
        ) : null,
    },
  ];

  return (
    <div className="rounded-lg bg-white p-4">
      <div className="mb-3 flex items-center justify-between">
        <Title level={5} className="m-0!">
          Attachments
        </Title>
        {!voided && (
          <PermissionGate permission={BILLING_PERMISSION.MANAGE}>
            <Button
              size="small"
              icon={<PlusOutlined />}
              onClick={() => setOpen(true)}
            >
              Attach file
            </Button>
          </PermissionGate>
        )}
      </div>
      <Table<InvoiceAttachment>
        rowKey="id"
        size="small"
        pagination={false}
        loading={attachments.isLoading}
        dataSource={attachments.data ?? []}
        columns={columns}
        scroll={{ x: "max-content" }}
        locale={{ emptyText: "No attachments." }}
      />

      <Modal
        title="Attach a file"
        open={open}
        okText="Upload"
        confirmLoading={upload.isPending}
        onCancel={() => setOpen(false)}
        onOk={() => form.submit()}
        destroyOnHidden
      >
        <Form
          form={form}
          layout="vertical"
          preserve={false}
          initialValues={{
            category: "SignedDtr",
            sortOrder: (attachments.data?.length ?? 0) + 1,
            includeInPacket: true,
            visibleToClient: true,
            files: [],
          }}
          onFinish={async (values) => {
            const file = values.files[0]?.originFileObj;
            if (!file) return;
            const data = new FormData();
            data.append("file", file);
            data.append("category", values.category);
            data.append("title", values.title?.trim() ?? "");
            data.append("sortOrder", String(values.sortOrder ?? 0));
            data.append("includeInPacket", String(values.includeInPacket));
            data.append("visibleToClient", String(values.visibleToClient));
            await upload.mutateAsync({ invoiceId, form: data });
            getNotify().success({ message: "File attached." });
            setOpen(false);
          }}
        >
          <Form.Item
            label="File"
            name="files"
            valuePropName="fileList"
            getValueFromEvent={(e: { fileList: UploadFile[] }) =>
              e.fileList.slice(-1)
            }
            rules={[{ required: true, message: "Choose a PDF or an image." }]}
            extra="PDF, PNG or JPEG."
          >
            <Upload
              beforeUpload={() => false}
              maxCount={1}
              accept=".pdf,.png,.jpg,.jpeg"
            >
              <Button icon={<UploadOutlined />}>Choose file</Button>
            </Upload>
          </Form.Item>
          <div className="grid grid-cols-2 gap-3">
            <Form.Item label="Kind" name="category">
              <Select options={ATTACHMENT_CATEGORY_OPTIONS} />
            </Form.Item>
            <Form.Item label="Order in the packet" name="sortOrder">
              <InputNumber className="w-full" min={0} max={99} />
            </Form.Item>
          </div>
          <Form.Item
            label="Title"
            name="title"
            extra="Leave empty to use the file name."
          >
            <Input maxLength={200} />
          </Form.Item>
          <div className="grid grid-cols-2 gap-3">
            <Form.Item
              label="Include in the billing packet"
              name="includeInPacket"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>
            <Form.Item
              label="Client sees it"
              name="visibleToClient"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
