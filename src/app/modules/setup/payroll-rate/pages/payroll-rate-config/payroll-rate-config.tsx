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
import {
  usePayrollRates,
  useCreatePayrollRate,
  useUpdatePayrollRate,
} from "../../hooks/use-payroll-rate-queries";
import {
  BASE_RATE_DEFAULTS,
  BASE_RATE_KEYS,
  BUILDING_BLOCKS,
  RATE_TYPE_DESCRIPTION,
  RATE_TYPE_LABEL,
} from "../../constants/label.const";
import type { PayrollRateResponse } from "../../models/api/response/payroll-rate-response.model";

const { Title, Text } = Typography;

// Common derived scenarios shown in the preview panel.
// Formula uses the full-multiplier building blocks (e.g. OVERTIME=1.25, NIGHTDIFF=1.10).
function buildDerivedRows(vals: Record<string, number>) {
  const R = vals.REGULAR ?? 1;
  const ND = vals.NIGHTDIFF ?? 1.1;
  const OT = vals.OVERTIME ?? 1.25;
  const RD = vals.RESTDAY_DUTY ?? 1.3;
  const LH = vals.LEGAL_HOLIDAY_DUTY ?? 2;
  const SH = vals.SPECIAL_NON_WORKING ?? 1.3;

  return [
    { label: "Regular OT", formula: "REG × OT", rate: R * OT },
    { label: "Regular Night Diff", formula: "REG × ND", rate: R * ND },
    {
      label: "Regular Night Diff OT",
      formula: "REG × ND × OT",
      rate: R * ND * OT,
    },
    { label: "Rest Day", formula: "RD", rate: RD },
    { label: "Rest Day OT", formula: "RD × OT", rate: RD * OT },
    { label: "Rest Day Night Diff", formula: "RD × ND", rate: RD * ND },
    {
      label: "Rest Day Night Diff OT",
      formula: "RD × ND × OT",
      rate: RD * ND * OT,
    },
    { label: "Legal Holiday (worked)", formula: "LH", rate: LH },
    { label: "Legal Holiday OT", formula: "LH × OT", rate: LH * OT },
    {
      label: "Legal Holiday Night Diff OT",
      formula: "LH × ND × OT",
      rate: LH * ND * OT,
    },
    { label: "Special Holiday (worked)", formula: "SH", rate: SH },
    { label: "Special Holiday OT", formula: "SH × OT", rate: SH * OT },
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
      <Tag color="green" style={{ fontVariantNumeric: "tabular-nums" }}>
        × {v.toFixed(4)}
      </Tag>
    ),
  },
];

export default function PayrollRateConfig() {
  const { data: all = [], isLoading, refetch, isFetching } = usePayrollRates();
  const { mutateAsync: create } = useCreatePayrollRate();
  const { mutateAsync: update } = useUpdatePayrollRate();

  // Local editable values: { [rateType]: number }
  const [vals, setVals] = useState<Record<string, number>>(() =>
    Object.fromEntries(BASE_RATE_KEYS.map((k) => [k, BASE_RATE_DEFAULTS[k]])),
  );
  // Map from rateType → existing DB record (if any)
  const [existing, setExisting] = useState<Record<string, PayrollRateResponse>>(
    {},
  );
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const map: Record<string, PayrollRateResponse> = {};
    const next: Record<string, number> = { ...vals };
    for (const r of all) {
      if (BUILDING_BLOCKS.has(r.type)) {
        map[r.type] = r;
        next[r.type] = r.rate;
      }
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setExisting(map);
    setVals(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [all]);

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
      await Promise.all(
        BASE_RATE_KEYS.map((type) => {
          const rec = existing[type];
          if (rec) {
            return update({
              id: rec.id,
              type,
              rate: effective[type],
              remarks: rec.remarks,
            });
          }
          return create({ type, rate: effective[type], remarks: 0 });
        }),
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
              nine values.
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

      <div style={{ padding: "0 24px 24px" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 16,
            marginBottom: 24,
          }}
        >
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
              <div style={{ marginBottom: 4 }}>
                <Text strong>{RATE_TYPE_LABEL[type]}</Text>
                <Tag style={{ marginLeft: 8, fontSize: 10 }} color="purple">
                  {type}
                </Tag>
                {type === "SPECIAL_WORKING" && (
                  <Tag
                    icon={<LockOutlined />}
                    color="default"
                    style={{ marginLeft: 4, fontSize: 10 }}
                  >
                    = Regular
                  </Tag>
                )}
              </div>
              <Text
                type="secondary"
                style={{ fontSize: 12, display: "block", marginBottom: 12 }}
              >
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
                step={0.0001}
                precision={4}
                addonBefore="×"
                style={{ width: "100%" }}
              />
              <Text
                type="secondary"
                style={{ fontSize: 11, marginTop: 4, display: "block" }}
              >
                {type === "SPECIAL_WORKING"
                  ? "Locked — mirrors the Regular rate."
                  : `default: × ${BASE_RATE_DEFAULTS[type].toFixed(4)}`}
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
                <Text strong style={{ color: "#1DA081" }}>
                  Derived Compound Rates (estimated preview)
                </Text>
              ),
              children: (
                <>
                  <Text
                    type="secondary"
                    style={{ display: "block", marginBottom: 12, fontSize: 12 }}
                  >
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
