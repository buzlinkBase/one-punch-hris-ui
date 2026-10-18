import { useState } from "react";
import { Button, Select, Table, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  DownloadOutlined,
  MailOutlined,
  PrinterOutlined,
} from "@ant-design/icons";
import dayjs, { type Dayjs } from "dayjs";
import { getNotify } from "@/shared/utils/notify";
import { MobileRangePicker } from "@/shared/components/mobile-range-picker";
import { PermissionGate } from "@/shared/components/permission-gate/permission-gate";
import { downloadMultiSheetExcel } from "@/shared/utils/export.utils";
import {
  useEmailStatement,
  usePortalClients,
  useStatement,
} from "../../hooks/use-client-portal-queries";
import { clientPortalApi } from "../../services/client-portal.api";
import { BILLING_PERMISSION, peso } from "../../constants/label.const";
import { openBlobInNewTab } from "../../utils/open-blob";
import type { StatementLine } from "../../models/api/response/client-portal-response.model";

const { Title, Text } = Typography;
const DATE = "YYYY-MM-DD";

export default function Statements() {
  const clients = usePortalClients();
  const [clientId, setClientId] = useState<string | undefined>();
  const [range, setRange] = useState<[Dayjs, Dayjs]>([
    dayjs().startOf("month"),
    dayjs(),
  ]);
  const from = range[0].format(DATE);
  const to = range[1].format(DATE);
  const statement = useStatement(clientId, from, to);
  const email = useEmailStatement();
  const s = statement.data;

  const columns: ColumnsType<StatementLine> = [
    { title: "Date", dataIndex: "date", width: 120 },
    { title: "Type", dataIndex: "type" },
    { title: "Reference", dataIndex: "reference" },
    {
      title: "Billed",
      key: "debit",
      align: "right",
      render: (_, l) => (l.debit ? peso(l.debit) : ""),
    },
    {
      title: "Paid / credited",
      key: "credit",
      align: "right",
      render: (_, l) => (l.credit ? peso(l.credit) : ""),
    },
    {
      title: "Balance",
      key: "balance",
      align: "right",
      render: (_, l) => peso(l.balance),
    },
  ];

  const print = async () => {
    if (!clientId) return;
    const blob = await clientPortalApi.fetchBlob(
      `statements/print?clientId=${clientId}&from=${from}&to=${to}`,
    );
    openBlobInNewTab(blob, "text/html");
  };

  const send = async () => {
    if (!clientId) return;
    const result = await email.mutateAsync({ clientId, from, to });
    getNotify().success({
      message: `Statement emailed to ${result.sentTo} contact${result.sentTo === 1 ? "" : "s"}.`,
    });
  };

  const exportExcel = () => {
    if (!s) return;
    downloadMultiSheetExcel(
      [
        {
          name: "Statement",
          headers: [
            "Date",
            "Type",
            "Reference",
            "Billed",
            "Paid / credited",
            "Balance",
          ],
          rows: [
            ["", "Balance brought forward", "", "", "", s.openingBalance],
            ...s.lines.map((l) => [
              l.date,
              l.type,
              l.reference,
              l.debit,
              l.credit,
              l.balance,
            ]),
          ],
          numberFormat: "#,##0.00",
        },
      ],
      `statement-${s.clientName}-${from}-${to}.xlsx`,
    );
  };

  return (
    <div className="flex flex-col gap-4">
      <div>
        <Title level={3} className="m-0!">
          Statements of Account
        </Title>
        <Text type="secondary">
          Everything billed, adjusted and paid for a client over a period, with
          the balance due.
        </Text>
      </div>

      <div className="flex flex-wrap items-center gap-3 rounded-lg bg-white p-4">
        <Select
          showSearch
          optionFilterProp="label"
          placeholder="Choose a client"
          className="min-w-64"
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
        <Button icon={<PrinterOutlined />} disabled={!s} onClick={print}>
          View / print
        </Button>
        <Button icon={<DownloadOutlined />} disabled={!s} onClick={exportExcel}>
          Excel
        </Button>
        <PermissionGate permission={BILLING_PERMISSION.ISSUE}>
          <Button
            icon={<MailOutlined />}
            disabled={!s}
            loading={email.isPending}
            onClick={send}
          >
            Email to client
          </Button>
        </PermissionGate>
      </div>

      {s && (
        <div className="rounded-lg bg-white p-4">
          <Table<StatementLine>
            rowKey={(l) => `${l.date}-${l.type}-${l.reference}`}
            size="small"
            loading={statement.isFetching}
            dataSource={s.lines}
            columns={columns}
            scroll={{ x: "max-content" }}
            pagination={false}
            title={() => (
              <Text type="secondary">
                Balance brought forward: <b>{peso(s.openingBalance)}</b>
              </Text>
            )}
            footer={() => (
              <div className="text-right">
                Balance due: <b>{peso(s.closingBalance)}</b>
              </div>
            )}
          />
        </div>
      )}
    </div>
  );
}
