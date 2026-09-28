import { useMemo, useState } from "react";
import { Button, Space, Switch, Tag, Tooltip, Typography } from "antd";
import { ReloadOutlined } from "@ant-design/icons";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { useAuditLogs, useAuditModules } from "../../hooks/use-audit-queries";
import AuditTable, { type AuditFilters } from "../../components/audit-table";
import { AUDIT_LABEL } from "../../constants/label.const";
import type { AuditLogParams } from "../../models/api/response/audit-response.model";

const { Title } = Typography;

const DEFAULT_PAGE_SIZE = 20;
const AUTO_REFRESH_MS = 30_000;

interface UserFilter {
  id: string;
  name: string;
}

// Local calendar days -> UTC instants; the upper bound is the start of the day after (exclusive).
function toParams(
  filters: AuditFilters,
  user: UserFilter | null,
  page: number,
  pageSize: number,
): AuditLogParams {
  const [from, to] = filters.range ?? [null, null];
  return {
    action: filters.action,
    status: filters.status,
    module: filters.module,
    search: filters.search,
    userId: user?.id,
    from: from?.startOf("day").toISOString(),
    to: to?.add(1, "day").startOf("day").toISOString(),
    page,
    pageSize,
  };
}

export default function AuditList() {
  const navigate = useNavigate();
  // Security > Users' "View Activity" opens this page for one person.
  const search = useSearch({ strict: false }) as Record<string, unknown>;
  const [user, setUser] = useState<UserFilter | null>(() =>
    typeof search.userId === "string"
      ? {
          id: search.userId,
          name:
            typeof search.userName === "string"
              ? search.userName
              : search.userId,
        }
      : null,
  );
  const [filters, setFilters] = useState<AuditFilters>({});
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [autoRefresh, setAutoRefresh] = useState(false);

  const params = useMemo(
    () => toParams(filters, user, page, pageSize),
    [filters, user, page, pageSize],
  );
  const { data, isLoading, isFetching, refetch } = useAuditLogs(
    params,
    autoRefresh ? AUTO_REFRESH_MS : false,
  );
  const { data: modules = [] } = useAuditModules();

  const clearUser = () => {
    setUser(null);
    setPage(1);
    navigate({ to: "/security/audit" });
  };

  return (
    <div className="content-page">
      <div className="page-toolbar">
        <div className="page-toolbar-row">
          <div>
            <Title level={4} className="mb-0!">
              {AUDIT_LABEL.TITLE}
            </Title>
            <p className="page-toolbar-subtitle">
              Track all user actions and system events for accountability and
              compliance.
            </p>
          </div>
          <Space wrap>
            <Tooltip title={AUDIT_LABEL.AUTO_REFRESH_HINT}>
              <Space size="small">
                <Switch
                  size="small"
                  checked={autoRefresh}
                  onChange={setAutoRefresh}
                  aria-label={AUDIT_LABEL.AUTO_REFRESH}
                />
                <span className="text-sm">{AUDIT_LABEL.AUTO_REFRESH}</span>
              </Space>
            </Tooltip>
            <Button
              icon={<ReloadOutlined spin={isFetching} />}
              onClick={() => refetch()}
              disabled={isFetching}
            >
              {AUDIT_LABEL.REFRESH}
            </Button>
          </Space>
        </div>
      </div>
      {user && (
        <div className="mb-3">
          <Tag closable onClose={clearUser} color="processing">
            Activity of {user.name}
          </Tag>
        </div>
      )}
      <AuditTable
        data={data?.items ?? []}
        total={data?.total ?? 0}
        page={page}
        pageSize={pageSize}
        loading={isLoading || isFetching}
        filters={filters}
        modules={modules}
        onFiltersChange={(next) => {
          setFilters(next);
          setPage(1);
        }}
        onPageChange={(nextPage, nextPageSize) => {
          setPage(nextPageSize === pageSize ? nextPage : 1);
          setPageSize(nextPageSize);
        }}
      />
    </div>
  );
}
