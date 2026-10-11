import { useState } from "react";
import {
  Button,
  Input,
  Progress,
  Table,
  Tabs,
  Tag,
  Tooltip,
  Typography,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { PlusOutlined, PushpinFilled } from "@ant-design/icons";
import { useNavigate } from "@tanstack/react-router";
import dayjs, { type Dayjs } from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { PermissionGate } from "@/shared/components/permission-gate/permission-gate";
import { MobileRangePicker } from "@/shared/components/mobile-range-picker";
import { ANNOUNCEMENT_PRIORITY_COLOR } from "@/shared/types/announcement.model";
import { useAnnouncements } from "../../hooks/use-announcement-queries";
import type { AnnouncementListTab } from "../../models/api/request/announcement-request.model";
import type { AnnouncementSummary } from "../../models/api/response/announcement-response.model";
import {
  ANNOUNCEMENT_LABEL,
  ANNOUNCEMENT_PATH,
  ANNOUNCEMENT_PERMISSION,
  LIST_TAB_OPTIONS,
  STATE_TAG,
} from "../../constants/label.const";
import { AnnouncementActions } from "../../components/announcement-actions/announcement-actions";

dayjs.extend(relativeTime);

const { Title, Text } = Typography;

const PAGE_SIZE = 20;
const formatDateTime = (value: string) =>
  dayjs(value).format("MMM D, YYYY h:mm A");
const percent = (part: number, whole: number) =>
  whole === 0 ? 0 : Math.round((part / whole) * 100);

function StateCell({ row }: { row: AnnouncementSummary }) {
  const tag = STATE_TAG[row.state];
  return (
    <div className="flex flex-col items-start gap-1">
      <span>
        <Tag color={row.isExpired ? "default" : tag.color}>
          {row.isExpired ? "Expired" : tag.label}
        </Tag>
      </span>
      {row.state === "Scheduled" && row.publishAtUtc && (
        <Tooltip title={formatDateTime(row.publishAtUtc)}>
          <Text type="secondary" className="text-xs">
            Publishes {dayjs(row.publishAtUtc).fromNow()}
          </Text>
        </Tooltip>
      )}
      {row.state === "Deleted" && row.purgeAtUtc && (
        <Text type="secondary" className="text-xs">
          Removed for good {dayjs(row.purgeAtUtc).fromNow()}
        </Text>
      )}
    </div>
  );
}

function RateCell({
  part,
  whole,
  label,
}: {
  part: number;
  whole: number;
  label: string;
}) {
  return (
    <Tooltip title={`${part} of ${whole} ${label}`}>
      <div className="min-w-28">
        <Progress percent={percent(part, whole)} size="small" />
        <Text type="secondary" className="text-xs">
          {part}/{whole}
        </Text>
      </div>
    </Tooltip>
  );
}

export default function AnnouncementList() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<AnnouncementListTab>("Active");
  const [search, setSearch] = useState("");
  const [range, setRange] = useState<[Dayjs | null, Dayjs | null] | null>(null);
  const [page, setPage] = useState(1);

  const { data, isFetching } = useAnnouncements({
    tab,
    search: search || undefined,
    from: range?.[0]?.format("YYYY-MM-DD"),
    to: range?.[1]?.format("YYYY-MM-DD"),
    page,
    limit: PAGE_SIZE,
  });

  const openRow = (row: AnnouncementSummary) =>
    navigate({
      to:
        row.state === "Draft" || row.state === "Scheduled"
          ? ANNOUNCEMENT_PATH.edit(row.id)
          : ANNOUNCEMENT_PATH.report(row.id),
    });

  const columns: ColumnsType<AnnouncementSummary> = [
    {
      title: "Announcement",
      key: "title",
      render: (_, r) => (
        <div className="flex flex-col gap-1">
          <span className="flex flex-wrap items-center gap-1.5">
            {r.isPinned && (
              <PushpinFilled className="text-(--ant-color-primary)" />
            )}
            <Text strong>{r.title}</Text>
            {r.priority !== "Normal" && (
              <Tag color={ANNOUNCEMENT_PRIORITY_COLOR[r.priority]}>
                {r.priority}
              </Tag>
            )}
            {r.version > 1 && <Tag>Edited</Tag>}
          </span>
          <span className="flex flex-wrap gap-1">
            {r.audienceSummary.slice(0, 3).map((label) => (
              <Tag
                key={label}
                variant="filled"
                color={label.startsWith("Except ") ? "red" : "blue"}
              >
                {label}
              </Tag>
            ))}
            {r.audienceSummary.length > 3 && (
              <Tag variant="filled">+{r.audienceSummary.length - 3}</Tag>
            )}
          </span>
        </div>
      ),
    },
    {
      title: "Status",
      key: "state",
      width: 170,
      render: (_, r) => <StateCell row={r} />,
    },
    {
      title: "Published",
      key: "published",
      width: 190,
      render: (_, r) =>
        r.publishedAtUtc ? (
          <div className="flex flex-col">
            <Text className="text-sm">{formatDateTime(r.publishedAtUtc)}</Text>
            <Text type="secondary" className="text-xs">
              by {r.publishedByName}
            </Text>
          </div>
        ) : (
          <Text type="secondary" className="text-xs">
            Drafted by {r.createdByName}
          </Text>
        ),
    },
    {
      title: "Viewed",
      key: "viewed",
      width: 140,
      render: (_, r) =>
        r.recipientCount > 0 ? (
          <RateCell
            part={r.viewedCount}
            whole={r.recipientCount}
            label="viewed"
          />
        ) : (
          <Text type="secondary">—</Text>
        ),
    },
    {
      title: "Acknowledged",
      key: "acknowledged",
      width: 140,
      render: (_, r) =>
        r.requiresAcknowledgement && r.recipientCount > 0 ? (
          <RateCell
            part={r.acknowledgedCount}
            whole={r.recipientCount}
            label="acknowledged"
          />
        ) : (
          <Text type="secondary">—</Text>
        ),
    },
    {
      title: "",
      key: "actions",
      width: 56,
      align: "right",
      render: (_, r) => (
        <span onClick={(e) => e.stopPropagation()}>
          <AnnouncementActions announcement={r} />
        </span>
      ),
    },
  ];

  return (
    <div className="content-page">
      <div className="page-toolbar">
        <div className="page-toolbar-row">
          <div>
            <Title level={4} className="mb-0!">
              {ANNOUNCEMENT_LABEL.TITLE}
            </Title>
            <p className="page-toolbar-subtitle">
              {ANNOUNCEMENT_LABEL.SUBTITLE}
            </p>
          </div>
          <PermissionGate permission={ANNOUNCEMENT_PERMISSION.CREATE}>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => navigate({ to: ANNOUNCEMENT_PATH.CREATE })}
            >
              {ANNOUNCEMENT_LABEL.NEW}
            </Button>
          </PermissionGate>
        </div>
      </div>

      <Tabs
        activeKey={tab}
        onChange={(key) => {
          setTab(key as AnnouncementListTab);
          setPage(1);
        }}
        items={LIST_TAB_OPTIONS.map((t) => ({ key: t.value, label: t.label }))}
      />

      <div className="mb-3 flex flex-wrap items-center gap-3">
        <Input.Search
          allowClear
          placeholder="Search title"
          className="w-full md:w-72"
          onSearch={(value) => {
            setSearch(value.trim());
            setPage(1);
          }}
        />
        <MobileRangePicker
          value={range}
          onChange={(value) => {
            setRange(value as [Dayjs | null, Dayjs | null] | null);
            setPage(1);
          }}
        />
      </div>

      <Table
        rowKey="id"
        size="small"
        columns={columns}
        dataSource={data?.data ?? []}
        loading={isFetching}
        scroll={{ x: 900 }}
        onRow={(row) => ({
          onClick: () => openRow(row),
          className: "cursor-pointer",
        })}
        pagination={{
          current: page,
          pageSize: PAGE_SIZE,
          total: data?.metaData.totalCount ?? 0,
          onChange: setPage,
          showSizeChanger: false,
        }}
      />
    </div>
  );
}
