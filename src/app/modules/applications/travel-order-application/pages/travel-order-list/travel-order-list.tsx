import { useMemo, useState } from "react";
import { Button, DatePicker, Select, Space, Typography } from "antd";
import { PlusOutlined, ReloadOutlined } from "@ant-design/icons";
import { useNavigate } from "@tanstack/react-router";
import dayjs from "dayjs";
import {
  useTravelOrders,
  useDeleteTravelOrder,
  useChangeTravelOrderStatus,
} from "../../hooks/use-travel-order-queries";
import { useEmployees } from "@/app/modules/setup/employee/hooks/use-employee-queries";
import TravelOrderTable from "../../components/travel-order-table";
import { TRAVEL_ORDER_LABEL } from "../../constants/label.const";

const { Title } = Typography;
const { RangePicker } = DatePicker;

export default function TravelOrderList() {
  const navigate = useNavigate();
  const [dateRange, setDateRange] = useState<[string, string] | null>(null);
  const [employeeFilter, setEmployeeFilter] = useState<string | undefined>();

  const {
    data: applications = [],
    isLoading,
    isFetching,
    refetch,
  } = useTravelOrders(
    dateRange ? { from: dateRange[0], to: dateRange[1] } : undefined,
  );
  const { mutate: remove } = useDeleteTravelOrder();
  const { mutate: changeStatus } = useChangeTravelOrderStatus();
  const { data: rawEmployees = [] } = useEmployees();

  const employees = rawEmployees.map((e) => ({
    id: e.id,
    name: e.fullName ?? `${e.firstName} ${e.lastName}`,
  }));

  const employeeOptions = employees.map((e) => ({
    value: e.id,
    label: e.name,
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
              {TRAVEL_ORDER_LABEL.TITLE}
            </Title>
            <p className="page-toolbar-subtitle">
              File and track official business and travel order requests.
            </p>
          </div>
          <Space>
            <Button
              icon={<ReloadOutlined spin={isFetching} />}
              onClick={() => refetch()}
              loading={isFetching && !isLoading}
            />
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() =>
                navigate({ to: "/applications/official-business/create" })
              }
            >
              File OB / Travel Order
            </Button>
          </Space>
        </div>
      </div>

      <div className="mb-3 flex items-center gap-3 flex-wrap">
        <RangePicker
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

      <TravelOrderTable
        data={filtered}
        employees={employees}
        loading={isLoading || isFetching}
        onApprove={(record) => changeStatus({ record, status: "Approved" })}
        onDecline={(record) => changeStatus({ record, status: "Declined" })}
        onDelete={remove}
      />
    </div>
  );
}
