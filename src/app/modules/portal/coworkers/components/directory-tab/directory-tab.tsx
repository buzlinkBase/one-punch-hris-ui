import { useState } from "react";
import { Button, Empty, Input, Pagination, Select, Skeleton } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { useDebouncedValue } from "@/shared/hooks/use-debounced-value";
import { useDepartments } from "@/app/modules/setup/department/hooks/use-department-queries";
import { useCoworkerDirectory } from "../../../shared/hooks/use-my-employee-queries";
import CoworkerCard, { joinSubtitle } from "../coworker-card";
import ContactActions from "./contact-actions";

const PAGE_SIZE = 24;

export default function DirectoryTab() {
  const [search, setSearch] = useState("");
  const [departmentId, setDepartmentId] = useState<string>();
  const [page, setPage] = useState(1);
  const q = useDebouncedValue(search.trim(), 350);

  const { data: departments = [] } = useDepartments();
  const { data, isLoading, isFetching } = useCoworkerDirectory({
    q: q || undefined,
    departmentId,
    page,
    enabled: true,
  });
  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const filtered = !!q || !!departmentId;

  const clearFilters = () => {
    setSearch("");
    setDepartmentId(undefined);
    setPage(1);
  };

  return (
    <div>
      <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center">
        <Input
          allowClear
          prefix={<SearchOutlined />}
          placeholder="Search by name or position"
          className="sm:max-w-sm"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />
        <Select
          allowClear
          showSearch={{ optionFilterProp: "label" }}
          placeholder="All departments"
          className="sm:w-56"
          value={departmentId}
          options={departments.map((d) => ({ value: d.id, label: d.name }))}
          onChange={(value) => {
            setDepartmentId(value);
            setPage(1);
          }}
        />
        <span className="text-sm text-(--text-secondary) sm:ml-auto">
          {isLoading
            ? "Loading..."
            : `${total} ${total === 1 ? "coworker" : "coworkers"}`}
        </span>
      </div>

      {isLoading ? (
        <Skeleton active paragraph={{ rows: 4 }} />
      ) : items.length === 0 ? (
        <Empty description="No coworkers found">
          {filtered && (
            <Button onClick={clearFilters}>Clear search and filters</Button>
          )}
        </Empty>
      ) : (
        <div
          className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 transition-opacity ${isFetching ? "opacity-60" : ""}`}
        >
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
              extra={<ContactActions email={p.email} contact={p.contact} />}
            />
          ))}
        </div>
      )}
      {total > PAGE_SIZE && (
        <Pagination
          className="mt-3 text-right"
          current={page}
          pageSize={PAGE_SIZE}
          total={total}
          showSizeChanger={false}
          onChange={(next) => {
            setPage(next);
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        />
      )}
    </div>
  );
}
