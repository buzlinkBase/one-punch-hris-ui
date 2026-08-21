import { useState, useEffect } from "react";
import {
  Button,
  Card,
  Collapse,
  InputNumber,
  Space,
  Table,
  Tag,
  Typography,
  message,
} from "antd";
import { LockOutlined, ReloadOutlined, SaveOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
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

// Common derived scenarios shown in the preview panel.
// OT uses the regular OT multiplier for regular-day scenarios.
// HOT (Holiday OT Premium) is a separate configurable rate used for OT on rest days and holidays.
function buildDerivedRows(vals: Record<string, number>) {
  const R = vals.REGULAR ?? 1;
  const ND = vals.NIGHTDIFF ?? 1.1;
  const OT = vals.OVERTIME ?? 1.25;
  const RD = vals.RESTDAY_DUTY ?? 1.3;
  const LH = vals.LEGAL_HOLIDAY_DUTY ?? 2;
  const SH = vals.SPECIAL_NON_WORKING ?? 1.3;
  const HOT = vals.HOLIDAY_OT ?? 1.3; // OT premium for rest days and holidays (DOLE default 1.30)

  const hot = HOT.toFixed(2);
  return [
    { label: "Regular OT", formula: "REG × OT", rate: R * OT },
    { label: "Regular Night Diff", formula: "REG × ND", rate: R * ND },
    {
      label: "Regular Night Diff OT",
      formula: "REG × ND × OT",
      rate: R * ND * OT,
    },
    { label: "Rest Day", formula: "RD", rate: RD },
    { label: "Rest Day OT", formula: `RD × HOT(${hot})`, rate: RD * HOT },
    { label: "Rest Day Night Diff", formula: "RD × ND", rate: RD * ND },
    {
      label: "Rest Day Night Diff OT",
      formula: `RD × ND × HOT(${hot})`,
      rate: RD * ND * HOT,
    },
    { label: "Legal Holiday (worked)", formula: "LH", rate: LH },
    { label: "Legal Holiday OT", formula: `LH × HOT(${hot})`, rate: LH * HOT },
    {
      label: "Legal Holiday Night Diff OT",
      formula: `LH × ND × HOT(${hot})`,
      rate: LH * ND * HOT,
    },
    { label: "Special Holiday (worked)", formula: "SH", rate: SH },
    {
      label: "Special Holiday OT",
      formula: `SH × HOT(${hot})`,
      rate: SH * HOT,
    },
    { label: "Rest Day + Special Holiday", formula: "RD × SH", rate: RD * SH },
  ];
}

const derivedColumns: ColumnsType<{
  label: string;
  formula: string;
  rate: number;
}> = [
  { title: "Scenario", dataIndex: "label", key: "label" },
  {
    title: "Formula",
    dataIndex: "formula",
    key: "formula",
    render: (v) => <Text code>{v}</Text>,
  },
  {
    title: "Rate",
    dataIndex: "rate",
    key: "rate",
    render: (v: number) => (
      <Tag color="green" className="tabular-nums">
        × {v.toFixed(2)}
      </Tag>
    ),
  },
];

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
    // SPECIAL_WORKING is always locked to REGULAR
    const effective: Record<string, number> = {
      ...vals,
      SPECIAL_WORKING: vals.REGULAR ?? BASE_RATE_DEFAULTS.REGULAR,
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

  const derivedRows = buildDerivedRows(vals);

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
                ...(type === "SPECIAL_WORKING"
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
                  type === "SPECIAL_WORKING"
                    ? (vals.REGULAR ?? BASE_RATE_DEFAULTS.REGULAR)
                    : vals[type]
                }
                onChange={
                  type === "SPECIAL_WORKING"
                    ? undefined
                    : (v) => handleChange(type, v)
                }
                disabled={type === "SPECIAL_WORKING"}
                min={0}
                step={0.01}
                precision={2}
                addonBefore="×"
                className="w-full"
              />
              <Text type="secondary" className="text-[11px] mt-1 block">
                {type === "SPECIAL_WORKING"
                  ? "Locked — mirrors the Regular rate."
                  : `default: × ${BASE_RATE_DEFAULTS[type].toFixed(2)}`}
              </Text>
            </Card>
          ))}
        </div>

        <Collapse
          ghost
          items={[
            {
              key: "derived",
              label: (
                <Text strong className="text-[#1DA081]">
                  Derived Compound Rates (estimated preview)
                </Text>
              ),
              children: (
                <>
                  <Text type="secondary" className="block mb-3 text-xs">
                    These rates are computed live from the base values above.
                    The actual payroll engine may apply DOLE-specific rounding —
                    these are approximate.
                  </Text>
                  <Table
                    rowKey="label"
                    dataSource={derivedRows}
                    columns={derivedColumns}
                    size="small"
                    pagination={false}
                  />
                </>
              ),
            },
          ]}
        />
      </div>
    </div>
  );
}
