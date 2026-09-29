import { useState } from "react";
import {
  Alert,
  Button,
  Card,
  Collapse,
  Input,
  Progress,
  Result,
  Segmented,
  Select,
  Skeleton,
  Statistic,
  Table,
  Tabs,
  Tag,
  Tooltip,
  Typography,
  message,
} from "antd";
import type { ColumnsType, TablePaginationConfig } from "antd/es/table";
import type { SorterResult } from "antd/es/table/interface";
import {
  ArrowLeftOutlined,
  CheckCircleOutlined,
  DownloadOutlined,
  EditOutlined,
  EyeOutlined,
  TeamOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import { useNavigate } from "@tanstack/react-router";
import dayjs from "dayjs";
import { useRouteParams } from "@/shared/hooks/use-route-params";
import { LinkifiedText } from "@/shared/components/linkified-text/linkified-text";
import { PermissionGate } from "@/shared/components/permission-gate/permission-gate";
import { downloadMultiSheetExcel } from "@/shared/utils/export.utils";
import { ANNOUNCEMENT_PRIORITY_COLOR } from "@/shared/types/announcement.model";
import {
  useAnnouncement,
  useAnnouncementRecipients,
  useAnnouncementStats,
} from "../../hooks/use-announcement-queries";
import { announcementApi } from "../../services/announcement.api";
import type {
  RecipientListQuery,
  RecipientStatusFilter,
} from "../../models/api/request/announcement-request.model";
import type {
  AnnouncementRecipient,
  BreakdownRow,
} from "../../models/api/response/announcement-response.model";
import {
  ANNOUNCEMENT_PATH,
  ANNOUNCEMENT_PERMISSION,
  STATE_TAG,
} from "../../constants/label.const";
import { AnnouncementActions } from "../../components/announcement-actions/announcement-actions";

const { Title, Text } = Typography;

const PAGE_SIZE = 20;
const formatDateTime = (value: string | null) =>
  value ? dayjs(value).format("MMM D, YYYY h:mm A") : "";
const percent = (part: number, whole: number) =>
  whole === 0 ? 0 : Math.round((part / whole) * 100);

export default function AnnouncementReport() {
  const { id } = useRouteParams<{ id?: string }>();
  const navigate = useNavigate();
  const { data: announcement, isLoading, isError } = useAnnouncement(id);
  const { data: stats } = useAnnouncementStats(id);

  const [query, setQuery] = useState<RecipientListQuery>({
    status: "All",
    page: 1,
    limit: PAGE_SIZE,
  });
  const { data: recipients, isFetching } = useAnnouncementRecipients(id, query);
  const [exporting, setExporting] = useState(false);

  if (isLoading) {
    return (
      <div className="content-page">
        <Skeleton active paragraph={{ rows: 12 }} />
      </div>
    );
  }
  if (isError || !announcement) {
    return (
      <div className="content-page">
        <Result status="404" title="Announcement not found" />
      </div>
    );
  }

  const requiresAck = announcement.requiresAcknowledgement;
  const statusOptions: { value: RecipientStatusFilter; label: string }[] = [
    { value: "All", label: `All (${stats?.reach ?? 0})` },
    { value: "Viewed", label: `Viewed (${stats?.viewed ?? 0})` },
    { value: "NotViewed", label: `Not viewed (${stats?.notViewed ?? 0})` },
    ...(requiresAck
      ? ([
          {
            value: "Acknowledged",
            label: `Acknowledged (${stats?.acknowledged ?? 0})`,
          },
          {
            value: "NotAcknowledged",
            label: `Pending (${stats?.pendingAcknowledgement ?? 0})`,
          },
          ...((stats?.overdue ?? 0) > 0
            ? [
                {
                  value: "Overdue" as const,
                  label: `Overdue (${stats?.overdue ?? 0})`,
                },
              ]
            : []),
        ] as { value: RecipientStatusFilter; label: string }[])
      : []),
    ...((stats?.unreachable ?? 0) > 0
      ? [
          {
            value: "Unreachable" as const,
            label: `No login (${stats?.unreachable ?? 0})`,
          },
        ]
      : []),
  ];

  const recipientColumns: ColumnsType<AnnouncementRecipient> = [
    {
      title: "Employee",
      key: "name",
      sorter: true,
      render: (_, r) => (
        <div className="flex flex-col">
          <Text>{r.employeeName}</Text>
          <Text type="secondary" className="text-xs">
            {r.employeeNo}
            {!r.isReachable && (
              <Tooltip title="No login account yet -- they can't open it until one is linked.">
                <Tag color="default" className="ml-2">
                  No login
                </Tag>
              </Tooltip>
            )}
          </Text>
        </div>
      ),
    },
    {
      title: "Department",
      dataIndex: "departmentName",
      key: "department",
      sorter: true,
      render: (value: string, r) => (
        <div className="flex flex-col">
          <Text>{value || "—"}</Text>
          <Text type="secondary" className="text-xs">
            {[r.positionName, r.branchName].filter(Boolean).join(" · ")}
          </Text>
        </div>
      ),
    },
    {
      title: "Viewed",
      key: "firstViewedAt",
      sorter: true,
      render: (_, r) =>
        r.firstViewedAt ? (
          <Tooltip
            title={`Opened ${r.viewCount} time${r.viewCount === 1 ? "" : "s"} · last ${formatDateTime(r.lastViewedAt)}`}
          >
            <span className="inline-flex items-center gap-1">
              <EyeOutlined className="text-(--ant-color-success)" />
              {formatDateTime(r.firstViewedAt)}
            </span>
          </Tooltip>
        ) : (
          <Text type="secondary">Not yet</Text>
        ),
    },
    ...(requiresAck
      ? [
          {
            title: "Acknowledged",
            key: "acknowledgedAt",
            sorter: true,
            render: (_: unknown, r: AnnouncementRecipient) =>
              r.isAcknowledged ? (
                <span className="inline-flex items-center gap-1">
                  <CheckCircleOutlined className="text-(--ant-color-success)" />
                  {formatDateTime(r.acknowledgedAt)}
                </span>
              ) : r.acknowledgedVersion ? (
                <Tooltip
                  title={`Acknowledged version ${r.acknowledgedVersion} on ${formatDateTime(r.acknowledgedAt)}`}
                >
                  <Tag color="orange">Needs to re-acknowledge</Tag>
                </Tooltip>
              ) : r.isOverdue ? (
                <Tag color="red">Overdue</Tag>
              ) : (
                <Text type="secondary">Pending</Text>
              ),
          } as ColumnsType<AnnouncementRecipient>[number],
        ]
      : []),
    {
      title: "Reminders",
      key: "reminders",
      width: 110,
      render: (_, r) =>
        r.remindCount > 0 ? (
          <Tooltip title={`Last ${formatDateTime(r.lastRemindedAt)}`}>
            <Tag>{r.remindCount}</Tag>
          </Tooltip>
        ) : (
          <Text type="secondary">—</Text>
        ),
    },
  ];

  const breakdownColumns: ColumnsType<BreakdownRow> = [
    { title: "Group", dataIndex: "name", key: "name" },
    { title: "People", dataIndex: "total", key: "total", width: 90 },
    {
      title: "Viewed",
      key: "viewed",
      width: 200,
      render: (_, r) => (
        <Progress
          percent={percent(r.viewed, r.total)}
          size="small"
          format={() => `${r.viewed}/${r.total}`}
        />
      ),
    },
    ...(requiresAck
      ? [
          {
            title: "Acknowledged",
            key: "acknowledged",
            width: 200,
            render: (_: unknown, r: BreakdownRow) => (
              <Progress
                percent={percent(r.acknowledged, r.total)}
                size="small"
                format={() => `${r.acknowledged}/${r.total}`}
              />
            ),
          } as ColumnsType<BreakdownRow>[number],
        ]
      : []),
  ];

  const onTableChange = (
    pagination: TablePaginationConfig,
    _filters: unknown,
    sorter:
      | SorterResult<AnnouncementRecipient>
      | SorterResult<AnnouncementRecipient>[],
  ) => {
    const s = Array.isArray(sorter) ? sorter[0] : sorter;
    setQuery((q) => ({
      ...q,
      page: pagination.current ?? 1,
      sortField: s?.order
        ? (s.columnKey as RecipientListQuery["sortField"])
        : undefined,
      sortOrder: s?.order ?? undefined,
    }));
  };

  const exportExcel = async () => {
    if (!id || !stats) return;
    setExporting(true);
    try {
      const all = await announcementApi.recipients(id, {
        status: "All",
        page: 1,
        limit: 0,
      });
      const summaryRows: string[][] = [
        ["Title", announcement.title],
        ["Status", STATE_TAG[announcement.state].label],
        ["Published", formatDateTime(announcement.publishedAtUtc)],
        ["Published by", announcement.publishedByName ?? ""],
        ["Audience", announcement.audienceSummary.join(", ")],
        ["Recipients", String(stats.reach)],
        ["Viewed", `${stats.viewed} (${stats.viewRate}%)`],
        ...(requiresAck
          ? [
              [
                "Acknowledged",
                `${stats.acknowledged} (${stats.acknowledgementRate}%)`,
              ],
              ["Acknowledge by", formatDateTime(announcement.acknowledgeByUtc)],
              ["Overdue", String(stats.overdue)],
            ]
          : []),
        ["No login account", String(stats.unreachable)],
      ];
      downloadMultiSheetExcel(
        [
          { name: "Summary", headers: ["", ""], rows: summaryRows },
          {
            name: "Recipients",
            headers: [
              "Employee No.",
              "Employee",
              "Department",
              "Position",
              "Branch",
              "Has login",
              "First viewed",
              "Last viewed",
              "Times opened",
              ...(requiresAck ? ["Acknowledged", "Acknowledged at"] : []),
              "Reminders sent",
            ],
            rows: (all.data ?? []).map((r) => [
              r.employeeNo,
              r.employeeName,
              r.departmentName,
              r.positionName,
              r.branchName,
              r.isReachable ? "Yes" : "No",
              formatDateTime(r.firstViewedAt),
              formatDateTime(r.lastViewedAt),
              String(r.viewCount),
              ...(requiresAck
                ? [
                    r.isAcknowledged
                      ? "Yes"
                      : r.acknowledgedVersion
                        ? "Needs re-acknowledgement"
                        : r.isOverdue
                          ? "Overdue"
                          : "No",
                    formatDateTime(r.acknowledgedAt),
                  ]
                : []),
              String(r.remindCount),
            ]),
          },
          {
            name: "By Department",
            headers: [
              "Department",
              "People",
              "Viewed",
              ...(requiresAck ? ["Acknowledged"] : []),
            ],
            rows: stats.byDepartment.map((d) => [
              d.name,
              String(d.total),
              String(d.viewed),
              ...(requiresAck ? [String(d.acknowledged)] : []),
            ]),
          },
        ],
        `announcement-${dayjs().format("YYYYMMDD-HHmm")}.xlsx`,
      );
    } catch {
      message.error("Couldn't export the report.");
    } finally {
      setExporting(false);
    }
  };

  const departments = stats?.byDepartment.map((d) => d.name) ?? [];

  return (
    <div className="content-page">
      <div className="page-toolbar">
        <div className="page-toolbar-row">
          <div className="flex min-w-0 items-center gap-2">
            <Button
              type="text"
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate({ to: ANNOUNCEMENT_PATH.LIST })}
              aria-label="Back"
            />
            <div className="min-w-0">
              <Title level={4} className="mb-0! truncate">
                {announcement.title}
              </Title>
              <div className="mt-1 flex flex-wrap items-center gap-1">
                <Tag color={STATE_TAG[announcement.state].color}>
                  {announcement.isExpired
                    ? "Expired"
                    : STATE_TAG[announcement.state].label}
                </Tag>
                {announcement.priority !== "Normal" && (
                  <Tag
                    color={ANNOUNCEMENT_PRIORITY_COLOR[announcement.priority]}
                  >
                    {announcement.priority}
                  </Tag>
                )}
                {announcement.version > 1 && (
                  <Tag>Edited · v{announcement.version}</Tag>
                )}
                <Text type="secondary" className="text-xs">
                  {announcement.publishedAtUtc
                    ? `Published ${formatDateTime(announcement.publishedAtUtc)} by ${announcement.publishedByName}`
                    : `Drafted by ${announcement.createdByName}`}
                </Text>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {announcement.allowedActions.includes("Edit") && (
              <PermissionGate permission={ANNOUNCEMENT_PERMISSION.EDIT}>
                <Button
                  icon={<EditOutlined />}
                  onClick={() =>
                    navigate({ to: ANNOUNCEMENT_PATH.edit(announcement.id) })
                  }
                >
                  Edit
                </Button>
              </PermissionGate>
            )}
            <Button
              icon={<DownloadOutlined />}
              loading={exporting}
              disabled={!stats || stats.reach === 0}
              onClick={exportExcel}
            >
              Export
            </Button>
            <AnnouncementActions
              announcement={announcement}
              trigger="button"
              onRemoved={() => navigate({ to: ANNOUNCEMENT_PATH.LIST })}
            />
          </div>
        </div>
      </div>

      {announcement.state === "Unpublished" && (
        <Alert
          className="mb-4"
          type="warning"
          showIcon
          message={`Unpublished ${formatDateTime(announcement.unpublishedAtUtc)} by ${announcement.unpublishedByName ?? "—"}`}
          description={
            announcement.unpublishReason
              ? `Reason: ${announcement.unpublishReason}`
              : "Employees no longer see it. Republish to make it visible again."
          }
        />
      )}
      {announcement.state === "Deleted" && announcement.purgeAtUtc && (
        <Alert
          className="mb-4"
          type="error"
          showIcon
          message={`In Recently deleted — removed for good on ${formatDateTime(announcement.purgeAtUtc)} unless restored.`}
        />
      )}

      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Card size="small">
          <Statistic
            title="Reach"
            value={stats?.reach ?? 0}
            prefix={<TeamOutlined />}
          />
          {(stats?.unreachable ?? 0) > 0 && (
            <Text type="secondary" className="text-xs">
              {stats?.unreachable} without a login
            </Text>
          )}
        </Card>
        <Card size="small">
          <Statistic
            title="Viewed"
            value={stats?.viewRate ?? 0}
            suffix="%"
            prefix={<EyeOutlined />}
          />
          <Text type="secondary" className="text-xs">
            {stats?.viewed ?? 0} of {stats?.reach ?? 0}
          </Text>
        </Card>
        <Card size="small">
          <Statistic
            title="Acknowledged"
            value={requiresAck ? (stats?.acknowledgementRate ?? 0) : "—"}
            suffix={requiresAck ? "%" : undefined}
            prefix={<CheckCircleOutlined />}
          />
          <Text type="secondary" className="text-xs">
            {requiresAck
              ? `${stats?.acknowledged ?? 0} of ${stats?.reach ?? 0}${announcement.acknowledgeByUtc ? ` · due ${formatDateTime(announcement.acknowledgeByUtc)}` : ""}`
              : "Not requested"}
          </Text>
        </Card>
        <Card size="small">
          <Statistic
            title={requiresAck ? "Pending / overdue" : "Not viewed"}
            value={
              requiresAck
                ? `${stats?.pendingAcknowledgement ?? 0} / ${stats?.overdue ?? 0}`
                : (stats?.notViewed ?? 0)
            }
            prefix={<WarningOutlined />}
          />
        </Card>
      </div>

      <Collapse
        className="mb-4"
        size="small"
        items={[
          {
            key: "message",
            label: "Message & audience",
            children: (
              <div className="flex flex-col gap-3">
                <div className="flex flex-wrap gap-1">
                  {announcement.audienceSummary.map((label) => (
                    <Tag
                      key={label}
                      color={label.startsWith("Except ") ? "red" : "blue"}
                    >
                      {label}
                    </Tag>
                  ))}
                </div>
                <LinkifiedText text={announcement.body} className="text-sm" />
              </div>
            ),
          },
        ]}
      />

      {stats && stats.reach > 0 && (
        <Card size="small" className="mb-4" title="Breakdown">
          <Tabs
            size="small"
            items={[
              {
                key: "department",
                label: "Department",
                rows: stats.byDepartment,
              },
              { key: "position", label: "Position", rows: stats.byPosition },
              { key: "branch", label: "Branch", rows: stats.byBranch },
            ].map((t) => ({
              key: t.key,
              label: t.label,
              children: (
                <Table
                  rowKey="name"
                  size="small"
                  columns={breakdownColumns}
                  dataSource={t.rows}
                  pagination={t.rows.length > 10 ? { pageSize: 10 } : false}
                />
              ),
            }))}
          />
        </Card>
      )}

      <Card size="small" title="Recipients">
        <div className="mb-3 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <Segmented
            options={statusOptions}
            value={query.status}
            onChange={(value) =>
              setQuery((q) => ({
                ...q,
                status: value as RecipientStatusFilter,
                page: 1,
              }))
            }
          />
          <div className="flex flex-wrap gap-2">
            <Select
              allowClear
              placeholder="Department"
              className="w-48"
              value={query.department}
              options={departments.map((d) => ({ value: d, label: d }))}
              onChange={(department?: string) =>
                setQuery((q) => ({ ...q, department, page: 1 }))
              }
            />
            <Input.Search
              allowClear
              placeholder="Name or employee no."
              className="w-60"
              onSearch={(value) =>
                setQuery((q) => ({
                  ...q,
                  search: value.trim() || undefined,
                  page: 1,
                }))
              }
            />
          </div>
        </div>
        <Table
          rowKey="employeeId"
          size="small"
          columns={recipientColumns}
          dataSource={recipients?.data ?? []}
          loading={isFetching}
          scroll={{ x: 800 }}
          onChange={onTableChange}
          pagination={{
            current: query.page,
            pageSize: PAGE_SIZE,
            total: recipients?.metaData.totalCount ?? 0,
            showSizeChanger: false,
          }}
        />
      </Card>
    </div>
  );
}
