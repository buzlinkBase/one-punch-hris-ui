import { useState } from "react";
import { Button, Pagination, Spin } from "antd";
import { CheckOutlined } from "@ant-design/icons";
import { useNavigate } from "@tanstack/react-router";
import {
  useMarkAllNotificationsRead,
  useMyNotificationsPage,
} from "@/core/notifications/hooks/use-user-notifications";
import { toBellEntry } from "@/core/notifications/approval-bell-entry";
import { PageHeader } from "@/shared/components/page-header/page-header";
import { AppEmpty } from "@/shared/components/app-empty/app-empty";
import { DEFAULT_PAGE_SIZE } from "@/shared/constants/pagination.const";

/** Full history of the bell's saved notifications, newest first. */
export default function Notifications() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const { data, isLoading, isFetching, refetch } = useMyNotificationsPage(
    page,
    DEFAULT_PAGE_SIZE,
  );
  const { mutate: markAllRead, isPending: isMarking } =
    useMarkAllNotificationsRead();

  const items = data?.items ?? [];
  const unreadCount = data?.unreadCount ?? 0;

  return (
    <div className="content-page">
      <PageHeader
        title="Notifications"
        subtitle="Approval updates and other saved notices."
        onRefresh={() => refetch()}
        isRefreshing={isFetching}
        actions={
          <Button
            icon={<CheckOutlined />}
            disabled={unreadCount === 0}
            loading={isMarking}
            onClick={() => markAllRead()}
          >
            Mark all as read
          </Button>
        }
      />

      <Spin spinning={isLoading}>
        {!isLoading && items.length === 0 ? (
          <AppEmpty description="No notifications yet" />
        ) : (
          <ul className="m-0 flex list-none flex-col gap-2 p-0">
            {items.map((n) => {
              const entry = toBellEntry(n);
              const unread = !n.readAt;
              return (
                <li
                  key={n.id}
                  className="rounded-xl border border-(--ant-color-border-secondary) bg-(--ant-color-bg-container) p-3"
                >
                  <div className="flex items-start gap-3">
                    <span
                      aria-label={unread ? "Unread" : "Read"}
                      className={`mt-1.5 inline-block size-2 shrink-0 rounded-full ${
                        unread ? "bg-(--ant-color-primary)" : "bg-transparent"
                      }`}
                    />
                    <div className="min-w-0 flex-1">
                      <p
                        className={`m-0 text-[13px] ${unread ? "font-semibold" : "font-medium"}`}
                      >
                        {entry.title}
                      </p>
                      <p className="mt-0.5 mb-0 text-xs text-(--ant-color-text-secondary)">
                        {entry.message}
                      </p>
                      <p className="mt-1 mb-0 text-[11px] text-(--ant-color-text-tertiary)">
                        {new Date(entry.createdAt).toLocaleString()}
                      </p>
                    </div>
                    {entry.link && (
                      <Button
                        size="small"
                        onClick={() => navigate({ to: entry.link })}
                      >
                        View
                      </Button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Spin>

      {(data?.total ?? 0) > DEFAULT_PAGE_SIZE && (
        <Pagination
          className="text-center"
          current={page}
          pageSize={DEFAULT_PAGE_SIZE}
          total={data?.total ?? 0}
          showSizeChanger={false}
          onChange={setPage}
        />
      )}
    </div>
  );
}
