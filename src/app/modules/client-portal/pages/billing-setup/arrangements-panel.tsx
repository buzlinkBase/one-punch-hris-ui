import { useState } from "react";
import {
  Button,
  Card,
  DatePicker,
  Empty,
  Form,
  Input,
  InputNumber,
  Modal,
  Select,
  Switch,
  Table,
  Tag,
  Typography,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import dayjs, { type Dayjs } from "dayjs";
import { getNotify } from "@/shared/utils/notify";
import { PermissionGate } from "@/shared/components/permission-gate/permission-gate";
import {
  useAddArrangementRate,
  useArrangements,
  useBillingFormats,
  useClientPosts,
  useNumberSeries,
  useSaveArrangement,
} from "../../hooks/use-billing-format-queries";
import {
  BILLING_FORMAT_LABEL,
  BILLING_PERMISSION,
  PRICING_METHOD_LABEL,
  RATE_BASIS_OPTIONS,
  peso,
} from "../../constants/label.const";
import type {
  Arrangement,
  ArrangementGroup,
  ArrangementRate,
  ArrangementRequest,
  RateBasis,
} from "../../models/api/billing-format.model";
import type { PortalSite } from "../../models/api/response/client-portal-response.model";

const { Text } = Typography;
const DATE = "YYYY-MM-DD";

const BASIS_SUFFIX: Record<RateBasis, string> = {
  MonthlyPerHead: "/ month",
  DailyPerHead: "/ day",
  Hourly: "/ hour",
};

interface RateForm {
  headcount: number;
  basis: RateBasis;
  amount: number;
  agencyFeeMonthly?: number;
  displayRate?: number;
  effectiveFrom: Dayjs;
}

const rateText = (r: ArrangementRate) =>
  `${r.headcount} x ${peso(r.amount)} ${BASIS_SUFFIX[r.basis]}`;

interface ArrangementsPanelProps {
  clientId: string;
  sites: PortalSite[];
}

export function ArrangementsPanel({ clientId, sites }: ArrangementsPanelProps) {
  const arrangements = useArrangements(clientId);
  const [editing, setEditing] = useState<{ arrangement: Arrangement | null }>();
  const [rateFor, setRateFor] = useState<ArrangementGroup>();

  return (
    <Card
      title={BILLING_FORMAT_LABEL.ARRANGEMENTS_TITLE}
      loading={arrangements.isLoading}
      extra={
        <PermissionGate permission={BILLING_PERMISSION.MANAGE}>
          <Button
            size="small"
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setEditing({ arrangement: null })}
          >
            Add arrangement
          </Button>
        </PermissionGate>
      }
    >
      <Text type="secondary" className="mb-3 block">
        {BILLING_FORMAT_LABEL.ARRANGEMENTS_HELP}
      </Text>
      {(arrangements.data ?? []).length === 0 && (
        <Empty description="No billing arrangements yet." />
      )}
      <div className="flex flex-col gap-3">
        {(arrangements.data ?? []).map((a) => (
          <ArrangementCard
            key={a.id}
            arrangement={a}
            onEdit={() => setEditing({ arrangement: a })}
            onAddRate={setRateFor}
          />
        ))}
      </div>

      <ArrangementModal
        clientId={clientId}
        sites={sites}
        arrangement={editing?.arrangement ?? null}
        open={!!editing}
        onClose={() => setEditing(undefined)}
      />
      <RateModal group={rateFor} onClose={() => setRateFor(undefined)} />
    </Card>
  );
}

function ArrangementCard({
  arrangement: a,
  onEdit,
  onAddRate,
}: {
  arrangement: Arrangement;
  onEdit: () => void;
  onAddRate: (group: ArrangementGroup) => void;
}) {
  const columns: ColumnsType<ArrangementGroup> = [
    { title: "Code", dataIndex: "code", width: 80 },
    { title: "Billing line", dataIndex: "label" },
    {
      title: "Counts time logs of",
      key: "match",
      render: (_, g) =>
        [g.siteName, g.postName, g.shiftName && `shift "${g.shiftName}"`]
          .filter(Boolean)
          .join(" · ") || "Everything in the arrangement",
    },
    {
      title: "Current rate",
      key: "rate",
      render: (_, g) =>
        g.currentRate ? (
          <div>
            <div>{rateText(g.currentRate)}</div>
            <Text type="secondary" className="text-xs">
              from {g.currentRate.effectiveFrom}
              {g.currentRate.agencyFeeMonthly != null &&
                ` · fee ${peso(g.currentRate.agencyFeeMonthly)} / month`}
            </Text>
          </div>
        ) : (
          <Tag color="red">No rate</Tag>
        ),
    },
    {
      title: "",
      key: "actions",
      align: "right",
      render: (_, g) => (
        <PermissionGate permission={BILLING_PERMISSION.MANAGE}>
          <Button size="small" onClick={() => onAddRate(g)}>
            Add rate
          </Button>
        </PermissionGate>
      ),
    },
  ];

  const historyColumns: ColumnsType<ArrangementRate> = [
    { title: "From", dataIndex: "effectiveFrom", width: 120 },
    { title: "Rate", key: "rate", render: (_, r) => rateText(r) },
    {
      title: "Printed rate",
      key: "display",
      render: (_, r) => (r.displayRate != null ? peso(r.displayRate) : "—"),
    },
    { title: "Added by", dataIndex: "createdBy" },
  ];

  return (
    <div className="rounded-lg border border-solid border-gray-200 p-3">
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <Text strong className="text-base">
          {a.name}
        </Text>
        <Tag color="blue">{a.formatName}</Tag>
        <Tag>{PRICING_METHOD_LABEL[a.method] ?? a.method}</Tag>
        {!a.isActive && <Tag color="default">Off</Tag>}
        <Text type="secondary" className="mr-auto text-xs">
          {[
            a.siteName ?? "All sites",
            a.scopeLabel,
            a.numberSeriesName
              ? `numbered from ${a.numberSeriesName}`
              : "default invoice numbering",
          ]
            .filter(Boolean)
            .join(" · ")}
        </Text>
        <PermissionGate permission={BILLING_PERMISSION.MANAGE}>
          <Button size="small" onClick={onEdit}>
            Edit
          </Button>
        </PermissionGate>
      </div>
      <Table<ArrangementGroup>
        rowKey="id"
        size="small"
        pagination={false}
        dataSource={a.groups}
        columns={columns}
        scroll={{ x: "max-content" }}
        expandable={{
          rowExpandable: (g) => g.rates.length > 0,
          expandedRowRender: (g) => (
            <Table<ArrangementRate>
              rowKey="id"
              size="small"
              pagination={false}
              dataSource={g.rates}
              columns={historyColumns}
            />
          ),
        }}
      />
    </div>
  );
}

function ArrangementModal({
  clientId,
  sites,
  arrangement,
  open,
  onClose,
}: {
  clientId: string;
  sites: PortalSite[];
  arrangement: Arrangement | null;
  open: boolean;
  onClose: () => void;
}) {
  const formats = useBillingFormats();
  const series = useNumberSeries();
  const posts = useClientPosts(clientId);
  const save = useSaveArrangement();
  const [form] = Form.useForm<ArrangementRequest>();

  const initial: ArrangementRequest = arrangement
    ? {
        ...arrangement,
        groups: arrangement.groups.map((g) => ({
          id: g.id,
          code: g.code,
          label: g.label,
          siteId: g.siteId,
          postId: g.postId,
          shiftName: g.shiftName,
        })),
      }
    : {
        name: "",
        billingFormatId: "",
        siteId: null,
        scopeLabel: null,
        documentTitle: null,
        numberSeriesId: null,
        signatoryOverrides: [],
        sortOrder: 0,
        isActive: true,
        groups: [
          {
            id: null,
            code: "DS",
            label: "Day shift",
            siteId: null,
            postId: null,
            shiftName: null,
          },
        ],
      };

  const siteOptions = sites.map((s) => ({ value: s.id, label: s.name }));
  const formatOptions = (formats.data ?? [])
    .filter((f) => f.isActive || f.id === arrangement?.billingFormatId)
    .map((f) => ({ value: f.id, label: f.name }));
  const seriesOptions = (series.data ?? [])
    .filter((s) => s.purpose === "Invoice")
    .map((s) => ({
      value: s.id,
      label: `${s.name} (next ${s.nextPreview})`,
    }));
  const postOptions = (posts.data ?? []).map((p) => ({
    value: p.id,
    label: `${p.siteName} · ${p.name}`,
  }));

  return (
    <Modal
      title={arrangement ? `Edit ${arrangement.name}` : "Add arrangement"}
      open={open}
      okText="Save"
      width={860}
      confirmLoading={save.isPending}
      onCancel={onClose}
      onOk={() => form.submit()}
      destroyOnHidden
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={initial}
        preserve={false}
        onFinish={async (values) => {
          await save.mutateAsync({
            clientId,
            id: arrangement?.id ?? null,
            request: {
              ...values,
              siteId: values.siteId ?? null,
              scopeLabel: values.scopeLabel || null,
              documentTitle: values.documentTitle || null,
              numberSeriesId: values.numberSeriesId ?? null,
              signatoryOverrides: values.signatoryOverrides ?? [],
              groups: (values.groups ?? []).map((g) => ({
                ...g,
                id: g.id ?? null,
                siteId: g.siteId ?? null,
                postId: g.postId ?? null,
                shiftName: g.shiftName || null,
              })),
            },
          });
          getNotify().success({ message: "Arrangement saved." });
          onClose();
        }}
      >
        <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
          <Form.Item
            label="Name"
            name="name"
            rules={[{ required: true, message: "Required." }]}
          >
            <Input maxLength={100} placeholder="Regular posting" />
          </Form.Item>
          <Form.Item
            label="Billing format"
            name="billingFormatId"
            rules={[{ required: true, message: "Choose a format." }]}
          >
            <Select options={formatOptions} loading={formats.isLoading} />
          </Form.Item>
          <Form.Item
            label="Site"
            name="siteId"
            extra="Only time logs of this site count. Leave empty for every site."
          >
            <Select allowClear placeholder="All sites" options={siteOptions} />
          </Form.Item>
          <Form.Item
            label="Area label"
            name="scopeLabel"
            extra="Printed under the client's name, for example AGWA."
          >
            <Input maxLength={100} />
          </Form.Item>
          <Form.Item
            label="Heading"
            name="documentTitle"
            extra="Leave empty to use the format's heading."
          >
            <Input maxLength={120} />
          </Form.Item>
          <Form.Item
            label="Invoice numbering"
            name="numberSeriesId"
            extra="Leave empty for the default invoice numbers."
          >
            <Select
              allowClear
              placeholder="Default numbering"
              options={seriesOptions}
            />
          </Form.Item>
          <Form.Item label="Order" name="sortOrder">
            <InputNumber className="w-full" min={0} max={99} />
          </Form.Item>
          <Form.Item label="Active" name="isActive" valuePropName="checked">
            <Switch />
          </Form.Item>
        </div>

        <Text strong className="mb-1 block">
          Billing lines
        </Text>
        <Text type="secondary" className="mb-2 block text-xs">
          Each line is one row of the billing summary. A time log goes to the
          first line it matches; empty filters match everything.
        </Text>
        <Form.List name="groups">
          {(fields, { add, remove }) => (
            <div className="mb-4 flex flex-col gap-2">
              {fields.map((field) => (
                <div
                  key={field.key}
                  className="grid grid-cols-2 gap-x-2 rounded-lg border border-solid border-gray-200 p-2 sm:grid-cols-6"
                >
                  <Form.Item name={[field.name, "id"]} hidden>
                    <Input />
                  </Form.Item>
                  <Form.Item
                    name={[field.name, "code"]}
                    label="Code"
                    className="mb-1"
                    rules={[{ required: true, message: "Required." }]}
                  >
                    <Input maxLength={20} placeholder="DS" />
                  </Form.Item>
                  <Form.Item
                    name={[field.name, "label"]}
                    label="Label"
                    className="mb-1 sm:col-span-2"
                    rules={[{ required: true, message: "Required." }]}
                  >
                    <Input maxLength={120} placeholder="Day Shift - 12 hrs" />
                  </Form.Item>
                  <Form.Item
                    name={[field.name, "shiftName"]}
                    label="Shift"
                    className="mb-1"
                  >
                    <Input maxLength={60} placeholder="Any" />
                  </Form.Item>
                  <Form.Item
                    name={[field.name, "siteId"]}
                    label="Site"
                    className="mb-1"
                  >
                    <Select
                      allowClear
                      placeholder="Any"
                      options={siteOptions}
                    />
                  </Form.Item>
                  <div className="flex items-end gap-1">
                    <Form.Item
                      name={[field.name, "postId"]}
                      label="Post"
                      className="mb-1 flex-1"
                    >
                      <Select
                        allowClear
                        placeholder="Any"
                        options={postOptions}
                      />
                    </Form.Item>
                    <Button
                      danger
                      className="mb-1"
                      icon={<DeleteOutlined />}
                      onClick={() => remove(field.name)}
                    />
                  </div>
                </div>
              ))}
              <Button
                icon={<PlusOutlined />}
                onClick={() =>
                  add({
                    id: null,
                    code: "",
                    label: "",
                    siteId: null,
                    postId: null,
                    shiftName: null,
                  })
                }
              >
                Add billing line
              </Button>
            </div>
          )}
        </Form.List>

        <Text strong className="mb-1 block">
          Client signers
        </Text>
        <Text type="secondary" className="mb-2 block text-xs">
          Names for the format's signature slots on this client's packets,
          matched by the slot's label (for example Checked & approved by).
        </Text>
        <Form.List name="signatoryOverrides">
          {(fields, { add, remove }) => (
            <div className="flex flex-col gap-2">
              {fields.map((field) => (
                <div
                  key={field.key}
                  className="grid grid-cols-1 gap-x-2 sm:grid-cols-4"
                >
                  <Form.Item
                    name={[field.name, "label"]}
                    className="mb-1"
                    rules={[{ required: true, message: "Required." }]}
                  >
                    <Input placeholder="Slot label" maxLength={60} />
                  </Form.Item>
                  <Form.Item name={[field.name, "name"]} className="mb-1">
                    <Input placeholder="Name" maxLength={120} />
                  </Form.Item>
                  <Form.Item name={[field.name, "title"]} className="mb-1">
                    <Input placeholder="Position" maxLength={120} />
                  </Form.Item>
                  <div className="flex gap-1">
                    <Form.Item
                      name={[field.name, "organization"]}
                      className="mb-1 flex-1"
                    >
                      <Input placeholder="Company" maxLength={200} />
                    </Form.Item>
                    <Button
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => remove(field.name)}
                    />
                  </div>
                </div>
              ))}
              <Button
                icon={<PlusOutlined />}
                onClick={() =>
                  add({
                    label: "",
                    name: null,
                    title: null,
                    organization: null,
                  })
                }
              >
                Add signer
              </Button>
            </div>
          )}
        </Form.List>
      </Form>
    </Modal>
  );
}

function RateModal({
  group,
  onClose,
}: {
  group: ArrangementGroup | undefined;
  onClose: () => void;
}) {
  const addRate = useAddArrangementRate();
  const [form] = Form.useForm<RateForm>();
  const current = group?.currentRate;

  return (
    <Modal
      title={group ? `New rate: ${group.label}` : "New rate"}
      open={!!group}
      okText="Add rate"
      confirmLoading={addRate.isPending}
      onCancel={onClose}
      onOk={() => form.submit()}
      destroyOnHidden
    >
      <Text type="secondary" className="mb-3 block">
        A new rate replaces the current one from its start date. Periods before
        it keep the rate they had.
      </Text>
      <Form
        form={form}
        layout="vertical"
        preserve={false}
        initialValues={{
          headcount: current?.headcount ?? 1,
          basis: current?.basis ?? "MonthlyPerHead",
          amount: current?.amount,
          agencyFeeMonthly: current?.agencyFeeMonthly ?? undefined,
          displayRate: current?.displayRate ?? undefined,
          effectiveFrom: dayjs(),
        }}
        onFinish={async (values) => {
          if (!group) return;
          await addRate.mutateAsync({
            groupId: group.id,
            request: {
              headcount: values.headcount,
              basis: values.basis,
              amount: values.amount,
              agencyFeeMonthly: values.agencyFeeMonthly ?? null,
              displayRate: values.displayRate ?? null,
              effectiveFrom: values.effectiveFrom.format(DATE),
            },
          });
          getNotify().success({ message: "Rate added." });
          onClose();
        }}
      >
        <div className="grid grid-cols-2 gap-3">
          <Form.Item
            label="Contracted headcount"
            name="headcount"
            rules={[{ required: true, message: "Required." }]}
          >
            <InputNumber className="w-full" min={0} precision={2} />
          </Form.Item>
          <Form.Item label="Rate is" name="basis">
            <Select options={RATE_BASIS_OPTIONS} />
          </Form.Item>
          <Form.Item
            label="Amount"
            name="amount"
            className="col-span-2"
            rules={[
              {
                required: true,
                type: "number",
                min: 0.01,
                message: "Required.",
              },
            ]}
            extra="The personnel amount; or the all-in amount when the format's rates include the fee and VAT."
          >
            <InputNumber className="w-full" min={0} precision={4} />
          </Form.Item>
          <Form.Item
            label="Fixed agency fee / month"
            name="agencyFeeMonthly"
            extra="Only for formats that bill a fixed fee."
          >
            <InputNumber className="w-full" min={0} precision={2} />
          </Form.Item>
          <Form.Item
            label="Printed contract rate"
            name="displayRate"
            extra="The all-in rate shown on the packet, if different."
          >
            <InputNumber className="w-full" min={0} precision={2} />
          </Form.Item>
        </div>
        <Form.Item
          label="Effective from"
          name="effectiveFrom"
          rules={[{ required: true, message: "Required." }]}
        >
          <DatePicker className="w-full" />
        </Form.Item>
      </Form>
    </Modal>
  );
}
