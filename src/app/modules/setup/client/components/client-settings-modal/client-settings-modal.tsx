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
import { usePayrollRates } from "@/app/modules/setup/payroll-rate/hooks/use-payroll-rate-queries";
import {
  BASE_RATE_DEFAULTS,
  BASE_RATE_KEYS,
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
    },
  });

  useEffect(() => {
    if (policyData) {
      reset({
        otEligibility: policyData.otEligibility ?? null,
        otInclusionPolicy: policyData.otInclusionPolicy ?? null,
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
      OVERRIDABLE_TYPES.map((type) => [type, null]),
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

  const onSubmit = async (policyValues: ClientPolicyFormValues) => {
    const rateEntries = OVERRIDABLE_TYPES.filter(
      (type) => vals[type] !== null && vals[type] !== undefined,
    ).map((type) => ({ type, rate: vals[type] as number }));

    await Promise.all([
      updatePolicy({
        otEligibility: policyValues.otEligibility ?? null,
        otInclusionPolicy: policyValues.otInclusionPolicy ?? null,
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
      destroyOnClose
      width={560}
    >
      {isLoading ? (
        <div className="flex justify-center py-8">
          <Spin />
        </div>
      ) : (
        <Tabs
          className="mt-4"
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
                  <Alert
                    type="info"
                    showIcon
                    className="mt-2"
                    message="Leave a field empty to inherit the company-wide rate."
                  />
                </div>
              ),
            },
          ]}
        />
      )}
    </Modal>
  );
}
