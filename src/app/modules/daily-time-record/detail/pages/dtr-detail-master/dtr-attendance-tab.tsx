import { useState } from "react";
import { Button, DatePicker, Form, Select, Table, Tag } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import dayjs, { type Dayjs } from "dayjs";
import {
  useAttendanceEntryRecords,
  useEmployeeFilter,
} from "@/app/modules/timekeeping/attendance-entry/hooks/use-attendance-entry-queries";
import type { AttendanceEntryFilter } from "@/app/modules/timekeeping/attendance-entry/models/api/request/attendance-entry-filter.model";
import type { AttendanceEntryResponse } from "@/app/modules/timekeeping/attendance-entry/models/api/response/attendance-entry-response.model";
import type { ColumnsType } from "antd/es/table";

const filterByLabel = (
  input: string,
  option?: { label?: string | number | boolean },
) =>
  String(option?.label ?? "")
    .toLowerCase()
    .includes(input.toLowerCase());

export default function DtrAttendanceTab() {
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(dayjs());
  const [selectedEmployee, setSelectedEmployee] = useState<string | undefined>(
    undefined,
  );
  const [committedFilter, setCommittedFilter] =
    useState<AttendanceEntryFilter | null>(null);
  const [searchKey, setSearchKey] = useState(0);

  const { data: employees = [], isLoading: empLoading } = useEmployeeFilter();

  const { data: records = [], isFetching } = useAttendanceEntryRecords(
    committedFilter ?? {},
    {
      enabled: committedFilter !== null,
      searchKey,
    },
  );

  function handleSearch() {
    if (!selectedDate || !selectedEmployee) return;
    const dateStr = selectedDate.format("YYYY-MM-DD");
    setCommittedFilter({
      fromDate: dateStr,
      toDate: dateStr,
      employeeId: selectedEmployee,
    });
    setSearchKey((k) => k + 1);
  }

  const employeeOptions = employees.map((e) => ({
    value: e.id,
    label: e.name ?? e.id,
  }));

  const columns: ColumnsType<AttendanceEntryResponse> = [
    {
      title: "Employee",
      dataIndex: "employeeName",
      key: "employeeName",
      width: 200,
    },
    {
      title: "Time Log",
      dataIndex: "timeLog",
      key: "timeLog",
      width: 180,
      render: (v: string) => (v ? dayjs(v).format("YYYY-MM-DD HH:mm:ss") : "—"),
    },
    {
      title: "Log Source",
      dataIndex: "logSource",
      key: "logSource",
      width: 130,
      render: (v: string) =>
        v ? <Tag color={v === "BIOMETRIC" ? "blue" : "purple"}>{v}</Tag> : "—",
    },
    {
      title: "Branch",
      dataIndex: "branch",
      key: "branch",
      width: 150,
      render: (v: string | null) => v ?? "—",
    },
    {
      title: "Client",
      dataIndex: "client",
      key: "client",
      width: 150,
      render: (v: string | null) => v ?? "—",
    },
    {
      title: "Area",
      dataIndex: "area",
      key: "area",
      width: 150,
      render: (v: string | null) => v ?? "—",
    },
  ];

  return (
    <div>
      <Form
        layout="inline"
        style={{ marginBottom: 16, flexWrap: "wrap", gap: 8 }}
      >
        <Form.Item label="Employee" required>
          <Select
            showSearch
            allowClear
            style={{ width: 260 }}
            placeholder="Select employee"
            loading={empLoading}
            options={employeeOptions}
            filterOption={filterByLabel}
            value={selectedEmployee}
            onChange={setSelectedEmployee}
          />
        </Form.Item>
        <Form.Item label="Date" required>
          <DatePicker
            value={selectedDate}
            onChange={setSelectedDate}
            format="YYYY-MM-DD"
            allowClear={false}
          />
        </Form.Item>
        <Form.Item>
          <Button
            type="primary"
            icon={<SearchOutlined />}
            onClick={handleSearch}
            disabled={!selectedDate || !selectedEmployee}
            loading={isFetching}
          >
            Search
          </Button>
        </Form.Item>
      </Form>

      <Table<AttendanceEntryResponse>
        rowKey="id"
        columns={columns}
        dataSource={records}
        loading={isFetching}
        size="small"
        scroll={{ x: "max-content" }}
        pagination={{ pageSize: 20, showSizeChanger: false }}
        locale={{
          emptyText: committedFilter
            ? "No attendance records found."
            : "Select an employee and date, then click Search.",
        }}
      />
    </div>
  );
}
