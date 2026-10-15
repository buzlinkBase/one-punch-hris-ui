import { useState } from "react";
import {
  Button,
  Checkbox,
  Drawer,
  Form,
  Input,
  Modal,
  Switch,
  Table,
  Tag,
  Typography,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { PlusOutlined } from "@ant-design/icons";
import { getNotify } from "@/shared/utils/notify";
import { PermissionGate } from "@/shared/components/permission-gate/permission-gate";
import {
  useCreatePortalClient,
  useInvitePortalUser,
  usePortalClients,
  usePortalModules,
  usePortalUserAction,
  usePortalUsers,
  useSetPortalClientActive,
  useSetPortalModules,
} from "../../hooks/use-client-portal-queries";
import {
  CLIENT_PORTAL_LABEL,
  CLIENT_PORTAL_PERMISSION,
  PORTAL_MODULE_OPTIONS,
} from "../../constants/label.const";
import type {
  PortalClient,
  PortalClientUser,
} from "../../models/api/response/client-portal-response.model";

const { Title, Text } = Typography;

interface NewClientForm {
  code: string;
  name: string;
  adminName: string;
  adminEmail: string;
  enabledModules: string[];
}

const DEFAULT_MODULES = [
  "TimeLogs",
  "Invoicing",
  "Payments",
  "Disputes",
  "Reports",
  "NoticeBoard",
];

function ClientDrawer({
  client,
  onClose,
}: {
  client: PortalClient | null;
  onClose: () => void;
}) {
  const modules = usePortalModules(client?.id);
  const users = usePortalUsers(client?.id);
  const setModules = useSetPortalModules();
  const invite = useInvitePortalUser();
  const userAction = usePortalUserAction();
  const [inviteForm] = Form.useForm<{ fullName: string; email: string }>();

  const toggle = async (key: string, enabled: boolean) => {
    if (!client) return;
    await setModules.mutateAsync({
      id: client.id,
      modules: { [key]: enabled },
    });
  };

  const submitInvite = async (values: { fullName: string; email: string }) => {
    if (!client) return;
    await invite.mutateAsync({
      clientId: client.id,
      request: {
        email: values.email,
        fullName: values.fullName,
        roleIds: [],
        siteIds: [],
        makeClientAdmin: true,
      },
    });
    getNotify().success({ message: "Invitation sent." });
    inviteForm.resetFields();
  };

  const userColumns: ColumnsType<PortalClientUser> = [
    {
      title: "Name",
      key: "name",
      render: (_, u) => (
        <div>
          <div className="font-medium">{u.fullName}</div>
          <Text type="secondary" className="text-xs">
            {u.email}
          </Text>
        </div>
      ),
    },
    {
      title: "Status",
      key: "status",
      render: (_, u) =>
        u.invitePending ? (
          <Tag>Invited</Tag>
        ) : u.isActive ? (
          <Tag color="green">Active</Tag>
        ) : (
          <Tag>Inactive</Tag>
        ),
    },
    {
      title: "",
      key: "actions",
      align: "right",
      render: (_, u) => (
        <div className="flex justify-end gap-2">
          {u.invitePending ? (
            <Button
              size="small"
              onClick={() =>
                userAction.mutate({ kind: "resend", userId: u.id })
              }
            >
              Resend
            </Button>
          ) : (
            <Button
              size="small"
              onClick={() => userAction.mutate({ kind: "reset", userId: u.id })}
            >
              Reset access
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <Drawer
      title={client ? `${client.name} (${client.code})` : ""}
      open={!!client}
      onClose={onClose}
      size="large"
      destroyOnHidden
    >
      <Title level={5}>Portal sections</Title>
      <Text type="secondary">
        Only the sections switched on here appear for this client&apos;s users.
      </Text>
      <div className="mt-3 mb-6 grid grid-cols-1 gap-2 sm:grid-cols-2">
        {PORTAL_MODULE_OPTIONS.map((m) => (
          <div
            key={m.key}
            className="flex items-center justify-between rounded border border-gray-100 px-3 py-2"
          >
            <span>{m.label}</span>
            <Switch
              checked={!!modules.data?.[m.key]}
              loading={modules.isLoading || setModules.isPending}
              onChange={(checked) => toggle(m.key, checked)}
            />
          </div>
        ))}
      </div>

      <Title level={5}>Portal users</Title>
      <Table<PortalClientUser>
        rowKey="id"
        size="small"
        loading={users.isLoading}
        dataSource={users.data ?? []}
        columns={userColumns}
        pagination={false}
        className="mb-4"
      />

      <Form
        form={inviteForm}
        layout="inline"
        onFinish={submitInvite}
        className="gap-y-2"
      >
        <Form.Item
          name="fullName"
          rules={[{ required: true, message: "Name" }]}
        >
          <Input placeholder="Administrator name" />
        </Form.Item>
        <Form.Item
          name="email"
          rules={[{ required: true, type: "email", message: "Email" }]}
        >
          <Input placeholder="Email" />
        </Form.Item>
        <Button type="primary" htmlType="submit" loading={invite.isPending}>
          Invite administrator
        </Button>
      </Form>
    </Drawer>
  );
}

export default function ClientList() {
  const clients = usePortalClients();
  const create = useCreatePortalClient();
  const setActive = useSetPortalClientActive();
  const [createOpen, setCreateOpen] = useState(false);
  const [selected, setSelected] = useState<PortalClient | null>(null);
  const [form] = Form.useForm<NewClientForm>();

  const submit = async (values: NewClientForm) => {
    await create.mutateAsync({
      code: values.code,
      name: values.name,
      externalId: null,
      adminEmail: values.adminEmail,
      adminName: values.adminName,
      enabledModules: values.enabledModules,
    });
    getNotify().success({ message: "Client created and invitation sent." });
    setCreateOpen(false);
    form.resetFields();
  };

  const columns: ColumnsType<PortalClient> = [
    { title: "Code", dataIndex: "code", width: 120 },
    { title: "Name", dataIndex: "name" },
    {
      title: "Source",
      key: "source",
      render: (_, c) =>
        c.externalId ? <Tag color="blue">Synced</Tag> : <Tag>Manual</Tag>,
    },
    {
      title: "Portal access",
      key: "active",
      render: (_, c) => (
        <PermissionGate permission={CLIENT_PORTAL_PERMISSION.MANAGE}>
          <Switch
            checked={c.isActive}
            onChange={(checked) =>
              setActive.mutate({ id: c.id, active: checked })
            }
          />
        </PermissionGate>
      ),
    },
    {
      title: "",
      key: "actions",
      align: "right",
      render: (_, c) => (
        <Button size="small" onClick={() => setSelected(c)}>
          Manage
        </Button>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <Title level={3} className="m-0!">
            {CLIENT_PORTAL_LABEL.CLIENTS_TITLE}
          </Title>
          <Text type="secondary">{CLIENT_PORTAL_LABEL.CLIENTS_SUBTITLE}</Text>
        </div>
        <PermissionGate permission={CLIENT_PORTAL_PERMISSION.MANAGE}>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setCreateOpen(true)}
          >
            New client
          </Button>
        </PermissionGate>
      </div>

      <Table<PortalClient>
        rowKey="id"
        loading={clients.isLoading}
        dataSource={clients.data ?? []}
        columns={columns}
        scroll={{ x: "max-content" }}
        pagination={{ pageSize: 20, hideOnSinglePage: true }}
      />

      <ClientDrawer client={selected} onClose={() => setSelected(null)} />

      <Modal
        title="New portal client"
        open={createOpen}
        onCancel={() => setCreateOpen(false)}
        onOk={() => form.submit()}
        okText="Create and invite"
        confirmLoading={create.isPending}
        destroyOnHidden
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={submit}
          initialValues={{ enabledModules: DEFAULT_MODULES }}
        >
          <Form.Item
            label="Code"
            name="code"
            rules={[{ required: true, message: "Enter a short code." }]}
          >
            <Input maxLength={40} />
          </Form.Item>
          <Form.Item
            label="Company name"
            name="name"
            rules={[{ required: true, message: "Enter the company name." }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Administrator name"
            name="adminName"
            rules={[{ required: true, message: "Enter a name." }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Administrator email"
            name="adminEmail"
            rules={[
              { required: true, type: "email", message: "Enter an email." },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item label="Portal sections" name="enabledModules">
            <Checkbox.Group
              options={PORTAL_MODULE_OPTIONS.map((m) => ({
                value: m.key,
                label: m.label,
              }))}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
