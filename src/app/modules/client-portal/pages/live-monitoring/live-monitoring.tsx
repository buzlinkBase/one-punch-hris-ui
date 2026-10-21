import { useState } from "react";
import {
  Alert,
  Button,
  Collapse,
  Drawer,
  Empty,
  Input,
  Progress,
  Table,
  Tag,
  Typography,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { ClockCircleOutlined, WarningOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { getNotify } from "@/shared/utils/notify";
import { PermissionGate } from "@/shared/components/permission-gate/permission-gate";
import {
  useAgencyLive,
  useClientLive,
  useCoverageAlertSettings,
  useSaveCoverageAlertSettings,
} from "../../hooks/use-live-queries";
import { OPERATIONS_PERMISSION } from "../../constants/label.const";
import type {
  AgencyClientLive,
  GuardLiveStatus,
  LiveGuard,
  LiveTiles,
  ShiftPhase,
  UncoveredShift,
} from "../../models/api/live.model";

const { Title, Text } = Typography;

const time = (value: string | null) =>
  value ? dayjs(value).format("h:mm A") : "—";
const percent = (rate: number | null) =>
  rate === null ? "—" : `${Math.round(rate * 100)}%`;

const PHASE: Record<ShiftPhase, { label: string; color: string }> = {
  Upcoming: { label: "Upcoming", color: "default" },
  InProgress: { label: "In progress", color: "blue" },
  Ended: { label: "Ended", color: "default" },
};

const GUARD_STATUS: Record<GuardLiveStatus, { label: string; color: string }> =
  {
    OnDuty: { label: "On duty", color: "green" },
    Late: { label: "Late", color: "orange" },
    Undertime: { label: "Left early", color: "volcano" },
    OffDuty: { label: "Off duty", color: "default" },
  };

function Tile({
  label,
  value,
  tone,
}: {
  label: string;
  value: string | number;
  tone?: "warn" | "bad" | "good";
}) {
  const color =
    tone === "bad"
      ? "text-red-600"
      : tone === "warn"
        ? "text-amber-600"
        : tone === "good"
          ? "text-emerald-600"
          : "text-gray-900";
  return (
    <div className="rounded-lg border border-gray-100 bg-gray-50 p-3">
      <div className="text-xs text-gray-500">{label}</div>
      <div className={`text-2xl font-semibold ${color}`}>{value}</div>
    </div>
  );
}

function Tiles({ tiles }: { tiles: LiveTiles | undefined }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
      <Tile label="Required" value={tiles?.required ?? "—"} />
      <Tile label="On duty" value={tiles?.onDuty ?? "—"} tone="good" />
      <Tile label="Clocked in" value={tiles?.present ?? "—"} />
      <Tile
        label="Late"
        value={tiles?.late ?? "—"}
        tone={tiles?.late ? "warn" : undefined}
      />
      <Tile
        label="Left early"
        value={tiles?.undertime ?? "—"}
        tone={tiles?.undertime ? "warn" : undefined}
      />
      <Tile label="Not yet in" value={tiles?.notYetIn ?? "—"} />
      <Tile
        label="Absent"
        value={tiles?.absent ?? "—"}
        tone={tiles?.absent ? "bad" : undefined}
      />
      <Tile
        label="Posts filled"
        value={percent(tiles?.fillRate ?? null)}
        tone={
          tiles?.fillRate === null || tiles?.fillRate === undefined
            ? undefined
            : tiles.fillRate >= 1
              ? "good"
              : "bad"
        }
      />
    </div>
  );
}

/** Who gets the email when a shift is still short of people some time after it started. */
function AlertAddresses() {
  const settings = useCoverageAlertSettings();
  const save = useSaveCoverageAlertSettings();
  const [draft, setDraft] = useState<string | null>(null);
  const value = draft ?? settings.data?.emails ?? "";

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-lg bg-white p-4">
      <Text strong>Email &quot;post not covered&quot; alerts to</Text>
      <Input
        className="max-w-md"
        placeholder="ops@company.com, supervisor@company.com"
        value={value}
        disabled={settings.isLoading}
        onChange={(e) => setDraft(e.target.value)}
      />
      <PermissionGate permission={OPERATIONS_PERMISSION.MANAGE}>
        <Button
          loading={save.isPending}
          disabled={draft === null}
          onClick={async () => {
            await save.mutateAsync(value);
            setDraft(null);
            getNotify().success({ message: "Alert addresses saved." });
          }}
        >
          Save
        </Button>
      </PermissionGate>
      <Text type="secondary" className="w-full text-xs">
        The client&apos;s portal users with time-log access get a notice in
        their bell at the same time.
      </Text>
    </div>
  );
}

const guardColumns: ColumnsType<LiveGuard> = [
  { title: "Guard", dataIndex: "guardName", key: "guard" },
  {
    title: "Role",
    key: "role",
    render: (_, g) => g.role ?? <Text type="secondary">Not deployed here</Text>,
  },
  { title: "In", key: "in", render: (_, g) => time(g.in) },
  { title: "Out", key: "out", render: (_, g) => time(g.out) },
  {
    title: "Status",
    key: "status",
    render: (_, g) => (
      <div className="flex flex-wrap gap-1">
        <Tag color={GUARD_STATUS[g.status].color}>
          {GUARD_STATUS[g.status].label}
        </Tag>
        {g.lateMinutes > 0 ? (
          <Tag color="orange">{g.lateMinutes}m late</Tag>
        ) : null}
        {g.undertimeMinutes > 0 ? (
          <Tag color="volcano">{g.undertimeMinutes}m early</Tag>
        ) : null}
      </div>
    ),
  },
];

/** One client's shifts today, who is missing and the latest punches. */
function ClientDrawer({
  client,
  onClose,
}: {
  client: AgencyClientLive | null;
  onClose: () => void;
}) {
  const today = useClientLive(client?.clientId);
  const data = today.data;

  return (
    <Drawer
      open={!!client}
      onClose={onClose}
      size="large"
      title={client ? `${client.clientName} — today` : ""}
      destroyOnHidden
    >
      {data ? (
        <div className="flex flex-col gap-4">
          <Tiles tiles={data.tiles} />
          {!data.hasPlan ? (
            <Alert
              type="info"
              showIcon
              title="No manning was sent for today. Send it from Setup > Deployment, or wait for the nightly send."
            />
          ) : null}

          <div>
            <Title level={5}>Shifts</Title>
            {data.shifts.length === 0 ? (
              <Empty description="No shifts today" />
            ) : (
              <Collapse
                size="small"
                items={data.shifts.map((s) => ({
                  key: s.shiftId,
                  label: (
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium">
                        {s.postName} · {s.shiftName}
                        {s.start ? ` (${time(s.start)}–${time(s.end)})` : ""}
                      </span>
                      <Text type="secondary" className="text-xs">
                        {s.siteName}
                      </Text>
                      <Tag color={PHASE[s.phase].color}>
                        {PHASE[s.phase].label}
                      </Tag>
                      <span className="ml-auto">
                        {s.present} / {s.required}
                      </span>
                      {s.short > 0 ? (
                        <Tag color="red">{s.short} short</Tag>
                      ) : null}
                    </div>
                  ),
                  children:
                    s.guards.length === 0 ? (
                      <Empty description="Nobody has clocked in for this shift" />
                    ) : (
                      <Table
                        rowKey="guardId"
                        size="small"
                        pagination={false}
                        dataSource={s.guards}
                        columns={guardColumns}
                        scroll={{ x: "max-content" }}
                      />
                    ),
                }))}
              />
            )}
          </div>

          <div>
            <Title level={5}>Missing from their post</Title>
            {data.missing.length === 0 ? (
              <Empty description="Everyone deployed is accounted for" />
            ) : (
              <Table
                rowKey={(m) => `${m.guardId}-${m.postId}`}
                size="small"
                pagination={false}
                dataSource={data.missing}
                scroll={{ x: "max-content" }}
                columns={[
                  { title: "Guard", dataIndex: "guardName", key: "guard" },
                  { title: "Post", dataIndex: "postName", key: "post" },
                  { title: "Site", dataIndex: "siteName", key: "site" },
                  { title: "Role", dataIndex: "role", key: "role" },
                  {
                    title: "",
                    key: "state",
                    render: (_, m) => (
                      <Tag color={m.absent ? "red" : "default"}>
                        {m.absent ? "Absent" : "Not yet in"}
                      </Tag>
                    ),
                  },
                ]}
              />
            )}
          </div>

          <div>
            <Title level={5}>Latest punches</Title>
            <Table
              rowKey="id"
              size="small"
              pagination={{ pageSize: 10 }}
              dataSource={data.log}
              scroll={{ x: "max-content" }}
              locale={{ emptyText: "No punches since yesterday noon" }}
              columns={[
                {
                  title: "Time",
                  key: "at",
                  render: (_, p) => dayjs(p.at).format("MMM D, HH:mm"),
                },
                { title: "Guard", dataIndex: "guardName", key: "guard" },
                {
                  title: "Where",
                  key: "where",
                  render: (_, p) =>
                    `${p.postName ? `${p.postName} · ` : ""}${p.siteName}`,
                },
                {
                  title: "Source",
                  key: "source",
                  render: (_, p) =>
                    p.device ? `${p.source} · ${p.device}` : p.source,
                },
              ]}
            />
          </div>
        </div>
      ) : (
        <Empty description={today.isLoading ? "Loading…" : "No data"} />
      )}
    </Drawer>
  );
}

/** Client Portal > Live Monitoring: every client's posts right now, the shifts not covered, and a client's detail on click. */
export default function LiveMonitoring() {
  const live = useAgencyLive();
  const [selected, setSelected] = useState<AgencyClientLive | null>(null);
  const data = live.data;

  const uncoveredColumns: ColumnsType<UncoveredShift> = [
    { title: "Client", dataIndex: "clientName", key: "client" },
    { title: "Site", dataIndex: "siteName", key: "site" },
    { title: "Post", dataIndex: "postName", key: "post" },
    {
      title: "Shift",
      key: "shift",
      render: (_, s) => `${s.shiftName} · ${time(s.start)}`,
    },
    {
      title: "Clocked in",
      key: "present",
      render: (_, s) => `${s.present} / ${s.required}`,
    },
    {
      title: "",
      key: "short",
      render: (_, s) => <Tag color="red">{s.short} short</Tag>,
    },
  ];

  const clientColumns: ColumnsType<AgencyClientLive> = [
    { title: "Client", dataIndex: "clientName", key: "client" },
    {
      title: "Posts filled",
      key: "fill",
      render: (_, c) =>
        c.tiles.fillRate === null ? (
          <Text type="secondary">Not started</Text>
        ) : (
          <div className="min-w-40">
            <Progress
              size="small"
              percent={Math.round(c.tiles.fillRate * 100)}
              status={c.tiles.fillRate < 1 ? "exception" : "success"}
            />
          </div>
        ),
    },
    {
      title: "Required",
      key: "required",
      align: "right",
      render: (_, c) => c.tiles.required,
    },
    {
      title: "On duty",
      key: "onDuty",
      align: "right",
      render: (_, c) => c.tiles.onDuty,
    },
    {
      title: "Late",
      key: "late",
      align: "right",
      render: (_, c) => c.tiles.late,
    },
    {
      title: "Absent",
      key: "absent",
      align: "right",
      render: (_, c) => c.tiles.absent,
    },
    {
      title: "",
      key: "uncovered",
      render: (_, c) =>
        c.uncovered > 0 ? (
          <Tag color="red" icon={<WarningOutlined />}>
            {c.uncovered} not covered
          </Tag>
        ) : (
          <Tag color="green">Covered</Tag>
        ),
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end gap-2">
        <Title level={3} className="m-0! mr-auto">
          Live Monitoring
        </Title>
        <Text type="secondary">
          <ClockCircleOutlined />{" "}
          {data ? `As of ${time(data.asOf)}` : "Loading…"}
        </Text>
      </div>

      <AlertAddresses />

      <div className="rounded-lg bg-white p-4">
        <Tiles tiles={data?.tiles} />
      </div>

      <div className="rounded-lg bg-white p-4">
        <Title level={5}>Posts not covered now</Title>
        <Table
          rowKey="shiftId"
          size="small"
          loading={live.isLoading}
          pagination={false}
          dataSource={data?.uncovered ?? []}
          columns={uncoveredColumns}
          scroll={{ x: "max-content" }}
          locale={{
            emptyText: (
              <Empty description="Every shift in progress is covered" />
            ),
          }}
        />
      </div>

      <div className="rounded-lg bg-white p-4">
        <Title level={5}>Clients today</Title>
        <Table
          rowKey="clientId"
          size="small"
          loading={live.isLoading}
          pagination={false}
          dataSource={data?.clients ?? []}
          columns={clientColumns}
          scroll={{ x: "max-content" }}
          onRow={(c) => ({
            onClick: () => setSelected(c),
            className: "cursor-pointer",
          })}
          locale={{
            emptyText: (
              <Empty description="No shifts planned today. Manning comes from Setup > Deployment." />
            ),
          }}
        />
      </div>

      <ClientDrawer client={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
