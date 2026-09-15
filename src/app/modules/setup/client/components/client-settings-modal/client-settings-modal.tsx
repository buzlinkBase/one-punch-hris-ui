import { useEffect, useMemo, useState } from "react";
import {
  Modal,
  Form,
  Select,
  Spin,
  Tabs,
  InputNumber,
  Typography,
  Button,
  Space,
  Alert,
} from "antd";
import { CloseCircleOutlined } from "@ant-design/icons";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  clientPolicyFormSchema,
  type ClientPolicyFormValues,
} from "../../models/forms/client-policy-form.schema";
import {
  useClientPolicy,
  useUpdateClientPolicy,
} from "../../hooks/use-client-policy-queries";
import {
  useClientRates,
  useBulkReplaceClientRates,
} from "../../hooks/use-client-rate-queries";
import { useClient, useUpdateClient } from "../../hooks/use-client-queries";
import { usePayrollRates } from "@/app/modules/setup/payroll-rate/hooks/use-payroll-rate-queries";
import {
  BASE_RATE_DEFAULTS,
  BASE_RATE_KEYS,
  OT_OVERRIDE_RATE_KEYS,
  RATE_TYPE_LABEL,
} from "@/app/modules/setup/payroll-rate/constants/label.const";
import {
  COMPANY_POLICY_LABEL,
  OT_INCLUSION_OPTIONS,
  OT_ELIGIBILITY_OPTIONS,
} from "@/app/modules/setup/company-policy/constants/label.const";

const { Text } = Typography;

// REGULAR and SPECIAL_WORKING are locked at ×1.00 company-wide — not meaningful to override.
const OVERRIDABLE_TYPES = BASE_RATE_KEYS.filter(
  (type) => type !== "REGULAR" && type !== "SPECIAL_WORKING",
);
// Every rate type this modal can set for a client, across both sections — used for loading
// existing overrides into form state and for building the save payload.
const ALL_RATE_OVERRIDE_TYPES = [
  ...OVERRIDABLE_TYPES,
  ...OT_OVERRIDE_RATE_KEYS,
];

// Setup > Client > Settings > Allowances — Retirement and Uniform Allowance are directly-
// targetable fields on Client itself (see Client.cs) rather than an open-ended catalog, since
// there are only ever these two and each has its own fixed, non-generic behavior: Retirement
// (a days/year rate, not a peso amount) is computed and accumulated every payroll run into a
// RetirementFund balance; Uniform Allowance accrues as a balance since HireDate in a later
// phase. Backed by the same full-record useClient/useUpdateClient pipeline the General Info tab
// in client-detail.tsx uses, so this tab loads and saves the whole Client record rather than a
// separate child-table resource.
const UNIFORM_ALLOWANCE_BASIS_OPTIONS: {
  value: "TenureMonths" | "PresentDays";
  label: string;
}[] = [
  { value: "TenureMonths", label: "Tenure — months since hire date" },
  {
    value: "PresentDays",
    label:
      "Present Days — count of present days (holidays and rest days included)",
  },
];

function AllowancesTab({
  clientId,
  onClose,
}: {
  clientId: string;
  onClose: () => void;
}) {
  const { data: selected, isLoading } = useClient(clientId);
  const { mutateAsync: update, isPending } = useUpdateClient();

  const [retirementDaysPerYear, setRetirementDaysPerYear] = useState<
    number | null
  >(null);
  const [uniformAllowance, setUniformAllowance] = useState<number | null>(null);
  const [uniformAllowanceBasis, setUniformAllowanceBasis] = useState<
    "TenureMonths" | "PresentDays"
  >("TenureMonths");

  useEffect(() => {
    if (selected) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setRetirementDaysPerYear(selected.retirementDaysPerYear ?? null);
      setUniformAllowance(selected.uniformAllowance ?? null);
      setUniformAllowanceBasis(
        selected.uniformAllowanceBasis ?? "TenureMonths",
      );
    }
  }, [selected]);

  const isDirty =
    !!selected &&
    (retirementDaysPerYear !== (selected.retirementDaysPerYear ?? null) ||
      uniformAllowance !== (selected.uniformAllowance ?? null) ||
      uniformAllowanceBasis !==
        (selected.uniformAllowanceBasis ?? "TenureMonths"));

  const handleSave = async () => {
    if (!selected) return;
    // Client's PUT endpoint round-trips the full record, not a partial patch -- spread the
    // currently-loaded record so identity fields (code/name/email/...) are carried through
    // unchanged rather than omitted.
    await update({
      ...selected,
      retirementDaysPerYear,
      uniformAllowance,
      uniformAllowanceBasis,
    });
  };

  return (
    <Spin spinning={isLoading}>
      <div className="flex flex-col gap-4 mt-2">
        <div>
          <div className="text-sm font-medium mb-1">Retirement (days/year)</div>
          <InputNumber
            className="w-full"
            min={0}
            precision={2}
            placeholder="Not given"
            value={retirementDaysPerYear}
            onChange={setRetirementDaysPerYear}
          />
        </div>
        <div>
          <div className="text-sm font-medium mb-1">
            Uniform Allowance (per month)
          </div>
          <Space.Compact className="w-full">
            <InputNumber
              className="w-1/2"
              min={0}
              precision={2}
              placeholder="Not given"
              value={uniformAllowance}
              onChange={setUniformAllowance}
            />
            <Select<"TenureMonths" | "PresentDays">
              className="w-1/2"
              options={UNIFORM_ALLOWANCE_BASIS_OPTIONS}
              value={uniformAllowanceBasis}
              onChange={setUniformAllowanceBasis}
            />
          </Space.Compact>
        </div>
        <Alert
          type="info"
          showIcon
          message="Leave an amount blank if this client doesn't give that allowance."
        />
        <div className="flex justify-end gap-2">
          <Button onClick={onClose}>Cancel</Button>
          <Button
            type="primary"
            loading={isPending}
            disabled={!isDirty}
            onClick={handleSave}
          >
            Save
          </Button>
        </div>
      </div>
    </Spin>
  );
}

interface Props {
  clientId: string | null;
  clientName?: string;
  onClose: () => void;
}

export default function ClientSettingsModal({
  clientId,
  clientName,
  onClose,
}: Props) {
  const { data: policyData, isLoading: isLoadingPolicy } = useClientPolicy(
    clientId ?? undefined,
  );
  const { mutateAsync: updatePolicy, isPending: isPolicyPending } =
    useUpdateClientPolicy(clientId ?? "");

  const { control, handleSubmit, reset } = useForm<ClientPolicyFormValues>({
    resolver: zodResolver(clientPolicyFormSchema),
    defaultValues: {
      otEligibility: null,
      otInclusionPolicy: null,
      maxSSSCapping: null,
      maxPhilHealthCapping: null,
      maxPagIbigCapping: null,
    },
  });

  useEffect(() => {
    if (policyData) {
      reset({
        otEligibility: policyData.otEligibility ?? null,
        otInclusionPolicy: policyData.otInclusionPolicy ?? null,
        maxSSSCapping: policyData.maxSSSCapping ?? null,
        maxPhilHealthCapping: policyData.maxPhilHealthCapping ?? null,
        maxPagIbigCapping: policyData.maxPagIbigCapping ?? null,
      });
    }
  }, [policyData, reset]);

  const { data: overrides, isLoading: isLoadingOverrides } = useClientRates(
    clientId ?? undefined,
  );
  const { data: globalRates = [], isLoading: isLoadingGlobal } =
    usePayrollRates();
  const { mutateAsync: bulkReplaceRates, isPending: isRatesPending } =
    useBulkReplaceClientRates(clientId ?? "");

  const [vals, setVals] = useState<Record<string, number | null>>({});

  const globalByType = useMemo(() => {
    const map: Record<string, number> = { ...BASE_RATE_DEFAULTS };
    for (const r of globalRates) map[r.type] = r.rate;
    return map;
  }, [globalRates]);

  useEffect(() => {
    if (!clientId) return;
    const next: Record<string, number | null> = Object.fromEntries(
      ALL_RATE_OVERRIDE_TYPES.map((type) => [type, null]),
    );
    for (const o of overrides ?? []) {
      if (o.type in next) {
        next[o.type] = o.rate;
      }
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setVals(next);
  }, [clientId, overrides]);

  const handleRateChange = (type: string, value: number | null) => {
    setVals((prev) => ({ ...prev, [type]: value }));
  };

  const isLoading = isLoadingPolicy || isLoadingOverrides || isLoadingGlobal;
  const isPending = isPolicyPending || isRatesPending;

  // The Allowances tab saves itself independently (see AllowancesTab.handleSave) rather than
  // through this modal's own onSubmit/Save button — it has no otEligibility/rates form fields
  // to submit. Showing the outer footer's Save on top of that tab's own Save button is exactly
  // the "two Save buttons" bug this tracks -- hide the outer footer while that tab is active.
  const [activeTabKey, setActiveTabKey] = useState("policy");

  const onSubmit = async (policyValues: ClientPolicyFormValues) => {
    const rateEntries = ALL_RATE_OVERRIDE_TYPES.filter(
      (type) => vals[type] !== null && vals[type] !== undefined,
    ).map((type) => ({ type, rate: vals[type] as number }));

    await Promise.all([
      updatePolicy({
        otEligibility: policyValues.otEligibility ?? null,
        otInclusionPolicy: policyValues.otInclusionPolicy ?? null,
        maxSSSCapping: policyValues.maxSSSCapping ?? null,
        maxPhilHealthCapping: policyValues.maxPhilHealthCapping ?? null,
        maxPagIbigCapping: policyValues.maxPagIbigCapping ?? null,
      }),
      bulkReplaceRates(rateEntries),
    ]);
    onClose();
  };

  return (
    <Modal
      title={`${clientName ?? clientId}`}
      open={!!clientId}
      onCancel={onClose}
      onOk={handleSubmit(onSubmit)}
      okText="Save"
      okButtonProps={{ loading: isPending }}
      footer={activeTabKey === "benefits" ? null : undefined}
      destroyOnClose
      width={640}
    >
      {isLoading ? (
        <div className="flex justify-center py-8">
          <Spin />
        </div>
      ) : (
        <Tabs
          className="mt-4"
          activeKey={activeTabKey}
          onChange={setActiveTabKey}
          items={[
            {
              key: "policy",
              label: "OT Policy",
              children: (
                <Form layout="vertical">
                  <Form.Item label={COMPANY_POLICY_LABEL.OT_ELIGIBILITY}>
                    <Controller
                      name="otEligibility"
                      control={control}
                      render={({ field }) => (
                        <Select
                          {...field}
                          allowClear
                          placeholder="Select to override..."
                          options={OT_ELIGIBILITY_OPTIONS}
                          onChange={(v) => field.onChange(v ?? null)}
                        />
                      )}
                    />
                  </Form.Item>
                  <Form.Item label={COMPANY_POLICY_LABEL.OT_INCLUSION}>
                    <Controller
                      name="otInclusionPolicy"
                      control={control}
                      render={({ field }) => (
                        <Select
                          {...field}
                          allowClear
                          placeholder="Select to override..."
                          options={OT_INCLUSION_OPTIONS}
                          onChange={(v) => field.onChange(v ?? null)}
                        />
                      )}
                    />
                  </Form.Item>
                  <Alert
                    type="info"
                    showIcon
                    className="mt-2"
                    message="Leave a field empty to inherit the company-level setting."
                  />
                </Form>
              ),
            },
            {
              key: "capping",
              label: "Max Employee Share Deduction",
              children: (
                <Form layout="vertical">
                  <Form.Item label="SSS (per month)">
                    <Controller
                      name="maxSSSCapping"
                      control={control}
                      render={({ field }) => (
                        <InputNumber
                          {...field}
                          className="w-full"
                          min={0}
                          precision={2}
                          placeholder="Amount"
                          onChange={(v) => field.onChange(v ?? null)}
                        />
                      )}
                    />
                  </Form.Item>
                  <Form.Item label="PhilHealth (per month)">
                    <Controller
                      name="maxPhilHealthCapping"
                      control={control}
                      render={({ field }) => (
                        <InputNumber
                          {...field}
                          className="w-full"
                          min={0}
                          precision={2}
                          placeholder="Amount"
                          onChange={(v) => field.onChange(v ?? null)}
                        />
                      )}
                    />
                  </Form.Item>
                  <Form.Item label="Pag-IBIG (per month)">
                    <Controller
                      name="maxPagIbigCapping"
                      control={control}
                      render={({ field }) => (
                        <InputNumber
                          {...field}
                          className="w-full"
                          min={0}
                          precision={2}
                          placeholder="Amount"
                          onChange={(v) => field.onChange(v ?? null)}
                        />
                      )}
                    />
                  </Form.Item>
                  <Alert
                    type="warning"
                    showIcon
                    className="mt-2"
                    message="Warning: Manually capping a value below the mandatory minimum specified by government contribution tables may violate Philippine statutory guidelines. Ensure your configuration aligns with your corporate legal compliance rules before saving."
                  />
                </Form>
              ),
            },
            {
              key: "rates",
              label: "Rate Multipliers",
              children: (
                <div className="flex flex-col gap-3 mt-2">
                  {OVERRIDABLE_TYPES.map((type) => (
                    <div
                      key={type}
                      className="flex items-center justify-between gap-3"
                    >
                      <Text>{RATE_TYPE_LABEL[type] ?? type}</Text>
                      <Space>
                        <InputNumber
                          value={vals[type] ?? null}
                          onChange={(v) => handleRateChange(type, v)}
                          min={0}
                          step={0.01}
                          precision={2}
                          addonBefore="×"
                          placeholder={`inherits × ${globalByType[type]?.toFixed(2) ?? "1.00"}`}
                          style={{ width: 180 }}
                        />
                        <Button
                          type="text"
                          size="small"
                          icon={<CloseCircleOutlined />}
                          disabled={
                            vals[type] === null || vals[type] === undefined
                          }
                          onClick={() => handleRateChange(type, null)}
                        />
                      </Space>
                    </div>
                  ))}

                  {/* <Divider className="my-1" /> */}
                  <Text strong>Overtime-Only Rates</Text>
                  {OT_OVERRIDE_RATE_KEYS.map((type) => (
                    <div
                      key={type}
                      className="flex items-center justify-between gap-3"
                    >
                      <Text>{RATE_TYPE_LABEL[type] ?? type}</Text>
                      <Space>
                        <InputNumber
                          value={vals[type] ?? null}
                          onChange={(v) => handleRateChange(type, v)}
                          min={0}
                          step={0.01}
                          precision={3}
                          addonBefore="×"
                          placeholder="uses standard formula"
                          style={{ width: 180 }}
                        />
                        <Button
                          type="text"
                          size="small"
                          icon={<CloseCircleOutlined />}
                          disabled={
                            vals[type] === null || vals[type] === undefined
                          }
                          onClick={() => handleRateChange(type, null)}
                        />
                      </Space>
                    </div>
                  ))}
                  <Alert
                    type="info"
                    showIcon
                    className="mt-2"
                    message="Leave a field empty to inherit the company-wide rate."
                  />

                  {/* <Alert
                    type="info"
                    showIcon
                    className="mt-2"
                    message="Sets a flat total OT rate for that category only, for this client — it never changes their regular (non-OT) holiday pay. Leave a field empty to use the standard formula (day-type rate × Holiday/Rest Day OT Premium above)."
                  /> */}
                </div>
              ),
            },
            {
              key: "benefits",
              label: "Allowances",
              children: (
                <AllowancesTab clientId={clientId ?? ""} onClose={onClose} />
              ),
            },
          ]}
        />
      )}
    </Modal>
  );
}
