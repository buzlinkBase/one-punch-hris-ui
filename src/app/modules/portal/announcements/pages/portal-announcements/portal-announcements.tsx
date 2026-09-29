import { useState } from "react";
import { Badge, Empty, List, Segmented, Typography } from "antd";
import { NotificationOutlined } from "@ant-design/icons";
import { useNavigate } from "@tanstack/react-router";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useMyAnnouncements } from "../../hooks/use-my-announcement-queries";
import { AnnouncementTags } from "../../components/announcement-tags/announcement-tags";
import type {
  MyAnnouncementFilter,
  MyAnnouncementListItem,
} from "../../models/api/response/my-announcement-response.model";

dayjs.extend(relativeTime);

const { Title, Text, Paragraph } = Typography;

const FILTER_OPTIONS: { value: MyAnnouncementFilter; label: string }[] = [
  { value: "All", label: "All" },
  { value: "Unread", label: "Unread" },
  { value: "NeedsAcknowledgement", label: "Needs acknowledgement" },
  { value: "Archived", label: "Archived" },
];

const PAGE_SIZE = 10;

export default function PortalAnnouncements() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<MyAnnouncementFilter>("All");
  const [page, setPage] = useState(1);
  const { data, isLoading } = useMyAnnouncements(filter, page, PAGE_SIZE);

  const open = (item: MyAnnouncementListItem) =>
    navigate({ to: `/portal/announcements/${item.id}` });

  return (
    <div className="content-page">
      <div className="page-toolbar">
        <div className="page-toolbar-row">
          <div>
            <Title level={4} className="mb-0!">
              Announcements
            </Title>
            <p className="page-toolbar-subtitle">
              Notices from your company. Everything sent to you stays here, so
              you can come back to it any time.
            </p>
          </div>
        </div>
      </div>

      <Segmented
        className="mb-4"
        options={FILTER_OPTIONS}
        value={filter}
        onChange={(value) => {
          setFilter(value as MyAnnouncementFilter);
          setPage(1);
        }}
      />

      <List
        loading={isLoading}
        dataSource={data?.data ?? []}
        locale={{
          emptyText: (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                filter === "All"
                  ? "No announcements yet"
                  : "Nothing here right now"
              }
            />
          ),
        }}
        pagination={
          (data?.metaData.totalCount ?? 0) > PAGE_SIZE
            ? {
                current: page,
                pageSize: PAGE_SIZE,
                total: data?.metaData.totalCount ?? 0,
                onChange: setPage,
                showSizeChanger: false,
              }
            : false
        }
        renderItem={(item) => (
          <List.Item
            className="cursor-pointer rounded-lg px-3! transition-colors hover:bg-(--ant-color-fill-tertiary)"
            onClick={() => open(item)}
          >
            <List.Item.Meta
              avatar={
                <Badge dot={!item.isRead} offset={[-2, 2]}>
                  <NotificationOutlined className="text-xl text-(--ant-color-primary)" />
                </Badge>
              }
              title={
                <span className="flex flex-wrap items-center gap-2">
                  <Text strong={!item.isRead}>{item.title}</Text>
                  <AnnouncementTags item={item} />
                </span>
              }
              description={
                <>
                  <Paragraph
                    type="secondary"
                    ellipsis={{ rows: 2 }}
                    className="mb-1!"
                  >
                    {item.excerpt}
                  </Paragraph>
                  <Text type="secondary" className="text-xs">
                    {item.publishedByName ?? "Company"} ·{" "}
                    {item.publishedAtUtc
                      ? dayjs(item.publishedAtUtc).fromNow()
                      : ""}
                    {item.lastRemindedAt ? " · Reminder sent" : ""}
                  </Text>
                </>
              }
            />
          </List.Item>
        )}
      />
    </div>
  );
}
