import { useState } from "react";
import {
  Button,
  DatePicker,
  Form,
  Input,
  Modal,
  Select,
  Table,
  Tabs,
  Tag,
  Typography,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { DownloadOutlined } from "@ant-design/icons";
import { useNavigate } from "@tanstack/react-router";
import dayjs, { type Dayjs } from "dayjs";
import { getNotify } from "@/shared/utils/notify";
import { MobileRangePicker } from "@/shared/components/mobile-range-picker";
import { PermissionGate } from "@/shared/components/permission-gate/permission-gate";
import { downloadMultiSheetExcel } from "@/shared/utils/export.utils";
import {
  useAddCollectionNote,
  useAgingReport,
  useBillingDashboard,
  useBillingSummary,
  useCollectionsReport,
  useMissing2307,
  useOverdue,
  usePortalClients,
} from "../../hooks/use-client-portal-queries";
import {
  BILLING_PATH,
  BILLING_PERMISSION,
  peso,
} from "../../constants/label.const";
import type {
  AgingRow,
  BillingSummaryRow,
  CollectionRow,
  Missing2307Row,
  OverdueRow,
} from "../../models/api/response/client-portal-response.model";

const { Title, Text } = Typography;
const DATE = "YYYY-MM-DD";
const MONEY = "#,##0.00";

const CONTACT_KINDS = [
  { value: "Call", label: "Phone call" },
  { value: "Email", label: "Email" },
  { value: "Visit", label: "Visit" },
  { value: "Other", label: "Other" },
];

function Stat({
  label,
  value,
  warn,
}: {
  label: string;
  value: string;
  warn?: boolean;
}) {
  return (
    <div className="rounded-lg bg-white px-4 py-3">
      <div className="text-xs text-gray-500">{label}</div>
      <div className={`text-lg font-semibold ${warn ? "text-red-600" : ""}`}>
        {value}
      </div>
    </div>
  );
}

export default function BillingReports() {
  const navigate = useNavigate();
  const clients = usePortalClients();
  const [clientId, setClientId] = useState<string | undefined>();
  const [range, setRange] = useState<[Dayjs, Dayjs]>([
    dayjs().startOf("month"),
    dayjs(),
  ]);
  const from = range[0].format(DATE);
  const to = range[1].format(DATE);

  const dashboard = useBillingDashboard(clientId);
  const overdue = useOverdue(clientId);
  const aging = useAgingReport(clientId);
  const collections = useCollectionsReport(from, to, clientId);
  const summary = useBillingSummary(from, to);
  const missing = useMissing2307(clientId);
  const addNote = useAddCollectionNote();

  const [noteFor, setNoteFor] = useState<OverdueRow | null>(null);
  const [noteForm] = Form.useForm<{
    kind: string;
    contact: string;
    note: string;
    promisedDate?: Dayjs;
  }>();

  const d = dashboard.data;

  const overdueColumns: ColumnsType<OverdueRow> = [
    {
      title: "Invoice",
      key: "number",
      render: (_, r) => (
        <Button
          type="link"
          className="p-0!"
          onClick={() => navigate({ to: BILLING_PATH.invoice(r.invoiceId) })}
        >
          {r.number}
        </Button>
      ),
    },
    { title: "Client", dataIndex: "clientName" },
    { title: "Due", dataIndex: "dueDate" },
    {
      title: "Days overdue",
      key: "days",
      align: "right",
      render: (_, r) => <Tag color="red">{r.daysOverdue}</Tag>,
    },
    {
      title: "Balance",
      key: "balance",
      align: "right",
      render: (_, r) => peso(r.balance),
    },
    {
      title: "Disputed",
      key: "disputed",
      align: "right",
      render: (_, r) => (r.disputed > 0 ? peso(r.disputed) : "—"),
    },
    {
      title: "Last follow-up",
      key: "last",
      render: (_, r) => (
        <div>
          <div>
            {r.lastContactAt ? dayjs(r.lastContactAt).format("MMM D") : "None"}
          </div>
          {r.promisedDate && (
            <Text type="secondary" className="text-xs">
              Promised {r.promisedDate}
            </Text>
          )}
        </div>
      ),
    },
    {
      title: "",
      key: "actions",
      align: "right",
      render: (_, r) => (
        <PermissionGate permission={BILLING_PERMISSION.MANAGE}>
          <Button size="small" onClick={() => setNoteFor(r)}>
            Log follow-up
          </Button>
        </PermissionGate>
      ),
    },
  ];

  const agingColumns: ColumnsType<AgingRow> = [
    { title: "Client", dataIndex: "clientName" },
    ...(
      [
        ["current", "Current"],
        ["days1To30", "1–30 days"],
        ["days31To60", "31–60 days"],
        ["days61To90", "61–90 days"],
        ["over90", "Over 90 days"],
        ["total", "Total"],
      ] as const
    ).map(([key, title]) => ({
      title,
      key,
      align: "right" as const,
      render: (_: unknown, r: AgingRow) => peso(r[key]),
    })),
  ];

  const exportAll = () => {
    void downloadMultiSheetExcel(
      [
        {
          name: "Overdue",
          headers: [
            "Invoice",
            "Client",
            "Due",
            "Days overdue",
            "Balance",
            "Disputed",
          ],
          rows: (overdue.data ?? []).map((r) => [
            r.number,
            r.clientName,
            r.dueDate,
            r.daysOverdue,
            r.balance,
            r.disputed,
          ]),
          numberFormat: MONEY,
        },
        {
          name: "Aging",
          headers: [
            "Client",
            "Current",
            "1-30",
            "31-60",
            "61-90",
            "Over 90",
            "Total",
          ],
          rows: [
            ...(aging.data?.rows ?? []),
            ...(aging.data ? [aging.data.totals] : []),
          ].map((r) => [
            r.clientName,
            r.current,
            r.days1To30,
            r.days31To60,
            r.days61To90,
            r.over90,
            r.total,
          ]),
          numberFormat: MONEY,
        },
        {
          name: "Collections",
          headers: ["Date", "Client", "Method", "Reference", "Amount"],
          rows: (collections.data?.rows ?? []).map((r) => [
            r.paymentDate,
            r.clientName,
            r.method,
            r.reference,
            r.amount,
          ]),
          numberFormat: MONEY,
        },
        {
          name: "Billing summary",
          headers: ["Month", "Client", "Billed", "Collected"],
          rows: (summary.data ?? []).map((r) => [
            r.month,
            r.clientName,
            r.billed,
            r.collected,
          ]),
          numberFormat: MONEY,
        },
        {
          name: "Missing 2307",
          headers: [
            "Invoice",
            "Client",
            "Invoice date",
            "Expected withheld",
            "Received",
          ],
          rows: (missing.data ?? []).map((r) => [
            r.number,
            r.clientName,
            r.invoiceDate,
            r.expected,
            r.received,
          ]),
          numberFormat: MONEY,
        },
      ],
      `billing-reports-${dayjs().format(DATE)}.xlsx`,
    );
  };

  const submitNote = async (values: {
    kind: string;
    contact: string;
    note: string;
    promisedDate?: Dayjs;
  }) => {
    if (!noteFor) return;
    await addNote.mutateAsync({
      invoiceId: noteFor.invoiceId,
      body: {
        kind: values.kind,
        contact: values.contact,
        note: values.note,
        promisedDate: values.promisedDate
          ? values.promisedDate.format(DATE)
          : null,
      },
    });
    getNotify().success({ message: "Follow-up logged." });
    setNoteFor(null);
    noteForm.resetFields();
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <Title level={3} className="m-0!">
            Billing Reports
          </Title>
          <Text type="secondary">
            What is billed, what has been collected, and who still owes.
          </Text>
        </div>
        <Button icon={<DownloadOutlined />} onClick={exportAll}>
          Export all to Excel
        </Button>
      </div>

      <div className="flex flex-wrap gap-3 rounded-lg bg-white p-4">
        <Select
          allowClear
          showSearch
          optionFilterProp="label"
          placeholder="All clients"
          className="min-w-56"
          value={clientId}
          options={(clients.data ?? []).map((c) => ({
            value: c.id,
            label: `${c.name} (${c.code})`,
          }))}
          onChange={setClientId}
        />
        <MobileRangePicker
          value={range}
          allowClear={false}
          onChange={(value) => {
            if (value?.[0] && value[1]) setRange([value[0], value[1]]);
          }}
        />
      </div>

      {d && (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <Stat label="Billed this period" value={peso(d.billed)} />
          <Stat label="Collected" value={peso(d.collected)} />
          <Stat label="Outstanding now" value={peso(d.outstanding)} />
          <Stat
            label={`Overdue (${d.overdueInvoices} invoice${d.overdueInvoices === 1 ? "" : "s"})`}
            value={peso(d.overdue)}
            warn={d.overdue > 0}
          />
          <Stat label="Drafts" value={String(d.draftInvoices)} />
          <Stat
            label="Awaiting approval"
            value={String(d.invoicesAwaitingApproval)}
          />
          <Stat
            label="Payment proofs to review"
            value={String(d.pendingProofs)}
            warn={d.pendingProofs > 0}
          />
          <Stat
            label="Open disputes"
            value={String(d.openDisputes)}
            warn={d.openDisputes > 0}
          />
        </div>
      )}

      <div className="rounded-lg bg-white p-4">
        <Tabs
          items={[
            {
              key: "overdue",
              label: `Overdue (${overdue.data?.length ?? 0})`,
              children: (
                <Table<OverdueRow>
                  rowKey="invoiceId"
                  size="small"
                  loading={overdue.isLoading}
                  dataSource={overdue.data ?? []}
                  columns={overdueColumns}
                  scroll={{ x: "max-content" }}
                  pagination={{ pageSize: 20, hideOnSinglePage: true }}
                />
              ),
            },
            {
              key: "aging",
              label: "Aging",
              children: (
                <Table<AgingRow>
                  rowKey="clientId"
                  size="small"
                  loading={aging.isLoading}
                  dataSource={aging.data?.rows ?? []}
                  columns={agingColumns}
                  scroll={{ x: "max-content" }}
                  pagination={false}
                  summary={() =>
                    aging.data ? (
                      <Table.Summary.Row>
                        <Table.Summary.Cell index={0}>
                          <b>Total</b>
                        </Table.Summary.Cell>
                        {(
                          [
                            aging.data.totals.current,
                            aging.data.totals.days1To30,
                            aging.data.totals.days31To60,
                            aging.data.totals.days61To90,
                            aging.data.totals.over90,
                            aging.data.totals.total,
                          ] as const
                        ).map((value, i) => (
                          <Table.Summary.Cell
                            key={i}
                            index={i + 1}
                            align="right"
                          >
                            <b>{peso(value)}</b>
                          </Table.Summary.Cell>
                        ))}
                      </Table.Summary.Row>
                    ) : null
                  }
                />
              ),
            },
            {
              key: "collections",
              label: "Collections",
              children: (
                <div className="flex flex-col gap-3">
                  <div className="flex flex-wrap gap-2">
                    {(collections.data?.byMethod ?? []).map((m) => (
                      <Tag key={m.method}>
                        {m.method}: {peso(m.total)} ({m.count})
                      </Tag>
                    ))}
                    <Tag color="green">
                      Total {peso(collections.data?.total ?? 0)}
                    </Tag>
                  </div>
                  <Table<CollectionRow>
                    rowKey="paymentId"
                    size="small"
                    loading={collections.isLoading}
                    dataSource={collections.data?.rows ?? []}
                    scroll={{ x: "max-content" }}
                    pagination={{ pageSize: 20, hideOnSinglePage: true }}
                    columns={[
                      { title: "Date", dataIndex: "paymentDate" },
                      { title: "Client", dataIndex: "clientName" },
                      { title: "Method", dataIndex: "method" },
                      { title: "Reference", dataIndex: "reference" },
                      {
                        title: "Amount",
                        key: "amount",
                        align: "right",
                        render: (_, r) => peso(r.amount),
                      },
                    ]}
                  />
                </div>
              ),
            },
            {
              key: "summary",
              label: "Per client",
              children: (
                <Table<BillingSummaryRow>
                  rowKey={(r) => `${r.clientId}-${r.month}`}
                  size="small"
                  loading={summary.isLoading}
                  dataSource={summary.data ?? []}
                  scroll={{ x: "max-content" }}
                  pagination={{ pageSize: 20, hideOnSinglePage: true }}
                  columns={[
                    { title: "Month", dataIndex: "month" },
                    { title: "Client", dataIndex: "clientName" },
                    {
                      title: "Billed",
                      key: "billed",
                      align: "right",
                      render: (_, r) => peso(r.billed),
                    },
                    {
                      title: "Collected",
                      key: "collected",
                      align: "right",
                      render: (_, r) => peso(r.collected),
                    },
                  ]}
                />
              ),
            },
            {
              key: "2307",
              label: `Missing 2307 (${missing.data?.length ?? 0})`,
              children: (
                <Table<Missing2307Row>
                  rowKey="invoiceId"
                  size="small"
                  loading={missing.isLoading}
                  dataSource={missing.data ?? []}
                  scroll={{ x: "max-content" }}
                  pagination={{ pageSize: 20, hideOnSinglePage: true }}
                  columns={[
                    {
                      title: "Invoice",
                      key: "number",
                      render: (_, r) => (
                        <Button
                          type="link"
                          className="p-0!"
                          onClick={() =>
                            navigate({ to: BILLING_PATH.invoice(r.invoiceId) })
                          }
                        >
                          {r.number}
                        </Button>
                      ),
                    },
                    { title: "Client", dataIndex: "clientName" },
                    { title: "Invoice date", dataIndex: "invoiceDate" },
                    {
                      title: "Expected withheld",
                      key: "expected",
                      align: "right",
                      render: (_, r) => peso(r.expected),
                    },
                    {
                      title: "Received",
                      key: "received",
                      align: "right",
                      render: (_, r) => peso(r.received),
                    },
                  ]}
                />
              ),
            },
          ]}
        />
      </div>

      <Modal
        title={noteFor ? `Follow-up — ${noteFor.number}` : ""}
        open={!!noteFor}
        okText="Save"
        confirmLoading={addNote.isPending}
        onCancel={() => setNoteFor(null)}
        onOk={() => noteForm.submit()}
        destroyOnHidden
      >
        <Form
          form={noteForm}
          layout="vertical"
          onFinish={submitNote}
          initialValues={{ kind: "Call" }}
        >
          <Form.Item label="How" name="kind">
            <Select options={CONTACT_KINDS} />
          </Form.Item>
          <Form.Item
            label="Person contacted"
            name="contact"
            rules={[{ required: true, message: "Who did you speak to?" }]}
          >
            <Input maxLength={200} />
          </Form.Item>
          <Form.Item
            label="What was said"
            name="note"
            rules={[{ required: true, message: "Write a short note." }]}
          >
            <Input.TextArea rows={3} maxLength={1000} />
          </Form.Item>
          <Form.Item label="Promised payment date" name="promisedDate">
            <DatePicker className="w-full" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
