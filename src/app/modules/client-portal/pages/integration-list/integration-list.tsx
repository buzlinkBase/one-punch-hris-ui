import { useState } from "react";
import {
  Alert,
  Button,
  Form,
  Input,
  Modal,
  Switch,
  Table,
  Tag,
  Typography,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { CopyOutlined, PlusOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { getNotify } from "@/shared/utils/notify";
import { PermissionGate } from "@/shared/components/permission-gate/permission-gate";
import {
  useCreatePortalSource,
  usePortalSources,
  useRotatePortalSource,
  useSetPortalSourceActive,
} from "../../hooks/use-client-portal-queries";
import {
  CLIENT_PORTAL_LABEL,
  CLIENT_PORTAL_PERMISSION,
} from "../../constants/label.const";
import type {
  IntegrationSource,
  IntegrationSourceKey,
} from "../../models/api/response/client-portal-response.model";

const { Title, Text, Paragraph } = Typography;

export default function IntegrationList() {
  const sources = usePortalSources();
  const create = useCreatePortalSource();
  const rotate = useRotatePortalSource();
  const setActive = useSetPortalSourceActive();
  const [createOpen, setCreateOpen] = useState(false);
  const [issued, setIssued] = useState<IntegrationSourceKey | null>(null);
  const [form] = Form.useForm<{ name: string }>();

  const submit = async (values: { name: string }) => {
    const result = await create.mutateAsync(values.name);
    setCreateOpen(false);
    form.resetFields();
    setIssued(result);
  };

  const confirmRotate = (source: IntegrationSource) => {
    Modal.confirm({
      title: `Rotate the key for ${source.name}?`,
      content:
        "The current key stops working immediately. The new key is shown once.",
      okText: "Rotate key",
      onOk: async () => setIssued(await rotate.mutateAsync(source.id)),
    });
  };

  const copy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    getNotify().success({ message: "Key copied." });
  };

  const columns: ColumnsType<IntegrationSource> = [
    { title: "Name", dataIndex: "name" },
    {
      title: "Key",
      key: "key",
      render: (_, s) => <Text code>{`cpk_${s.keyPrefix}…`}</Text>,
    },
    {
      title: "Last used",
      key: "lastUsed",
      render: (_, s) =>
        s.lastUsedAt
          ? dayjs(s.lastUsedAt).format("MMM D, YYYY h:mm A")
          : "Never",
    },
    {
      title: "Status",
      key: "active",
      render: (_, s) => (
        <PermissionGate permission={CLIENT_PORTAL_PERMISSION.MANAGE}>
          <Switch
            checked={s.isActive}
            checkedChildren="On"
            unCheckedChildren="Off"
            onChange={(checked) =>
              setActive.mutate({ id: s.id, active: checked })
            }
          />
        </PermissionGate>
      ),
    },
    {
      title: "",
      key: "actions",
      align: "right",
      render: (_, s) => (
        <PermissionGate permission={CLIENT_PORTAL_PERMISSION.MANAGE}>
          <Button size="small" onClick={() => confirmRotate(s)}>
            Rotate key
          </Button>
        </PermissionGate>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <Title level={3} className="m-0!">
            {CLIENT_PORTAL_LABEL.INTEGRATIONS_TITLE}
          </Title>
          <Text type="secondary">
            {CLIENT_PORTAL_LABEL.INTEGRATIONS_SUBTITLE}
          </Text>
        </div>
        <PermissionGate permission={CLIENT_PORTAL_PERMISSION.MANAGE}>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setCreateOpen(true)}
          >
            New integration
          </Button>
        </PermissionGate>
      </div>

      <Table<IntegrationSource>
        rowKey="id"
        loading={sources.isLoading}
        dataSource={sources.data ?? []}
        columns={columns}
        scroll={{ x: "max-content" }}
        pagination={false}
      />

      <Modal
        title="New integration"
        open={createOpen}
        onCancel={() => setCreateOpen(false)}
        onOk={() => form.submit()}
        okText="Create key"
        confirmLoading={create.isPending}
        destroyOnHidden
      >
        <Form form={form} layout="vertical" onFinish={submit}>
          <Form.Item
            label="Name"
            name="name"
            extra="For example: Main HRIS, Legacy payroll."
            rules={[{ required: true, min: 2, message: "Enter a name." }]}
          >
            <Input maxLength={100} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={issued ? `API key for ${issued.source.name}` : ""}
        open={!!issued}
        onCancel={() => setIssued(null)}
        footer={
          <Button type="primary" onClick={() => setIssued(null)}>
            I have saved it
          </Button>
        }
        maskClosable={false}
      >
        <Alert
          type="warning"
          showIcon
          message="Copy this key now. It is shown only once and cannot be recovered."
          className="mb-3"
        />
        <Paragraph code copyable={false} className="break-all">
          {issued?.apiKey}
        </Paragraph>
        <Button
          icon={<CopyOutlined />}
          onClick={() => issued && copy(issued.apiKey)}
        >
          Copy key
        </Button>
        <Paragraph type="secondary" className="mt-3 mb-0">
          Send it in the <Tag>X-Api-Key</Tag> header of every request to the
          portal&apos;s <Text code>/ingest</Text> endpoints.
        </Paragraph>
      </Modal>
    </div>
  );
}
