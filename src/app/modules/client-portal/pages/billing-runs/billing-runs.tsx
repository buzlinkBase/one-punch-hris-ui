import { useState } from "react";
import {
  Alert,
  Button,
  Card,
  Checkbox,
  Input,
  Select,
  Statistic,
  Table,
  Tag,
  Typography,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { useNavigate } from "@tanstack/react-router";
import dayjs, { type Dayjs } from "dayjs";
import { getNotify } from "@/shared/utils/notify";
import { MobileRangePicker } from "@/shared/components/mobile-range-picker";
import { PermissionGate } from "@/shared/components/permission-gate/permission-gate";
import { usePortalClients } from "../../hooks/use-client-portal-queries";
import {
  useArrangements,
  useBillingRuns,
  useGenerateRun,
  usePreviewRun,
} from "../../hooks/use-billing-format-queries";
import {
  BILLING_FORMAT_LABEL,
  BILLING_PATH,
  BILLING_PERMISSION,
  INVOICE_STATUS_TAG,
  PRICING_METHOD_LABEL,
  peso,
} from "../../constants/label.const";
import type {
  ArrangementPreview,
  BillingIssue,
  BillingRun,
  BillingRunPreview,
  BillingRunRequest,
  PricedGroup,
} from "../../models/api/billing-format.model";
import { AdjustmentsPanel } from "./adjustments-panel";

const { Title, Text } = Typography;
const DATE = "YYYY-MM-DD";

/** The last complete semi-monthly cutoff: the 1st–15th, or the 16th to the end of the month. */
function lastCutoff(): [Dayjs, Dayjs] {
  const today = dayjs().startOf("day");
  if (today.date() > 15) {
    return [today.startOf("month"), today.startOf("month").date(15)];
  }
  const previous = today.subtract(1, "month");
  return [previous.date(16), previous.endOf("month").startOf("day")];
}

export default function BillingRuns() {
  const navigate = useNavigate();
  const clients = usePortalClients();
  const [clientId, setClientId] = useState<string>();
  const [range, setRange] = useState<[Dayjs, Dayjs]>(lastCutoff);
  const [reference, setReference] = useState("");
  const [notes, setNotes] = useState("");
  const [excluded, setExcluded] = useState<string[]>([]);
  const arrangements = useArrangements(clientId);
  const runs = useBillingRuns(clientId);
  const preview = usePreviewRun();
  const generate = useGenerateRun();
  const [result, setResult] = useState<BillingRunPreview>();

  const active = (arrangements.data ?? []).filter((a) => a.isActive);
  const picked = active.filter((a) => !excluded.includes(a.id));

  const request = (): BillingRunRequest | undefined =>
    clientId
      ? {
          clientId,
          from: range[0].format(DATE),
          to: range[1].format(DATE),
          arrangementIds: excluded.length > 0 ? picked.map((a) => a.id) : null,
          referenceNo: reference.trim() || null,
          notes: notes.trim() || null,
        }
      : undefined;

  const onPreview = async () => {
    const r = request();
    if (r) setResult(await preview.mutateAsync(r));
  };

  const onGenerate = async () => {
    const r = request();
    if (!r) return;
    const run = await generate.mutateAsync(r);
    getNotify().success({
      message: `Reference ${run.referenceNo}: ${run.invoices.length} draft invoice(s) prepared.`,
    });
    setResult(undefined);
  };

  const reset = () => setResult(undefined);

  const runColumns: ColumnsType<BillingRun> = [
    { title: "Reference", dataIndex: "referenceNo", width: 110 },
    {
      title: "Period",
      key: "period",
      render: (_, r) => `${r.periodFrom} → ${r.periodTo}`,
    },
    {
      title: "Invoices",
      key: "invoices",
      render: (_, r) => (
        <div className="flex flex-wrap gap-1">
          {r.invoices.map((i) => {
            const tag = INVOICE_STATUS_TAG[i.displayStatus];
            return (
              <Tag
                key={i.id}
                color={tag?.color}
                className="cursor-pointer"
                onClick={() => navigate({ to: BILLING_PATH.invoice(i.id) })}
              >
                {i.number ?? "Draft"} · {peso(i.total)}
              </Tag>
            );
          })}
        </div>
      ),
    },
    {
      title: "Total",
      key: "total",
      align: "right",
      render: (_, r) => peso(r.total),
    },
    {
      title: "Prepared",
      key: "created",
      render: (_, r) =>
        `${r.createdBy}, ${dayjs(r.createdAt).format("MMM D, YYYY")}`,
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div>
        <Title level={3} className="m-0!">
          {BILLING_FORMAT_LABEL.RUNS_TITLE}
        </Title>
        <Text type="secondary">{BILLING_FORMAT_LABEL.RUNS_SUBTITLE}</Text>
      </div>

      <div className="flex flex-col gap-3 rounded-lg bg-white p-4">
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex min-w-64 flex-col gap-1">
            <Text type="secondary">Client</Text>
            <Select
              showSearch
              optionFilterProp="label"
              placeholder="Choose a client"
              value={clientId}
              loading={clients.isLoading}
              options={(clients.data ?? []).map((c) => ({
                value: c.id,
                label: `${c.name} (${c.code})`,
              }))}
              onChange={(value) => {
                setClientId(value);
                setExcluded([]);
                reset();
              }}
            />
          </div>
          <div className="flex flex-col gap-1">
            <Text type="secondary">Period</Text>
            <MobileRangePicker
              value={range}
              allowClear={false}
              onChange={(value) => {
                if (value?.[0] && value[1]) {
                  setRange([value[0], value[1]]);
                  reset();
                }
              }}
            />
          </div>
          <div className="flex w-40 flex-col gap-1">
            <Text type="secondary">Reference no.</Text>
            <Input
              value={reference}
              maxLength={60}
              placeholder="Automatic"
              onChange={(e) => setReference(e.target.value)}
            />
          </div>
          <div className="flex min-w-64 flex-1 flex-col gap-1">
            <Text type="secondary">Notes on the invoices</Text>
            <Input
              value={notes}
              maxLength={1000}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>

        {clientId && active.length > 0 && (
          <div className="flex flex-wrap items-center gap-3">
            <Text type="secondary">Bill</Text>
            {active.map((a) => (
              <Checkbox
                key={a.id}
                checked={!excluded.includes(a.id)}
                onChange={(e) => {
                  setExcluded((list) =>
                    e.target.checked
                      ? list.filter((id) => id !== a.id)
                      : [...list, a.id],
                  );
                  reset();
                }}
              >
                {a.name}
              </Checkbox>
            ))}
          </div>
        )}
        {clientId && !arrangements.isLoading && active.length === 0 && (
          <Alert
            type="info"
            showIcon
            message="This client has no billing arrangement yet."
            description="Add one under Billing Setup, choosing a billing format and the client's billing lines and rates."
            action={
              <Button
                size="small"
                onClick={() => navigate({ to: BILLING_PATH.SETUP })}
              >
                Billing Setup
              </Button>
            }
          />
        )}

        <div className="flex flex-wrap gap-2">
          <Button
            disabled={!clientId || picked.length === 0}
            loading={preview.isPending}
            onClick={onPreview}
          >
            Preview
          </Button>
          <PermissionGate permission={BILLING_PERMISSION.MANAGE}>
            <Button
              type="primary"
              disabled={!result?.canGenerate}
              loading={generate.isPending}
              onClick={onGenerate}
            >
              Prepare draft invoices
            </Button>
          </PermissionGate>
        </div>
      </div>

      {result && <PreviewResult preview={result} />}

      {clientId && (
        <AdjustmentsPanel clientId={clientId} arrangements={active} />
      )}

      {clientId && (
        <div className="rounded-lg bg-white p-4">
          <Title level={5}>Earlier billing runs</Title>
          <Table<BillingRun>
            rowKey="id"
            size="small"
            loading={runs.isLoading}
            dataSource={runs.data ?? []}
            columns={runColumns}
            pagination={{ pageSize: 10, hideOnSinglePage: true }}
            scroll={{ x: "max-content" }}
          />
        </div>
      )}
    </div>
  );
}

function IssueList({ issues }: { issues: BillingIssue[] }) {
  if (issues.length === 0) return null;
  return (
    <div className="flex flex-col gap-2">
      {issues.map((issue, index) => (
        <Alert
          key={`${issue.code}-${index}`}
          type={issue.blocking ? "error" : "warning"}
          showIcon
          message={issue.message}
        />
      ))}
    </div>
  );
}

function PreviewResult({ preview }: { preview: BillingRunPreview }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-6 rounded-lg bg-white p-4">
        <Statistic
          title="Time logs in the period"
          value={preview.recordCount}
        />
        <Statistic
          title="Not covered by any arrangement"
          value={preview.unmatchedRecords}
        />
        <Statistic
          title="Total to bill"
          value={preview.total}
          precision={2}
          prefix="₱"
        />
        <div className="ml-auto self-center">
          {preview.canGenerate ? (
            <Tag color="green">Ready to prepare</Tag>
          ) : (
            <Tag color="red">Fix the issues below first</Tag>
          )}
        </div>
      </div>
      <IssueList issues={preview.issues} />
      {preview.arrangements.map((a) => (
        <ArrangementResult key={a.arrangementId} preview={a} />
      ))}
    </div>
  );
}

function ArrangementResult({ preview: a }: { preview: ArrangementPreview }) {
  const r = a.result;
  const columns: ColumnsType<PricedGroup> = [
    { title: "Billing line", dataIndex: "label" },
    {
      title: "Headcount",
      dataIndex: "headcount",
      align: "right",
      width: 100,
    },
    {
      title: "Hours (reg + OT)",
      key: "hours",
      align: "right",
      render: (_, g) =>
        (g.actual.regularHours + g.actual.overtimeHours).toFixed(2),
    },
    {
      title: "Personnel",
      key: "base",
      align: "right",
      render: (_, g) => peso(g.base),
    },
    {
      title: "Agency fee",
      key: "fee",
      align: "right",
      render: (_, g) => peso(g.agencyFee),
    },
    {
      title: "VAT",
      key: "vat",
      align: "right",
      render: (_, g) => peso(g.vat),
    },
    {
      title: "Withholding",
      key: "wht",
      align: "right",
      render: (_, g) => peso(-g.withholding),
    },
    {
      title: "Net",
      key: "net",
      align: "right",
      render: (_, g) => <b>{peso(g.net)}</b>,
    },
  ];

  return (
    <Card
      size="small"
      title={
        <div className="flex flex-wrap items-center gap-2">
          <span>{a.name}</span>
          <Tag color="blue">{a.formatName}</Tag>
          <Text type="secondary" className="text-xs font-normal">
            {PRICING_METHOD_LABEL[a.method] ?? a.method} · {a.recordCount} time
            log(s)
          </Text>
        </div>
      }
      extra={r && <Text strong>{peso(r.gross)}</Text>}
    >
      <div className="flex flex-col gap-3">
        <IssueList issues={a.issues} />
        {r && (
          <Table<PricedGroup>
            rowKey="key"
            size="small"
            pagination={false}
            dataSource={r.groups}
            columns={columns}
            scroll={{ x: "max-content" }}
            expandable={{
              expandedRowRender: (g) => (
                <div className="flex flex-col gap-1">
                  {g.lines.map((l) => (
                    <div key={l.code} className="flex justify-between gap-4">
                      <Text>
                        {l.label}
                        {l.quantity != null && (
                          <Text type="secondary">
                            {" "}
                            · {l.quantity} {l.unit ?? ""}
                          </Text>
                        )}
                      </Text>
                      <Text>{peso(l.amount)}</Text>
                    </div>
                  ))}
                </div>
              ),
            }}
            summary={() => (
              <Table.Summary.Row>
                <Table.Summary.Cell index={0} colSpan={4}>
                  <b>Invoice total</b> (gross {peso(r.gross)})
                </Table.Summary.Cell>
                <Table.Summary.Cell index={1} align="right">
                  {peso(r.base)}
                </Table.Summary.Cell>
                <Table.Summary.Cell index={2} align="right">
                  {peso(r.agencyFee)}
                </Table.Summary.Cell>
                <Table.Summary.Cell index={3} align="right">
                  {peso(r.vat)}
                </Table.Summary.Cell>
                <Table.Summary.Cell index={4} align="right">
                  {peso(-r.withholding)}
                </Table.Summary.Cell>
                <Table.Summary.Cell index={5} align="right">
                  <b>{peso(r.net)}</b>
                </Table.Summary.Cell>
              </Table.Summary.Row>
            )}
          />
        )}
      </div>
    </Card>
  );
}
