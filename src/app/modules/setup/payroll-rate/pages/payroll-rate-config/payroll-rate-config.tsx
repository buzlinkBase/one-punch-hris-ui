import { useState, useEffect } from "react";
import {
  Button,
  Card,
  InputNumber,
  Space,
  Tag,
  Typography,
  message,
} from "antd";
import { LockOutlined, ReloadOutlined, SaveOutlined } from "@ant-design/icons";
import { usePayrollRates } from "../../hooks/use-payroll-rate-queries";
import { payrollRateApi } from "../../services/payroll-rate.api";
import {
  BASE_RATE_DEFAULTS,
  BASE_RATE_KEYS,
  BUILDING_BLOCKS,
  RATE_TYPE_DESCRIPTION,
  RATE_TYPE_LABEL,
} from "../../constants/label.const";

const { Title, Text } = Typography;

export default function PayrollRateConfig() {
  const {
    data: all = [],
    isLoading,
    refetch,
    isFetching,
    dataUpdatedAt,
  } = usePayrollRates();

  // Local editable values: { [rateType]: number }
  const [vals, setVals] = useState<Record<string, number>>(() =>
    Object.fromEntries(BASE_RATE_KEYS.map((k) => [k, BASE_RATE_DEFAULTS[k]])),
  );
  const [saving, setSaving] = useState(false);

  const syncFromApi = (records: typeof all) => {
    const next: Record<string, number> = Object.fromEntries(
      BASE_RATE_KEYS.map((k) => [k, BASE_RATE_DEFAULTS[k]]),
    );
    for (const r of records) {
      if (BUILDING_BLOCKS.has(r.type)) {
        next[r.type] = r.rate;
      }
    }
    setVals(next);
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    syncFromApi(all);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataUpdatedAt]);

  const handleChange = (type: string, value: number | null) => {
    setVals((prev) => ({ ...prev, [type]: value ?? 0 }));
  };

  const handleSave = async () => {
    setSaving(true);
    // REGULAR is always 1; SPECIAL_WORKING mirrors REGULAR
    const effective: Record<string, number> = {
      ...vals,
      REGULAR: 1,
      SPECIAL_WORKING: 1,
    };
    try {
      await payrollRateApi.bulkReplace(
        BASE_RATE_KEYS.map((type) => ({
          type,
          rate: effective[type],
          shortDescription: RATE_TYPE_LABEL[type] ?? type,
          description: RATE_TYPE_DESCRIPTION[type] ?? "",
          remarks: 0,
        })),
      );

      message.success("Rate multipliers saved.");
      refetch();
    } catch {
      message.error("Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="content-page">
      <div className="page-toolbar">
        <div className="page-toolbar-row">
          <div>
            <Title level={4} className="mb-0!">
              Rate Multipliers
            </Title>
            <p className="page-toolbar-subtitle">
              Configure the base pay multipliers. The payroll engine derives all
              compound rates (OT, Night Diff, Holiday combinations) from these
              values.
            </p>
          </div>
          <Space>
            <Button
              icon={<ReloadOutlined spin={isFetching} />}
              onClick={() => refetch()}
              loading={isFetching && !isLoading}
            />
            <Button
              type="primary"
              icon={<SaveOutlined />}
              loading={saving}
              onClick={handleSave}
            >
              Save Changes
            </Button>
          </Space>
        </div>
      </div>

      <div className="px-6 pb-6">
        <div className="form-grid-3 gap-4 mb-6">
          {BASE_RATE_KEYS.map((type) => (
            <Card
              key={type}
              size="small"
              loading={isLoading}
              styles={{
                body: { padding: "16px" },
                ...(type === "REGULAR" || type === "SPECIAL_WORKING"
                  ? {
                      header: {
                        background: "var(--ant-color-fill-quaternary)",
                      },
                    }
                  : {}),
              }}
            >
              <div className="mb-1">
                <Text strong>{RATE_TYPE_LABEL[type]}</Text>
                <Tag className="ml-2 text-[10px]" color="purple">
                  {type}
                </Tag>
                {type === "REGULAR" && (
                  <Tag
                    icon={<LockOutlined />}
                    color="default"
                    className="ml-1 text-[10px]"
                  >
                    = 1.00 (base)
                  </Tag>
                )}
                {type === "SPECIAL_WORKING" && (
                  <Tag
                    icon={<LockOutlined />}
                    color="default"
                    className="ml-1 text-[10px]"
                  >
                    = Regular
                  </Tag>
                )}
              </div>
              <Text type="secondary" className="text-xs block mb-3">
                {RATE_TYPE_DESCRIPTION[type]}
              </Text>
              <InputNumber
                value={
                  type === "REGULAR" || type === "SPECIAL_WORKING"
                    ? 1
                    : vals[type]
                }
                onChange={
                  type === "REGULAR" || type === "SPECIAL_WORKING"
                    ? undefined
                    : (v) => handleChange(type, v)
                }
                disabled={type === "REGULAR" || type === "SPECIAL_WORKING"}
                min={0}
                step={0.01}
                precision={2}
                addonBefore="×"
                className="w-full"
              />
              <Text type="secondary" className="text-[11px] mt-1 block">
                {type === "REGULAR"
                  ? "Locked — always × 1.00 (the base unit)."
                  : type === "SPECIAL_WORKING"
                    ? "Locked — mirrors the Regular rate."
                    : `default: × ${BASE_RATE_DEFAULTS[type].toFixed(2)}`}
              </Text>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
