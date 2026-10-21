import { useState } from "react";
import {
  Button,
  Form,
  Input,
  InputNumber,
  Modal,
  Select,
  Space,
  Switch,
  Table,
  Tabs,
  Tag,
  Typography,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { PlusOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { authStorage } from "@/core/auth/auth-storage";
import { useAuthUser } from "@/core/auth/use-auth-user";
import { getNotify } from "@/shared/utils/notify";
import { PermissionGate } from "@/shared/components/permission-gate/permission-gate";
import {
  useBillingFormats,
  useCloneFormat,
  useNumberSeries,
  useSaveNumberSeries,
  useSetFormatActive,
} from "../../hooks/use-billing-format-queries";
import {
  BILLING_FORMAT_LABEL,
  BILLING_PERMISSION,
  PRICING_METHOD_LABEL,
} from "../../constants/label.const";
import type {
  BillingFormatSummary,
  NumberSeries,
  NumberSeriesRequest,
} from "../../models/api/billing-format.model";
import { FormatEditor } from "./format-editor";

const { Title, Text } = Typography;

export default function BillingFormats() {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <Title level={3} className="m-0!">
          {BILLING_FORMAT_LABEL.FORMATS_TITLE}
        </Title>
        <Text type="secondary">{BILLING_FORMAT_LABEL.FORMATS_SUBTITLE}</Text>
      </div>
      <div className="rounded-lg bg-white p-4">
        <Tabs
          items={[
            { key: "formats", label: "Formats", children: <FormatsTab /> },
            { key: "numbering", label: "Numbering", children: <SeriesTab /> },
          ]}
        />
      </div>
    </div>
  );
}

function FormatsTab() {
  const formats = useBillingFormats();
  const clone = useCloneFormat();
  const setActive = useSetFormatActive();
  const [editing, setEditing] = useState<string>();
  const [cloning, setCloning] = useState<BillingFormatSummary>();
  const [cloneForm] = Form.useForm<{ name: string }>();
  useAuthUser(); // re-render when the session's permissions change
  const canManage = authStorage.hasAnyPermission(BILLING_PERMISSION.MANAGE);

  const columns: ColumnsType<BillingFormatSummary> = [
    {
      title: "Format",
      key: "name",
      render: (_, f) => (
        <div>
          <div className="font-medium">
            {f.name}
            {f.isBuiltIn && (
              <Tag color="blue" className="ml-2">
                {BILLING_FORMAT_LABEL.BUILT_IN_TAG}
              </Tag>
            )}
          </div>
          {f.description && (
            <Text type="secondary" className="text-xs">
              {f.description}
            </Text>
          )}
        </div>
      ),
    },
    {
      title: "Pricing",
      key: "method",
      render: (_, f) => PRICING_METHOD_LABEL[f.method] ?? f.method,
    },
    { title: "Version", dataIndex: "version", align: "right", width: 90 },
    {
      title: "Used by",
      key: "usedBy",
      align: "right",
      width: 110,
      render: (_, f) =>
        f.usedBy === 1 ? "1 arrangement" : `${f.usedBy} arrangements`,
    },
    {
      title: "Updated",
      key: "updated",
      width: 130,
      render: (_, f) => dayjs(f.updatedAt).format("MMM D, YYYY"),
    },
    {
      title: "Active",
      key: "active",
      width: 90,
      render: (_, f) =>
        canManage ? (
          <Switch
            size="small"
            checked={f.isActive}
            loading={setActive.isPending}
            onChange={async (active) => {
              await setActive.mutateAsync({ id: f.id, active });
              getNotify().success({
                message: active
                  ? "Format switched on."
                  : "Format switched off.",
              });
            }}
          />
        ) : f.isActive ? (
          <Tag color="green">On</Tag>
        ) : (
          <Tag>Off</Tag>
        ),
    },
    {
      title: "",
      key: "actions",
      align: "right",
      render: (_, f) => (
        <Space>
          <Button size="small" onClick={() => setEditing(f.id)}>
            {f.isBuiltIn || !canManage ? "View" : "Edit"}
          </Button>
          <PermissionGate permission={BILLING_PERMISSION.MANAGE}>
            <Button
              size="small"
              onClick={() => {
                setCloning(f);
                cloneForm.setFieldsValue({ name: `${f.name} (copy)` });
              }}
            >
              Copy
            </Button>
          </PermissionGate>
        </Space>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-3">
      <Text type="secondary">{BILLING_FORMAT_LABEL.BUILT_IN_HELP}</Text>
      <Table<BillingFormatSummary>
        rowKey="id"
        size="small"
        loading={formats.isLoading}
        dataSource={formats.data ?? []}
        columns={columns}
        pagination={false}
        scroll={{ x: "max-content" }}
      />

      <FormatEditor formatId={editing} onClose={() => setEditing(undefined)} />

      <Modal
        title={cloning ? `Copy ${cloning.name}` : "Copy format"}
        open={!!cloning}
        okText="Copy"
        confirmLoading={clone.isPending}
        onCancel={() => setCloning(undefined)}
        onOk={() => cloneForm.submit()}
        destroyOnHidden
      >
        <Form
          form={cloneForm}
          layout="vertical"
          onFinish={async (values) => {
            if (!cloning) return;
            const copy = await clone.mutateAsync({
              id: cloning.id,
              name: values.name.trim(),
            });
            getNotify().success({ message: "Format copied." });
            setCloning(undefined);
            setEditing(copy.id);
          }}
        >
          <Form.Item
            label="Name of the copy"
            name="name"
            rules={[{ required: true, message: "Required." }]}
          >
            <Input maxLength={100} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

const EMPTY_SERIES: NumberSeriesRequest = {
  name: "",
  purpose: "Invoice",
  mode: "Auto",
  pattern: "{seq}",
  nextValue: 1,
  resetYearly: false,
  isActive: true,
};

function SeriesTab() {
  const series = useNumberSeries();
  const save = useSaveNumberSeries();
  const [editing, setEditing] = useState<{ id: string | null }>();
  const [form] = Form.useForm<NumberSeriesRequest>();

  const open = (row: NumberSeries | null) => {
    setEditing({ id: row?.id ?? null });
    form.setFieldsValue(row ?? EMPTY_SERIES);
  };

  const columns: ColumnsType<NumberSeries> = [
    { title: "Series", dataIndex: "name" },
    {
      title: "Used for",
      key: "purpose",
      render: (_, s) =>
        s.purpose === "Invoice" ? "Invoice (SI) numbers" : "Cycle reference",
    },
    {
      title: "Numbering",
      key: "mode",
      render: (_, s) =>
        s.mode === "Manual" ? (
          <Tag color="gold">Typed by staff</Tag>
        ) : (
          <code>{s.pattern}</code>
        ),
    },
    { title: "Next", dataIndex: "nextPreview" },
    {
      title: "",
      key: "status",
      render: (_, s) => (s.isActive ? null : <Tag>Off</Tag>),
    },
    {
      title: "",
      key: "actions",
      align: "right",
      render: (_, s) => (
        <PermissionGate permission={BILLING_PERMISSION.MANAGE}>
          <Button size="small" onClick={() => open(s)}>
            Edit
          </Button>
        </PermissionGate>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Text type="secondary">
          Invoice series number the invoices of an arrangement when they are
          approved. A reference series numbers billing cycles; a cycle keeps the
          same reference for every client billed for that period.
        </Text>
        <PermissionGate permission={BILLING_PERMISSION.MANAGE}>
          <Button icon={<PlusOutlined />} onClick={() => open(null)}>
            New series
          </Button>
        </PermissionGate>
      </div>
      <Table<NumberSeries>
        rowKey="id"
        size="small"
        loading={series.isLoading}
        dataSource={series.data ?? []}
        columns={columns}
        pagination={false}
        scroll={{ x: "max-content" }}
      />

      <Modal
        title={editing?.id ? "Edit numbering series" : "New numbering series"}
        open={!!editing}
        okText="Save"
        confirmLoading={save.isPending}
        onCancel={() => setEditing(undefined)}
        onOk={() => form.submit()}
        destroyOnHidden
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={async (values) => {
            await save.mutateAsync({
              id: editing?.id ?? null,
              request: values,
            });
            getNotify().success({ message: "Numbering series saved." });
            setEditing(undefined);
          }}
        >
          <Form.Item
            label="Name"
            name="name"
            rules={[{ required: true, message: "Required." }]}
          >
            <Input maxLength={100} placeholder="Sales invoice" />
          </Form.Item>
          <div className="grid grid-cols-2 gap-3">
            <Form.Item label="Used for" name="purpose">
              <Select
                options={[
                  { value: "Invoice", label: "Invoice (SI) numbers" },
                  { value: "Reference", label: "Cycle reference" },
                ]}
              />
            </Form.Item>
            <Form.Item label="Numbering" name="mode">
              <Select
                options={[
                  { value: "Auto", label: "Automatic" },
                  { value: "Manual", label: "Typed by staff (booklet)" },
                ]}
              />
            </Form.Item>
          </div>
          <Form.Item
            label="Pattern"
            name="pattern"
            rules={[{ required: true, message: "Required." }]}
            extra="{seq} is the running number ({seq:6} pads it to 6 digits); {yyyy}, {yy} and {MM} add the year and month. Example: SI-{yyyy}-{seq:6}."
          >
            <Input maxLength={40} />
          </Form.Item>
          <div className="grid grid-cols-2 gap-3">
            <Form.Item label="Next number" name="nextValue">
              <InputNumber className="w-full" min={1} />
            </Form.Item>
            <Form.Item
              label="Start again each year"
              name="resetYearly"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>
          </div>
          <Form.Item label="Active" name="isActive" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
