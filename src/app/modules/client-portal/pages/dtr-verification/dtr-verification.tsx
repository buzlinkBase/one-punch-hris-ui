import { useState } from "react";
import {
  Alert,
  Button,
  Modal,
  Select,
  Table,
  Tabs,
  Tag,
  Typography,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { CheckCircleOutlined, LockOutlined } from "@ant-design/icons";
import dayjs, { type Dayjs } from "dayjs";
import { getNotify } from "@/shared/utils/notify";
import { MobileRangePicker } from "@/shared/components/mobile-range-picker";
import { PermissionGate } from "@/shared/components/permission-gate/permission-gate";
import {
  usePortalClients,
  usePortalFlags,
  usePortalPeriods,
  usePreviewPortalPeriod,
  useReopenPortalPeriod,
  useResolvePortalFlag,
  useVerifyPortalPeriod,
} from "../../hooks/use-client-portal-queries";
import {
  ANOMALY_LABEL,
  CLIENT_PORTAL_LABEL,
  CLIENT_PORTAL_PERMISSION,
} from "../../constants/label.const";
import type {
  BlockingRecord,
  ClientFlag,
  DtrPeriod,
} from "../../models/api/response/client-portal-response.model";

const { Title, Text } = Typography;
const DATE = "YYYY-MM-DD";

export default function DtrVerification() {
  const clients = usePortalClients();
  const [clientId, setClientId] = useState<string | undefined>();
  const [range, setRange] = useState<[Dayjs, Dayjs]>([
    dayjs().startOf("month"),
    dayjs(),
  ]);
  const [blockers, setBlockers] = useState<BlockingRecord[] | null>(null);
  const [showResolved, setShowResolved] = useState(false);

  const periods = usePortalPeriods(clientId);
  const flags = usePortalFlags(clientId, showResolved);
  const preview = usePreviewPortalPeriod();
  const verify = useVerifyPortalPeriod();
  const reopen = useReopenPortalPeriod();
  const resolve = useResolvePortalFlag();

  const request = () => ({
    clientId: clientId!,
    from: range[0].format(DATE),
    to: range[1].format(DATE),
    siteId: null,
  });

  const check = async () => setBlockers(await preview.mutateAsync(request()));

  const confirmVerify = () => {
    Modal.confirm({
      title: "Verify and lock this period?",
      content: `Time logs from ${range[0].format(DATE)} to ${range[1].format(DATE)} will be locked. No system can change them afterwards, and the client will be asked to sign them off.`,
      okText: "Verify and lock",
      onOk: async () => {
        await verify.mutateAsync(request());
        setBlockers(null);
        getNotify().success({
          message: "Period verified and sent for client sign-off.",
        });
      },
    });
  };

  const confirmReopen = (period: DtrPeriod) => {
    Modal.confirm({
      title: "Reopen this period?",
      content: "The time logs unlock and the source can correct them again.",
      okText: "Reopen",
      onOk: () => reopen.mutateAsync(period.id),
    });
  };

  const periodColumns: ColumnsType<DtrPeriod> = [
    {
      title: "Period",
      key: "period",
      render: (_, p) => `${p.from} → ${p.to}`,
    },
    {
      title: "Status",
      key: "status",
      render: (_, p) =>
        p.status === "SignedOff" ? (
          <Tag color="green" icon={<CheckCircleOutlined />}>
            Signed off by {p.signedOffBy}
          </Tag>
        ) : (
          <Tag color="blue" icon={<LockOutlined />}>
            Waiting for client sign-off
          </Tag>
        ),
    },
    {
      title: "Verified",
      key: "verified",
      render: (_, p) =>
        `${p.verifiedBy}, ${dayjs(p.verifiedAt).format("MMM D, YYYY h:mm A")}`,
    },
    {
      title: "",
      key: "actions",
      align: "right",
      render: (_, p) =>
        p.status === "Verified" ? (
          <PermissionGate permission={CLIENT_PORTAL_PERMISSION.MANAGE}>
            <Button size="small" onClick={() => confirmReopen(p)}>
              Reopen
            </Button>
          </PermissionGate>
        ) : null,
    },
  ];

  const flagColumns: ColumnsType<ClientFlag> = [
    { title: "Date", dataIndex: "workDate", width: 110 },
    { title: "Site", dataIndex: "siteName" },
    { title: "Guard", dataIndex: "guardName" },
    {
      title: "Comment",
      key: "comment",
      render: (_, f) => (
        <div>
          <div>{f.comment}</div>
          <Text type="secondary" className="text-xs">
            {f.userName}, {dayjs(f.at).format("MMM D, h:mm A")}
          </Text>
        </div>
      ),
    },
    {
      title: "",
      key: "actions",
      align: "right",
      render: (_, f) =>
        f.resolved ? (
          <Tag color="green">Resolved</Tag>
        ) : (
          <PermissionGate permission={CLIENT_PORTAL_PERMISSION.MANAGE}>
            <Button size="small" onClick={() => resolve.mutate(f.id)}>
              Mark resolved
            </Button>
          </PermissionGate>
        ),
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div>
        <Title level={3} className="m-0!">
          {CLIENT_PORTAL_LABEL.VERIFICATION_TITLE}
        </Title>
        <Text type="secondary">
          {CLIENT_PORTAL_LABEL.VERIFICATION_SUBTITLE}
        </Text>
      </div>

      <div className="flex flex-wrap items-center gap-3 rounded-lg bg-white p-4">
        <Select
          showSearch
          optionFilterProp="label"
          placeholder="Choose a client"
          className="min-w-64"
          value={clientId}
          loading={clients.isLoading}
          options={(clients.data ?? []).map((c) => ({
            value: c.id,
            label: `${c.name} (${c.code})`,
          }))}
          onChange={(value) => {
            setClientId(value);
            setBlockers(null);
          }}
        />
        <MobileRangePicker
          value={range}
          allowClear={false}
          onChange={(value) => {
            if (value?.[0] && value[1]) {
              setRange([value[0], value[1]]);
              setBlockers(null);
            }
          }}
        />
        <Button
          disabled={!clientId}
          loading={preview.isPending}
          onClick={check}
        >
          Check logs
        </Button>
        <PermissionGate permission={CLIENT_PORTAL_PERMISSION.MANAGE}>
          <Button
            type="primary"
            icon={<LockOutlined />}
            disabled={!clientId || blockers === null || blockers.length > 0}
            loading={verify.isPending}
            onClick={confirmVerify}
          >
            Verify and lock
          </Button>
        </PermissionGate>
      </div>

      {blockers !== null &&
        (blockers.length === 0 ? (
          <Alert
            type="success"
            showIcon
            message="No missing or duplicate punches. This period can be verified."
          />
        ) : (
          <Alert
            type="error"
            showIcon
            message={`${blockers.length} time log(s) must be corrected at the source before this period can be verified.`}
            description={
              <ul className="m-0 pl-4">
                {blockers.slice(0, 10).map((b, i) => (
                  <li key={`${b.recordId}-${i}`}>
                    {b.workDate} · {b.guardName} ·{" "}
                    {ANOMALY_LABEL[b.type] ?? b.type}
                  </li>
                ))}
                {blockers.length > 10 && (
                  <li>…and {blockers.length - 10} more</li>
                )}
              </ul>
            }
          />
        ))}

      <Tabs
        items={[
          {
            key: "periods",
            label: "Verified periods",
            children: (
              <Table<DtrPeriod>
                rowKey="id"
                loading={periods.isLoading}
                dataSource={periods.data ?? []}
                columns={periodColumns}
                scroll={{ x: "max-content" }}
                pagination={false}
              />
            ),
          },
          {
            key: "flags",
            label: "Client comments",
            children: (
              <div className="flex flex-col gap-2">
                <Button
                  size="small"
                  className="self-start"
                  onClick={() => setShowResolved((v) => !v)}
                >
                  {showResolved ? "Hide resolved" : "Show resolved"}
                </Button>
                <Table<ClientFlag>
                  rowKey="id"
                  loading={flags.isLoading}
                  dataSource={flags.data ?? []}
                  columns={flagColumns}
                  scroll={{ x: "max-content" }}
                  pagination={false}
                />
              </div>
            ),
          },
        ]}
      />
    </div>
  );
}
