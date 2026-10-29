import { useState } from "react";
import {
  Button,
  DatePicker,
  Form,
  Input,
  Modal,
  Select,
  Switch,
  Table,
  Tag,
  Typography,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { IconAction } from "@/shared/components/icon-action/icon-action";
import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  PushpinFilled,
} from "@ant-design/icons";
import dayjs, { type Dayjs } from "dayjs";
import { getNotify } from "@/shared/utils/notify";
import { PermissionGate } from "@/shared/components/permission-gate/permission-gate";
import {
  useDeleteNotice,
  usePortalClients,
  usePortalNotices,
  useSaveNotice,
} from "../../hooks/use-client-portal-queries";
import { OPERATIONS_PERMISSION } from "../../constants/label.const";
import type { PortalNotice } from "../../models/api/response/client-portal-response.model";

const { Title, Text } = Typography;

const STATE_TAG = {
  Live: { color: "green", label: "Live" },
  Scheduled: { color: "blue", label: "Scheduled" },
  Expired: { color: "default", label: "Expired" },
} as const;

interface NoticeForm {
  clientId?: string;
  title: string;
  body: string;
  pinned: boolean;
  publishAt?: Dayjs;
  expiresAt?: Dayjs;
}

export default function NoticeBoard() {
  const notices = usePortalNotices();
  const clients = usePortalClients();
  const save = useSaveNotice();
  const remove = useDeleteNotice();
  const [editing, setEditing] = useState<PortalNotice | "new" | null>(null);
  const [form] = Form.useForm<NoticeForm>();

  const open = (notice: PortalNotice | "new") => {
    setEditing(notice);
    form.setFieldsValue(
      notice === "new"
        ? {
            title: "",
            body: "",
            pinned: false,
            clientId: undefined,
            publishAt: undefined,
            expiresAt: undefined,
          }
        : {
            clientId: notice.clientId ?? undefined,
            title: notice.title,
            body: notice.body,
            pinned: notice.pinned,
            publishAt: dayjs(notice.publishAt),
            expiresAt: notice.expiresAt ? dayjs(notice.expiresAt) : undefined,
          },
    );
  };

  const submit = async (values: NoticeForm) => {
    await save.mutateAsync({
      id: editing && editing !== "new" ? editing.id : null,
      body: {
        clientId: values.clientId ?? null,
        title: values.title,
        body: values.body,
        pinned: !!values.pinned,
        publishAt: values.publishAt ? values.publishAt.toISOString() : null,
        expiresAt: values.expiresAt ? values.expiresAt.toISOString() : null,
      },
    });
    getNotify().success({ message: "Notice saved." });
    setEditing(null);
  };

  const columns: ColumnsType<PortalNotice> = [
    {
      title: "Notice",
      key: "title",
      render: (_, n) => (
        <div>
          <div className="font-medium">
            {n.pinned && <PushpinFilled className="mr-1 text-[#1DA081]" />}
            {n.title}
          </div>
          <Text type="secondary" className="text-xs">
            {n.body.length > 120 ? `${n.body.slice(0, 120)}…` : n.body}
          </Text>
        </div>
      ),
    },
    {
      title: "For",
      key: "for",
      render: (_, n) =>
        n.clientId
          ? ((clients.data ?? []).find((c) => c.id === n.clientId)?.name ??
            "One client")
          : "All clients",
    },
    {
      title: "Shown",
      key: "shown",
      render: (_, n) =>
        `${dayjs(n.publishAt).format("MMM D")}${n.expiresAt ? ` → ${dayjs(n.expiresAt).format("MMM D")}` : ""}`,
    },
    {
      title: "Status",
      key: "state",
      render: (_, n) => (
        <Tag color={STATE_TAG[n.state].color}>{STATE_TAG[n.state].label}</Tag>
      ),
    },
    {
      title: "",
      key: "actions",
      align: "right",
      render: (_, n) => (
        <PermissionGate permission={OPERATIONS_PERMISSION.MANAGE}>
          <div className="flex justify-end gap-2">
            <IconAction
              write
              title="Edit"
              icon={<EditOutlined />}
              onClick={() => open(n)}
            />
            <IconAction
              write
              title="Remove"
              danger
              icon={<DeleteOutlined />}
              onClick={() =>
                Modal.confirm({
                  title: `Remove "${n.title}"?`,
                  okButtonProps: { danger: true },
                  onOk: () => remove.mutateAsync(n.id),
                })
              }
            />
          </div>
        </PermissionGate>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <Title level={3} className="m-0!">
            Client Notice Board
          </Title>
          <Text type="secondary">
            Announcements clients see in their portal: holiday schedules,
            operational updates, emergency procedures.
          </Text>
        </div>
        <PermissionGate permission={OPERATIONS_PERMISSION.MANAGE}>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => open("new")}
          >
            New notice
          </Button>
        </PermissionGate>
      </div>

      <Table<PortalNotice>
        rowKey="id"
        loading={notices.isLoading}
        dataSource={notices.data ?? []}
        columns={columns}
        scroll={{ x: "max-content" }}
        pagination={{ pageSize: 20, hideOnSinglePage: true }}
      />

      <Modal
        title={editing === "new" ? "New notice" : "Edit notice"}
        open={editing !== null}
        okText="Save"
        confirmLoading={save.isPending}
        onCancel={() => setEditing(null)}
        onOk={() => form.submit()}
        destroyOnHidden
      >
        <Form form={form} layout="vertical" onFinish={submit}>
          <Form.Item
            label="Audience"
            name="clientId"
            extra="Leave empty to show it to every client."
          >
            <Select
              allowClear
              showSearch
              optionFilterProp="label"
              placeholder="All clients"
              options={(clients.data ?? []).map((c) => ({
                value: c.id,
                label: c.name,
              }))}
            />
          </Form.Item>
          <Form.Item
            label="Title"
            name="title"
            rules={[{ required: true, message: "Required." }]}
          >
            <Input maxLength={200} />
          </Form.Item>
          <Form.Item
            label="Message"
            name="body"
            rules={[{ required: true, message: "Required." }]}
          >
            <Input.TextArea rows={5} maxLength={8000} showCount />
          </Form.Item>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Form.Item label="Show from" name="publishAt" extra="Empty = now.">
              <DatePicker showTime className="w-full" />
            </Form.Item>
            <Form.Item
              label="Hide after"
              name="expiresAt"
              extra="Empty = never."
            >
              <DatePicker showTime className="w-full" />
            </Form.Item>
          </div>
          <Form.Item
            label="Pin to the top"
            name="pinned"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
