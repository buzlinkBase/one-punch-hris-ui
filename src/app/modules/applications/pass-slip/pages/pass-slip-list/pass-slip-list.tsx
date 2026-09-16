import { useMemo, useState } from "react";
import { Button, Select, Space, Typography, message } from "antd";
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
import { MobileRangePicker } from "@/shared/components/mobile-range-picker";
import { PermissionGate } from "@/shared/components/permission-gate/permission-gate";

const { Title } = Typography;

export default function PassSlipList() {
  const navigate = useNavigate();
  const [dateRange, setDateRange] = useState<[string, string] | null>(null);
  const [employeeFilter, setEmployeeFilter] = useState<string | undefined>();

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

  const filtered = useMemo(() => {
    if (!employeeFilter) return applications;
    return applications.filter((a) => a.employeeId === employeeFilter);
  }, [applications, employeeFilter]);

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
            <Button
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

      <div className="mb-3 flex items-center gap-3 flex-wrap">
        <MobileRangePicker
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
        <Select
          allowClear
          showSearch
          placeholder="Filter by employee"
          options={employeeOptions}
          value={employeeFilter}
          onChange={setEmployeeFilter}
          style={{ width: 240 }}
          filterOption={(input, opt) =>
            String(opt?.label ?? "")
              .toLowerCase()
              .includes(input.toLowerCase())
          }
        />
      </div>

      <PassSlipTable
        data={filtered}
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
