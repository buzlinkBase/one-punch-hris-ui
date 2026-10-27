import { useState } from "react";
import {
  Button,
  Drawer,
  Form,
  Input,
  Popconfirm,
  Switch,
  Table,
  Tag,
  Typography,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { getNotify } from "@/shared/utils/notify";
import { PermissionGate } from "@/shared/components/permission-gate/permission-gate";
import {
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

  // Switches edit a draft (only what was changed, over the saved values); nothing is saved until Apply.
  const [edits, setEdits] = useState<Record<string, boolean>>({});
  const draft: Record<string, boolean> = { ...modules.data, ...edits };

  const dirty = PORTAL_MODULE_OPTIONS.some(
    (m) => !!draft[m.key] !== !!modules.data?.[m.key],
  );

  const applyModules = async () => {
    if (!client) return;
    await setModules.mutateAsync({ id: client.id, modules: draft });
    setEdits({});
    getNotify().success({ message: CLIENT_PORTAL_LABEL.SECTIONS_UPDATED });
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
        ) : u.revokedIndividually ? (
          // Stays off when the client is switched back on.
          <Tag color="red">Access revoked</Tag>
        ) : (
          // Only blocked because the whole client is off: switching the client on brings them back.
          <Tag color="orange">Client suspended</Tag>
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
            <>
              <Button
                size="small"
                onClick={() =>
                  userAction.mutate({ kind: "reset", userId: u.id })
                }
              >
                Reset access
              </Button>
              <Popconfirm
                title="Remove this person from the client?"
                description="They lose access to this client. Their other clients, if any, are not affected."
                okText="Remove"
                okButtonProps={{ danger: true }}
                onConfirm={() =>
                  userAction.mutate({ kind: "remove", userId: u.id })
                }
              >
                <Button size="small" danger>
                  Remove
                </Button>
              </Popconfirm>
            </>
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
              checked={!!draft[m.key]}
              disabled={modules.isLoading}
              onChange={(checked) =>
                setEdits((e) => ({ ...e, [m.key]: checked }))
              }
            />
          </div>
        ))}
      </div>
      <PermissionGate permission={CLIENT_PORTAL_PERMISSION.MANAGE}>
        <div className="mb-6 flex justify-end gap-2">
          <Button
            disabled={!dirty || setModules.isPending}
            onClick={() => setEdits({})}
          >
            {CLIENT_PORTAL_LABEL.SECTIONS_RESET}
          </Button>
          <Button
            type="primary"
            disabled={!dirty}
            loading={setModules.isPending}
            onClick={applyModules}
          >
            {CLIENT_PORTAL_LABEL.SECTIONS_APPLY}
          </Button>
        </div>
      </PermissionGate>

      <Title level={5}>Portal users</Title>
      <Table<PortalClientUser>
        scroll={{ x: "max-content" }}
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
  const setActive = useSetPortalClientActive();
  const [selected, setSelected] = useState<PortalClient | null>(null);

  const columns: ColumnsType<PortalClient> = [
    { title: "Code", dataIndex: "code", width: 120 },
    { title: "Name", dataIndex: "name" },
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
      <div>
        <Title level={3} className="m-0!">
          {CLIENT_PORTAL_LABEL.CLIENTS_TITLE}
        </Title>
        <Text type="secondary">{CLIENT_PORTAL_LABEL.CLIENTS_SUBTITLE}</Text>
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
    </div>
  );
}
