import { useEffect, useState } from "react";
import {
  Button,
  Card,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Modal,
  Select,
  Switch,
  Table,
  Typography,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { PlusOutlined } from "@ant-design/icons";
import dayjs, { type Dayjs } from "dayjs";
import { getNotify } from "@/shared/utils/notify";
import { PermissionGate } from "@/shared/components/permission-gate/permission-gate";
import {
  useAddContractRate,
  useBillingProfile,
  useContractRates,
  usePortalClients,
  usePortalSites,
  useSaveBillingProfile,
} from "../../hooks/use-client-portal-queries";
import {
  BILLING_LABEL,
  BILLING_PERMISSION,
  RATE_UNIT_OPTIONS,
  peso,
} from "../../constants/label.const";
import type {
  BillingProfile,
  ContractRate,
} from "../../models/api/response/client-portal-response.model";

const { Title, Text } = Typography;
const DATE = "YYYY-MM-DD";

/** Percentages are typed as whole numbers (12) and stored as fractions (0.12). */
const toPercent = (fraction: number) => Math.round(fraction * 10_000) / 100;
const toFraction = (percent: number) => Math.round(percent * 100) / 10_000;

interface ProfileForm extends Omit<
  BillingProfile,
  "vatRate" | "withholdingRate" | "nightDiffPremium" | "holidayPremium"
> {
  vatPercent: number;
  withholdingPercent: number;
  nightDiffPercent: number;
  holidayPercent: number;
}

interface RateForm {
  siteId?: string;
  shiftName?: string;
  unit: "PerHour" | "PerDay" | "PerMonth";
  amount: number;
  hoursPerDay: number;
  daysPerMonth: number;
  effectiveFrom: Dayjs;
}

export default function BillingSetup() {
  const clients = usePortalClients();
  const [clientId, setClientId] = useState<string | undefined>();
  const profile = useBillingProfile(clientId);
  const rates = useContractRates(clientId);
  const save = useSaveBillingProfile();
  const addRate = useAddContractRate();
  const sites = usePortalSites(clientId).data ?? [];
  const [rateOpen, setRateOpen] = useState(false);
  const [profileForm] = Form.useForm<ProfileForm>();
  const [rateForm] = Form.useForm<RateForm>();

  useEffect(() => {
    const p = profile.data;
    if (!p) return;
    profileForm.setFieldsValue({
      ...p,
      vatPercent: toPercent(p.vatRate),
      withholdingPercent: toPercent(p.withholdingRate),
      nightDiffPercent: toPercent(p.nightDiffPremium),
      holidayPercent: toPercent(p.holidayPremium),
    });
  }, [profile.data, profileForm]);

  const onSave = async (values: ProfileForm) => {
    if (!clientId) return;
    const {
      vatPercent,
      withholdingPercent,
      nightDiffPercent,
      holidayPercent,
      ...rest
    } = values;
    await save.mutateAsync({
      clientId,
      profile: {
        ...rest,
        clientId,
        vatRate: toFraction(vatPercent),
        withholdingRate: toFraction(withholdingPercent),
        nightDiffPremium: toFraction(nightDiffPercent),
        holidayPremium: toFraction(holidayPercent),
      },
    });
    getNotify().success({ message: "Billing details saved." });
  };

  const onAddRate = async (values: RateForm) => {
    if (!clientId) return;
    await addRate.mutateAsync({
      clientId,
      request: {
        siteId: values.siteId ?? null,
        shiftName: values.shiftName?.trim() || null,
        unit: values.unit,
        amount: values.amount,
        hoursPerDay: values.hoursPerDay,
        daysPerMonth: values.daysPerMonth,
        effectiveFrom: values.effectiveFrom.format(DATE),
      },
    });
    getNotify().success({ message: "Rate added." });
    setRateOpen(false);
    rateForm.resetFields();
  };

  const rateColumns: ColumnsType<ContractRate> = [
    { title: "From", dataIndex: "effectiveFrom", width: 120 },
    {
      title: "Applies to",
      key: "scope",
      render: (_, r) =>
        `${r.siteName ?? "All sites"} · ${r.shiftName ?? "all shifts"}`,
    },
    {
      title: "Rate",
      key: "rate",
      render: (_, r) =>
        `${peso(r.amount)} ${r.unit === "PerHour" ? "/ hour" : r.unit === "PerDay" ? "/ day" : "/ month"}`,
    },
    {
      title: "Hourly equivalent",
      key: "hourly",
      align: "right",
      render: (_, r) => peso(r.hourlyEquivalent),
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div>
        <Title level={3} className="m-0!">
          {BILLING_LABEL.SETUP_TITLE}
        </Title>
        <Text type="secondary">{BILLING_LABEL.SETUP_SUBTITLE}</Text>
      </div>

      <Select
        showSearch
        optionFilterProp="label"
        placeholder="Choose a client"
        className="max-w-sm"
        value={clientId}
        loading={clients.isLoading}
        options={(clients.data ?? []).map((c) => ({
          value: c.id,
          label: `${c.name} (${c.code})`,
        }))}
        onChange={setClientId}
      />

      {clientId && (
        <>
          <Card title="Billing details and terms" loading={profile.isLoading}>
            <Form
              form={profileForm}
              layout="vertical"
              onFinish={onSave}
              disabled={save.isPending}
            >
              <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
                <Form.Item
                  label="Registered name"
                  name="legalName"
                  rules={[{ required: true, message: "Required." }]}
                >
                  <Input />
                </Form.Item>
                <Form.Item label="TIN" name="tin">
                  <Input />
                </Form.Item>
                <Form.Item
                  label="Address"
                  name="address"
                  className="sm:col-span-2"
                >
                  <Input />
                </Form.Item>
                <Form.Item
                  label="Billing email addresses"
                  name="billingEmails"
                  extra="Separate several with commas."
                  className="sm:col-span-2"
                >
                  <Input />
                </Form.Item>
                <Form.Item label="Days to pay" name="paymentTermsDays">
                  <InputNumber className="w-full" min={0} max={365} />
                </Form.Item>
                <Form.Item label="Billing cycle" name="cycle">
                  <Select
                    options={[
                      { value: "Monthly", label: "Monthly" },
                      { value: "SemiMonthly", label: "Twice a month" },
                    ]}
                  />
                </Form.Item>
                <Form.Item label="VAT %" name="vatPercent">
                  <InputNumber className="w-full" min={0} max={50} />
                </Form.Item>
                <Form.Item
                  label="Expected withholding %"
                  name="withholdingPercent"
                  extra="For example 2 for 2% expanded withholding tax."
                >
                  <InputNumber className="w-full" min={0} max={50} />
                </Form.Item>
                <Form.Item
                  label="Overtime multiplier"
                  name="overtimeMultiplier"
                  extra="1.25 bills overtime at 125% of the hourly rate."
                >
                  <InputNumber className="w-full" min={1} max={5} step={0.05} />
                </Form.Item>
                <Form.Item
                  label="Night differential %"
                  name="nightDiffPercent"
                  extra="Added on top of the hourly rate for night hours."
                >
                  <InputNumber className="w-full" min={0} max={200} />
                </Form.Item>
                <Form.Item
                  label="Holiday premium %"
                  name="holidayPercent"
                  extra="100 bills holiday hours at double rate."
                >
                  <InputNumber className="w-full" min={0} max={500} />
                </Form.Item>
                <Form.Item label="New invoices are" name="defaultDelivery">
                  <Select
                    options={[
                      { value: "Email", label: "Emailed to the client" },
                      {
                        value: "RecordOnly",
                        label: "Kept as a billing record only",
                      },
                    ]}
                  />
                </Form.Item>
                <Form.Item
                  label="Payment instructions"
                  name="paymentInstructions"
                  className="sm:col-span-2"
                >
                  <Input.TextArea rows={3} maxLength={2000} />
                </Form.Item>
              </div>
              <div className="mb-4 flex flex-col gap-2">
                <Form.Item
                  noStyle
                  name="showInPortalByDefault"
                  valuePropName="checked"
                >
                  <Switch checkedChildren="On" unCheckedChildren="Off" />
                </Form.Item>
                <Text type="secondary" className="-mt-1">
                  Show new invoices in the client portal
                </Text>
                <Form.Item
                  noStyle
                  name="attachDtrSummary"
                  valuePropName="checked"
                >
                  <Switch checkedChildren="On" unCheckedChildren="Off" />
                </Form.Item>
                <Text type="secondary" className="-mt-1">
                  Attach the time-log summary to every invoice
                </Text>
                <Form.Item
                  noStyle
                  name="requireClientSignOff"
                  valuePropName="checked"
                >
                  <Switch checkedChildren="On" unCheckedChildren="Off" />
                </Form.Item>
                <Text type="secondary" className="-mt-1">
                  Bill only time logs the client has signed off
                </Text>
              </div>
              <PermissionGate permission={BILLING_PERMISSION.MANAGE}>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={save.isPending}
                >
                  Save
                </Button>
              </PermissionGate>
            </Form>
          </Card>

          <Card
            title="Contract rates"
            extra={
              <PermissionGate permission={BILLING_PERMISSION.MANAGE}>
                <Button
                  size="small"
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => setRateOpen(true)}
                >
                  Add rate
                </Button>
              </PermissionGate>
            }
          >
            <Text type="secondary" className="mb-3 block">
              A new rate replaces the old one from its start date. Earlier
              periods are still billed at the rate that applied then. A rate for
              one site and shift wins over a rate for the site, then the shift,
              then the whole client.
            </Text>
            <Table<ContractRate>
              rowKey="id"
              size="small"
              loading={rates.isLoading}
              dataSource={rates.data ?? []}
              columns={rateColumns}
              pagination={false}
              scroll={{ x: "max-content" }}
            />
          </Card>
        </>
      )}

      <Modal
        title="Add a contract rate"
        open={rateOpen}
        okText="Add rate"
        confirmLoading={addRate.isPending}
        onCancel={() => setRateOpen(false)}
        onOk={() => rateForm.submit()}
        destroyOnHidden
      >
        <Form
          form={rateForm}
          layout="vertical"
          onFinish={onAddRate}
          initialValues={{
            unit: "PerDay",
            hoursPerDay: 12,
            daysPerMonth: 26,
            effectiveFrom: dayjs(),
          }}
        >
          <Form.Item
            label="Site"
            name="siteId"
            extra="Leave empty for every site."
          >
            <Select
              allowClear
              placeholder="All sites"
              options={sites.map((s) => ({ value: s.id, label: s.name }))}
            />
          </Form.Item>
          <Form.Item
            label="Shift"
            name="shiftName"
            extra="The shift name as it appears on time logs. Leave empty for every shift."
          >
            <Input maxLength={60} />
          </Form.Item>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Form.Item label="Rate is" name="unit">
              <Select options={RATE_UNIT_OPTIONS} />
            </Form.Item>
            <Form.Item
              label="Amount"
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
            <Form.Item label="Hours in a shift" name="hoursPerDay">
              <InputNumber className="w-full" min={1} max={24} />
            </Form.Item>
            <Form.Item label="Days in a month" name="daysPerMonth">
              <InputNumber className="w-full" min={1} max={31} />
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
    </div>
  );
}
