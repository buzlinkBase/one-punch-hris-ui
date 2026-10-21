import { useEffect } from "react";
import {
  Alert,
  Button,
  Drawer,
  Form,
  Input,
  InputNumber,
  Select,
  Space,
  Switch,
  Tabs,
  Typography,
  type FormInstance,
} from "antd";
import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  DeleteOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { authStorage } from "@/core/auth/auth-storage";
import { useAuthUser } from "@/core/auth/use-auth-user";
import { getNotify } from "@/shared/utils/notify";
import {
  useBillingFormat,
  useFormatCatalog,
  useUpdateFormat,
} from "../../hooks/use-billing-format-queries";
import {
  AGENCY_FEE_MODE_OPTIONS,
  BILLING_FORMAT_LABEL,
  BILLING_PERMISSION,
  PRICING_METHOD_OPTIONS,
  ROUNDING_OPTIONS,
  TAX_BASE_OPTIONS,
} from "../../constants/label.const";
import type {
  BillingFormatRequest,
  SectionType,
} from "../../models/api/billing-format.model";

const { Text } = Typography;

/** Rates are typed as percentages (17) and stored as fractions (0.17). */
const toPercent = (fraction: number) => Math.round(fraction * 10_000) / 100;
const toFraction = (percent: number) => Math.round(percent * 100) / 10_000;

interface EditorForm extends Omit<
  BillingFormatRequest,
  | "agencyFeeRate"
  | "vatRate"
  | "withholdingRate"
  | "nightDiffRate"
  | "terminology"
> {
  agencyFeePercent: number;
  vatPercent: number;
  withholdingPercent: number;
  nightDiffPercent: number;
  terms: { word: string; replacement: string }[];
}

interface FormatEditorProps {
  formatId: string | undefined;
  onClose: () => void;
}

export function FormatEditor({ formatId, onClose }: FormatEditorProps) {
  const format = useBillingFormat(formatId);
  const catalog = useFormatCatalog();
  const update = useUpdateFormat();
  const [form] = Form.useForm<EditorForm>();
  const sectionTypes = catalog.data?.sections ?? [];
  useAuthUser(); // re-render when the session's permissions change
  const isBuiltIn = !!format.data?.isBuiltIn;
  const readOnly =
    isBuiltIn || !authStorage.hasAnyPermission(BILLING_PERMISSION.MANAGE);

  useEffect(() => {
    const f = format.data;
    if (!f) return;
    form.setFieldsValue({
      ...f,
      agencyFeePercent: toPercent(f.agencyFeeRate),
      vatPercent: toPercent(f.vatRate),
      withholdingPercent: toPercent(f.withholdingRate),
      nightDiffPercent: toPercent(f.nightDiffRate),
      terms: Object.entries(f.terminology).map(([word, replacement]) => ({
        word,
        replacement,
      })),
    });
  }, [format.data, form]);

  const onSave = async (values: EditorForm) => {
    if (!formatId || readOnly) return;
    const {
      agencyFeePercent,
      vatPercent,
      withholdingPercent,
      nightDiffPercent,
      terms,
      ...rest
    } = values;
    await update.mutateAsync({
      id: formatId,
      request: {
        ...rest,
        description: rest.description || null,
        agencyFeeRate: toFraction(agencyFeePercent ?? 0),
        vatRate: toFraction(vatPercent ?? 0),
        withholdingRate: toFraction(withholdingPercent ?? 0),
        nightDiffRate: toFraction(nightDiffPercent ?? 0),
        sections: (rest.sections ?? []).map((s) => ({
          ...s,
          title: s.title || null,
          columns: s.columns?.length ? s.columns : null,
          fillerRows: s.fillerRows ?? 0,
          options: s.options ?? null,
        })),
        signatories: (rest.signatories ?? []).map((s) => ({
          ...s,
          name: s.name || null,
          title: s.title || null,
          organization: s.organization || null,
          sections: s.sections?.length ? s.sections : null,
        })),
        terminology: Object.fromEntries(
          (terms ?? [])
            .filter((t) => t.word?.trim() && t.replacement?.trim())
            .map((t) => [t.word.trim(), t.replacement.trim()]),
        ),
      },
    });
    getNotify().success({ message: "Billing format saved." });
    onClose();
  };

  return (
    <Drawer
      title={
        format.data
          ? `${readOnly ? "View" : "Edit"} format: ${format.data.name}`
          : "Billing format"
      }
      open={!!formatId}
      onClose={onClose}
      width="min(880px, 100vw)"
      loading={format.isLoading || catalog.isLoading}
      destroyOnHidden
      extra={
        !readOnly && (
          <Button
            type="primary"
            loading={update.isPending}
            onClick={() => form.submit()}
          >
            Save
          </Button>
        )
      }
    >
      {isBuiltIn && (
        <Alert
          type="info"
          showIcon
          className="mb-4"
          message={BILLING_FORMAT_LABEL.BUILT_IN_READ_ONLY}
        />
      )}
      <Form form={form} layout="vertical" disabled={readOnly} onFinish={onSave}>
        {/* Every tab is rendered up front: a field only counts in the saved values once it is mounted. */}
        <Tabs
          items={[
            { key: "general", label: "General", children: <GeneralTab /> },
            { key: "pricing", label: "Pricing", children: <PricingTab /> },
            { key: "fees", label: "Fees & taxes", children: <FeesTab /> },
            {
              key: "sections",
              label: "Sections",
              children: <SectionsTab form={form} sectionTypes={sectionTypes} />,
            },
            {
              key: "signatures",
              label: "Signatures",
              children: <SignaturesTab sectionTypes={sectionTypes} />,
            },
            { key: "terms", label: "Wording", children: <TermsTab /> },
          ].map((item) => ({ ...item, forceRender: true }))}
        />
      </Form>
    </Drawer>
  );
}

function GeneralTab() {
  return (
    <>
      <Form.Item
        label="Name"
        name="name"
        rules={[{ required: true, message: "Required." }]}
      >
        <Input maxLength={100} />
      </Form.Item>
      <Form.Item label="Description" name="description">
        <Input.TextArea rows={3} maxLength={1000} />
      </Form.Item>
      <Form.Item
        label="Heading on the billing summary"
        name="title"
        rules={[{ required: true, message: "Required." }]}
        extra="For example BILLING STATEMENT or STATEMENT OF ACCOUNT. An arrangement can print its own heading."
      >
        <Input maxLength={120} />
      </Form.Item>
    </>
  );
}

function PricingTab() {
  return (
    <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
      <Form.Item label="Pricing method" name="method" className="sm:col-span-2">
        <Select options={PRICING_METHOD_OPTIONS} />
      </Form.Item>
      <Form.Item
        label="Rates include the agency fee and VAT"
        name="inclusive"
        valuePropName="checked"
        extra="On when the contract rate is all-in and the personnel amount is taken out of it."
        className="sm:col-span-2"
      >
        <Switch />
      </Form.Item>
      <Form.Item label="Cutoffs per month" name="cutoffsPerMonth">
        <InputNumber className="w-full" min={1} max={4} />
      </Form.Item>
      <Form.Item label="Days per month" name="daysPerMonth">
        <InputNumber className="w-full" min={1} max={31} />
      </Form.Item>
      <Form.Item label="Hours per shift" name="hoursPerDay">
        <InputNumber className="w-full" min={1} max={24} />
      </Form.Item>
      <Form.Item
        label="Regular hours per shift"
        name="regularHoursPerDay"
        extra="The rest of the shift counts as overtime (8 + 4 on a 12-hour post)."
      >
        <InputNumber className="w-full" min={0} max={24} />
      </Form.Item>
      <Form.Item
        label="Overtime multiplier"
        name="overtimeMultiplier"
        extra="1 bills overtime at the hourly rate; 1.25 at 125%."
      >
        <InputNumber className="w-full" min={0} max={5} step={0.05} />
      </Form.Item>
      <Form.Item label="Holiday multiplier" name="holidayMultiplier">
        <InputNumber className="w-full" min={0} max={5} step={0.05} />
      </Form.Item>
      <Form.Item label="Night differential %" name="nightDiffPercent">
        <InputNumber className="w-full" min={0} max={200} />
      </Form.Item>
    </div>
  );
}

function FeesTab() {
  const feeMode = Form.useWatch("agencyFeeMode");
  return (
    <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
      <Form.Item label="Agency fee" name="agencyFeeMode">
        <Select options={AGENCY_FEE_MODE_OPTIONS} />
      </Form.Item>
      <Form.Item
        label="Agency fee %"
        name="agencyFeePercent"
        extra={
          feeMode === "FixedPerHeadMonthly"
            ? "The fixed fee is set on each billing line's rate."
            : undefined
        }
      >
        <InputNumber
          className="w-full"
          min={0}
          max={100}
          disabled={feeMode !== "PercentOfBase"}
        />
      </Form.Item>
      <Form.Item label="VAT is charged on" name="vatBase">
        <Select options={TAX_BASE_OPTIONS} />
      </Form.Item>
      <Form.Item label="VAT %" name="vatPercent">
        <InputNumber className="w-full" min={0} max={50} />
      </Form.Item>
      <Form.Item label="Withholding is taken from" name="withholdingBase">
        <Select options={TAX_BASE_OPTIONS} />
      </Form.Item>
      <Form.Item label="Withholding %" name="withholdingPercent">
        <InputNumber className="w-full" min={0} max={50} />
      </Form.Item>
      <Form.Item
        label="Rounding"
        name="rounding"
        className="sm:col-span-2"
        extra="Match the client's own spreadsheet, so totals agree to the centavo."
      >
        <Select options={ROUNDING_OPTIONS} />
      </Form.Item>
    </div>
  );
}

function SectionsTab({
  form,
  sectionTypes,
}: {
  form: FormInstance<EditorForm>;
  sectionTypes: SectionType[];
}) {
  return (
    <Form.List name="sections">
      {(fields, { add, remove, move }) => (
        <div className="flex flex-col gap-3">
          <Text type="secondary">
            The billing packet prints these sections in this order.
          </Text>
          {fields.map((field, index) => (
            <SectionItem
              key={field.key}
              form={form}
              name={field.name}
              sectionTypes={sectionTypes}
              onUp={index > 0 ? () => move(index, index - 1) : undefined}
              onDown={
                index < fields.length - 1
                  ? () => move(index, index + 1)
                  : undefined
              }
              onRemove={() => remove(field.name)}
            />
          ))}
          <Button
            icon={<PlusOutlined />}
            onClick={() =>
              add({
                type: "statement-of-account",
                title: null,
                columns: null,
                fillerRows: 0,
                landscape: false,
                clientVisible: true,
                options: null,
              })
            }
          >
            Add section
          </Button>
        </div>
      )}
    </Form.List>
  );
}

function SectionItem({
  form,
  name,
  sectionTypes,
  onUp,
  onDown,
  onRemove,
}: {
  form: FormInstance<EditorForm>;
  name: number;
  sectionTypes: SectionType[];
  onUp?: () => void;
  onDown?: () => void;
  onRemove: () => void;
}) {
  const typeKey = Form.useWatch(["sections", name, "type"], form);
  const type = sectionTypes.find((t) => t.key === typeKey);
  return (
    <div className="rounded-lg border border-solid border-gray-200 p-3">
      <div className="flex flex-wrap items-start gap-2">
        <Form.Item
          name={[name, "type"]}
          label="Section"
          className="mb-2 min-w-60 flex-1"
        >
          <Select
            options={sectionTypes.map((t) => ({
              value: t.key,
              label: t.name,
            }))}
            onChange={() =>
              form.setFieldValue(["sections", name, "columns"], null)
            }
          />
        </Form.Item>
        <Form.Item
          name={[name, "title"]}
          label="Printed title"
          className="mb-2 min-w-60 flex-1"
        >
          <Input placeholder="Default title" maxLength={120} />
        </Form.Item>
        <Space className="mt-7">
          <Button
            size="small"
            icon={<ArrowUpOutlined />}
            disabled={!onUp}
            onClick={onUp}
          />
          <Button
            size="small"
            icon={<ArrowDownOutlined />}
            disabled={!onDown}
            onClick={onDown}
          />
          <Button
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={onRemove}
          />
        </Space>
      </div>
      {type && (
        <Text type="secondary" className="mb-2 block text-xs">
          {type.description}
        </Text>
      )}
      {type && type.columns.length > 0 && (
        <Form.Item
          name={[name, "columns"]}
          label="Columns, in order"
          className="mb-2"
          extra="Leave empty for the default columns."
        >
          <Select
            mode="multiple"
            placeholder={type.defaultColumns
              .map((k) => type.columns.find((c) => c.key === k)?.label ?? k)
              .join(", ")}
            options={type.columns.map((c) => ({
              value: c.key,
              label: c.label,
            }))}
          />
        </Form.Item>
      )}
      <div className="flex flex-wrap items-center gap-4">
        <Form.Item
          name={[name, "fillerRows"]}
          label="Empty rows"
          className="mb-0"
        >
          <InputNumber min={0} max={60} />
        </Form.Item>
        <Form.Item
          name={[name, "landscape"]}
          label="Landscape"
          valuePropName="checked"
          className="mb-0"
        >
          <Switch />
        </Form.Item>
        <Form.Item
          name={[name, "clientVisible"]}
          label="Client sees it"
          valuePropName="checked"
          className="mb-0"
        >
          <Switch />
        </Form.Item>
        {type?.options.map((o) => (
          <Form.Item
            key={o.key}
            name={[name, "options", o.key]}
            label={o.label}
            className="mb-0"
            getValueProps={(value: string | undefined) => ({
              checked: (value ?? o.default) === "true",
            })}
            normalize={(checked: boolean) => (checked ? "true" : "false")}
          >
            <Switch />
          </Form.Item>
        ))}
      </div>
    </div>
  );
}

function SignaturesTab({ sectionTypes }: { sectionTypes: SectionType[] }) {
  const sectionOptions = sectionTypes
    .filter((t) => t.hasSignatures)
    .map((t) => ({ value: t.key, label: t.name }));
  return (
    <Form.List name="signatories">
      {(fields, { add, remove }) => (
        <div className="flex flex-col gap-3">
          <Text type="secondary">
            Signature slots printed on the sections that carry signatures. The
            preparer and approver can be filled in from the invoice itself; each
            client arrangement can name its own signers.
          </Text>
          {fields.map((field) => (
            <div
              key={field.key}
              className="grid grid-cols-1 gap-x-3 rounded-lg border border-solid border-gray-200 p-3 sm:grid-cols-3"
            >
              <Form.Item
                name={[field.name, "label"]}
                label="Label"
                rules={[{ required: true, message: "Required." }]}
              >
                <Input placeholder="Prepared by" maxLength={60} />
              </Form.Item>
              <Form.Item name={[field.name, "side"]} label="Signer">
                <Select
                  options={[
                    { value: "Agency", label: "Agency" },
                    { value: "Client", label: "Client" },
                  ]}
                />
              </Form.Item>
              <Form.Item name={[field.name, "workflowRole"]} label="Name from">
                <Select
                  options={[
                    { value: "None", label: "Typed below" },
                    { value: "Preparer", label: "Who prepared the invoice" },
                    { value: "Approver", label: "Who approved the invoice" },
                  ]}
                />
              </Form.Item>
              <Form.Item name={[field.name, "name"]} label="Name">
                <Input maxLength={120} />
              </Form.Item>
              <Form.Item name={[field.name, "title"]} label="Position">
                <Input maxLength={120} />
              </Form.Item>
              <Form.Item name={[field.name, "organization"]} label="Company">
                <Input maxLength={200} placeholder="Agency or client name" />
              </Form.Item>
              <Form.Item
                name={[field.name, "sections"]}
                label="Prints on"
                className="sm:col-span-2"
              >
                <Select
                  mode="multiple"
                  placeholder="Every section with signatures"
                  options={sectionOptions}
                />
              </Form.Item>
              <div className="flex items-center justify-end">
                <Button
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => remove(field.name)}
                >
                  Remove
                </Button>
              </div>
            </div>
          ))}
          <Button
            icon={<PlusOutlined />}
            onClick={() =>
              add({
                label: "",
                side: "Agency",
                workflowRole: "None",
                name: null,
                title: null,
                organization: null,
                sections: null,
              })
            }
          >
            Add signature slot
          </Button>
        </div>
      )}
    </Form.List>
  );
}

function TermsTab() {
  return (
    <Form.List name="terms">
      {(fields, { add, remove }) => (
        <div className="flex flex-col gap-2">
          <Text type="secondary">
            Words printed on the packet, renamed for this kind of client: for
            example guards → personnel, or SG → staff.
          </Text>
          {fields.map((field) => (
            <div key={field.key} className="flex items-start gap-2">
              <Form.Item name={[field.name, "word"]} className="mb-0 flex-1">
                <Input placeholder="guards" maxLength={40} />
              </Form.Item>
              <Form.Item
                name={[field.name, "replacement"]}
                className="mb-0 flex-1"
              >
                <Input placeholder="personnel" maxLength={60} />
              </Form.Item>
              <Button
                danger
                icon={<DeleteOutlined />}
                onClick={() => remove(field.name)}
              />
            </div>
          ))}
          <Button icon={<PlusOutlined />} onClick={() => add()}>
            Add word
          </Button>
        </div>
      )}
    </Form.List>
  );
}
