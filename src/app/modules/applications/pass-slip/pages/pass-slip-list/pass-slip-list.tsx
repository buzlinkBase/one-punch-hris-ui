import { useMemo, useState } from "react";
import { Button, Form, Space, Typography, message } from "antd";
import { PlusOutlined, ReloadOutlined } from "@ant-design/icons";
import { useNavigate } from "@tanstack/react-router";
import dayjs from "dayjs";
import {
  usePassSlips,
  useApprovePassSlip,
  useDeclinePassSlip,
  useRevokePassSlip,
  useDeletePassSlip,
} from "../../hooks/use-pass-slip-queries";
import { useEmployees } from "@/app/modules/setup/employee/hooks/use-employee-queries";
import PassSlipTable from "../../components/pass-slip-table";
import { PASS_SLIP_LABEL } from "../../constants/label.const";
import {
  FilterPanel,
  FilterToggleButton,
} from "@/shared/components/filter-panel/filter-panel";
import { FilterSelect } from "@/shared/components/filter-panel/filter-select";
import {
  compactChips,
  formatRangeChip,
  labelOf,
} from "@/shared/utils/filter-chips.util";
import { MobileRangePicker } from "@/shared/components/mobile-range-picker";
import { PermissionGate } from "@/shared/components/permission-gate/permission-gate";
import { ApprovalTabs } from "@/shared/components/approval-tabs/approval-tabs";
import { useApprovalTabs } from "@/shared/hooks/use-approval-tabs";
import { useApplicationDrill } from "@/shared/drilldown/use-screen-drill";

const { Title } = Typography;

export default function PassSlipList() {
  const navigate = useNavigate();
  // A Dashboard or Analytics figure can open this list on a date range and tab.
  const drill = useApplicationDrill();
  const [dateRange, setDateRange] = useState<[string, string] | null>(
    drill.dateRange,
  );
  const [employeeFilter, setEmployeeFilter] = useState<string | undefined>();
  const [filtersOpen, setFiltersOpen] = useState(true);

  const {
    data: applications = [],
    isLoading,
    isFetching,
    refetch,
  } = usePassSlips(
    dateRange ? { from: dateRange[0], to: dateRange[1] } : undefined,
  );
  const { mutate: approve, isPending: isApproving } = useApprovePassSlip();
  const { mutate: decline, isPending: isDeclining } = useDeclinePassSlip();
  const { mutate: revoke } = useRevokePassSlip();
  const { mutate: remove } = useDeletePassSlip();
  const { data: rawEmployees = [] } = useEmployees();

  const employeeOptions = rawEmployees.map((e) => ({
    value: e.id,
    label: e.fullName ?? `${e.firstName} ${e.lastName}`,
  }));

  const activeFilterCount = [dateRange, employeeFilter].filter(Boolean).length;
  const filterChips = compactChips([
    formatRangeChip(dateRange?.[0], dateRange?.[1]),
    labelOf(employeeOptions, employeeFilter),
  ]);

  const filtered = useMemo(() => {
    if (!employeeFilter) return applications;
    return applications.filter((a) => a.employeeId === employeeFilter);
  }, [applications, employeeFilter]);
  const approval = useApprovalTabs(filtered, drill.tab);

  return (
    <div className="content-page">
      <div className="page-toolbar">
        <div className="page-toolbar-row">
          <div>
            <Title level={4} className="mb-0!">
              {PASS_SLIP_LABEL.TITLE}
            </Title>
            <p className="page-toolbar-subtitle">{PASS_SLIP_LABEL.SUBTITLE}</p>
          </div>
          <Space>
            <FilterToggleButton
              open={filtersOpen}
              onOpenChange={setFiltersOpen}
              activeCount={activeFilterCount}
            />
            <Button
              aria-label="Refresh"
              icon={<ReloadOutlined spin={isFetching} />}
              onClick={() => refetch()}
              loading={isFetching && !isLoading}
            />
            <PermissionGate permission="Pass Slip:Create">
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() =>
                  navigate({ to: "/applications/pass-slip/create" })
                }
              >
                {PASS_SLIP_LABEL.CREATE}
              </Button>
            </PermissionGate>
          </Space>
        </div>
      </div>

      <FilterPanel
        open={filtersOpen}
        onOpenChange={setFiltersOpen}
        chips={filterChips}
        onClear={() => {
          setDateRange(null);
          setEmployeeFilter(undefined);
        }}
        gridClassName="grid grid-cols-1 sm:grid-cols-3 gap-x-4"
      >
        <Form.Item label="Date Range" className="mb-3 sm:col-span-2">
          <MobileRangePicker
            className="w-full"
            value={[
              dateRange ? dayjs(dateRange[0]) : null,
              dateRange ? dayjs(dateRange[1]) : null,
            ]}
            onChange={(dates) =>
              setDateRange(
                dates
                  ? [
                      dates[0]?.format("YYYY-MM-DD") ?? "",
                      dates[1]?.format("YYYY-MM-DD") ?? "",
                    ]
                  : null,
              )
            }
          />
        </Form.Item>
        <Form.Item label="Employee" className="mb-3">
          <FilterSelect
            placeholder="All employees"
            options={employeeOptions}
            value={employeeFilter}
            onChange={setEmployeeFilter}
          />
        </Form.Item>
      </FilterPanel>

      <ApprovalTabs
        value={approval.tab}
        onChange={approval.setTab}
        pendingCount={approval.pendingCount}
        processedCount={approval.processedCount}
      />

      <PassSlipTable
        data={approval.rows}
        loading={isLoading || isFetching}
        onEdit={(record) =>
          navigate({ to: `/applications/pass-slip/${record.id}` })
        }
        actionLoading={isApproving || isDeclining}
        onApprove={(record, note) =>
          approve(
            { id: record.id, note },
            {
              onSuccess: () => message.success("Pass slip approved."),
              onError: () => message.error("Failed to approve."),
            },
          )
        }
        onDecline={(record, note) =>
          decline(
            { id: record.id, note },
            {
              onSuccess: () => message.success("Pass slip declined."),
              onError: () => message.error("Failed to decline."),
            },
          )
        }
        onRevoke={(record) =>
          revoke(record.id, {
            onSuccess: () => message.success("Approval revoked."),
            onError: () => message.error("Failed to revoke."),
          })
        }
        onDelete={(id) =>
          remove(id, {
            onSuccess: () => message.success("Deleted."),
            onError: () => message.error("Failed to delete."),
          })
        }
      />
    </div>
  );
}
