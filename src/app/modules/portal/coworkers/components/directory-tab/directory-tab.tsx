import { useState } from "react";
import { Empty, Input, Pagination, Skeleton, Typography } from "antd";
import { useCoworkerDirectory } from "../../../shared/hooks/use-my-employee-queries";
import CoworkerCard, { joinSubtitle } from "../coworker-card";

const { Text } = Typography;
const PAGE_SIZE = 24;

export default function DirectoryTab() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const { data, isLoading } = useCoworkerDirectory({
    q: search || undefined,
    page,
    enabled: true,
  });
  const items = data?.items ?? [];

  return (
    <div>
      <Input.Search
        allowClear
        placeholder="Search by name or position"
        className="mb-3 max-w-md"
        onSearch={(value) => {
          setSearch(value.trim());
          setPage(1);
        }}
      />
      {isLoading ? (
        <Skeleton active paragraph={{ rows: 4 }} />
      ) : items.length === 0 ? (
        <Empty description="No coworkers found" />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {items.map((p) => (
            <CoworkerCard
              key={p.id}
              name={p.fullName}
              imageUrl={p.profileImg}
              subtitle={joinSubtitle(
                p.positionName,
                p.departmentName,
                p.branchName,
              )}
              extra={
                (p.email || p.contact) && (
                  <Text type="secondary" className="text-xs block truncate">
                    {[p.email, p.contact].filter(Boolean).join(" · ")}
                  </Text>
                )
              }
            />
          ))}
        </div>
      )}
      {(data?.total ?? 0) > PAGE_SIZE && (
        <Pagination
          className="mt-3 text-right"
          current={page}
          pageSize={PAGE_SIZE}
          total={data?.total ?? 0}
          showSizeChanger={false}
          onChange={setPage}
        />
      )}
    </div>
  );
}
