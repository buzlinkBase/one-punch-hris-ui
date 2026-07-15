import { useState } from "react";
import { Table, Button, Space, Popconfirm, Input, Tag } from "antd";
import {
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { useNavigate } from "@tanstack/react-router";
import type { EmployeeResponse } from "../../models/api/response/employee-response.model";
import { EMPLOYEE_LABEL } from "../../constants/label.const";
import { ResizableTitle } from "@/shared/components/resizable-title";
import { useResizableColumns } from "@/shared/hooks/use-resizable-columns";

interface Props {
  data: EmployeeResponse[];
  loading?: boolean;
  onDelete?: (id: string) => void;
}

export default function EmployeeTable({ data, loading, onDelete }: Props) {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const { widths, handleResize } = useResizableColumns({
    employeeNo: 120,
    bioId: 80,
    lastName: 140,
    firstName: 140,
    middleName: 130,
    suffix: 80,
    departmentName: 160,
    areaName: 160,
    payrollGroupName: 150,
    timeShiftName: 200,
    restDays: 220,
    gender: 90,
    employmentStatus: 150,
    sssNo: 130,
    phicNo: 140,
    hdmfNo: 130,
    tin: 120,
  });

  const filtered = data.filter((item) =>
    Object.values(item).some((val) =>
      String(val ?? "")
        .toLowerCase()
        .includes(search.toLowerCase()),
    ),
  );

  const columns: ColumnsType<EmployeeResponse> = [
    {
      title: EMPLOYEE_LABEL.EMPLOYEE_NO,
      dataIndex: "employeeNo",
      key: "employeeNo",
      width: widths.employeeNo,
      onHeaderCell: () =>
        ({
          width: widths.employeeNo,
          onResize: (w: number) => handleResize("employeeNo", w),
        }) as object,
    },
    {
      title: EMPLOYEE_LABEL.BIO_ID,
      dataIndex: "bioId",
      key: "bioId",
      width: widths.bioId,
      onHeaderCell: () =>
        ({
          width: widths.bioId,
          onResize: (w: number) => handleResize("bioId", w),
        }) as object,
    },
    {
      title: EMPLOYEE_LABEL.LAST_NAME,
      dataIndex: "lastName",
      key: "lastName",
      width: widths.lastName,
      onHeaderCell: () =>
        ({
          width: widths.lastName,
          onResize: (w: number) => handleResize("lastName", w),
        }) as object,
    },
    {
      title: EMPLOYEE_LABEL.FIRST_NAME,
      dataIndex: "firstName",
      key: "firstName",
      width: widths.firstName,
      onHeaderCell: () =>
        ({
          width: widths.firstName,
          onResize: (w: number) => handleResize("firstName", w),
        }) as object,
    },
    {
      title: EMPLOYEE_LABEL.MIDDLE_NAME,
      dataIndex: "middleName",
      key: "middleName",
      width: widths.middleName,
      onHeaderCell: () =>
        ({
          width: widths.middleName,
          onResize: (w: number) => handleResize("middleName", w),
        }) as object,
    },
    {
      title: EMPLOYEE_LABEL.SUFFIX,
      dataIndex: "suffix",
      key: "suffix",
      width: widths.suffix,
      onHeaderCell: () =>
        ({
          width: widths.suffix,
          onResize: (w: number) => handleResize("suffix", w),
        }) as object,
    },
    {
      title: EMPLOYEE_LABEL.DEPARTMENT,
      dataIndex: "departmentName",
      key: "departmentName",
      width: widths.departmentName,
      onHeaderCell: () =>
        ({
          width: widths.departmentName,
          onResize: (w: number) => handleResize("departmentName", w),
        }) as object,
    },
    {
      title: EMPLOYEE_LABEL.AREA,
      dataIndex: "areaName",
      key: "areaName",
      width: widths.areaName,
      onHeaderCell: () =>
        ({
          width: widths.areaName,
          onResize: (w: number) => handleResize("areaName", w),
        }) as object,
    },
    {
      title: EMPLOYEE_LABEL.PAYROLL_GROUP,
      dataIndex: "payrollGroupName",
      key: "payrollGroupName",
      width: widths.payrollGroupName,
      onHeaderCell: () =>
        ({
          width: widths.payrollGroupName,
          onResize: (w: number) => handleResize("payrollGroupName", w),
        }) as object,
    },
    {
      title: EMPLOYEE_LABEL.TIME_SHIFT,
      dataIndex: "timeShiftName",
      key: "timeShiftName",
      width: widths.timeShiftName,
      onHeaderCell: () =>
        ({
          width: widths.timeShiftName,
          onResize: (w: number) => handleResize("timeShiftName", w),
        }) as object,
    },
    {
      title: EMPLOYEE_LABEL.REST_DAYS,
      dataIndex: "restDays",
      key: "restDays",
      width: widths.restDays,
      onHeaderCell: () =>
        ({
          width: widths.restDays,
          onResize: (w: number) => handleResize("restDays", w),
        }) as object,
      render: (restDays?: EmployeeResponse["restDays"]) =>
        restDays?.length
          ? restDays.map((r) => (
              <Tag key={r.dayName} style={{ marginBottom: 2 }}>
                {r.dayName.slice(0, 3)}
              </Tag>
            ))
          : null,
    },
    {
      title: EMPLOYEE_LABEL.GENDER,
      dataIndex: "gender",
      key: "gender",
      width: widths.gender,
      onHeaderCell: () =>
        ({
          width: widths.gender,
          onResize: (w: number) => handleResize("gender", w),
        }) as object,
    },
    {
      title: EMPLOYEE_LABEL.EMPLOYMENT_STATUS,
      dataIndex: "employmentStatus",
      key: "employmentStatus",
      width: widths.employmentStatus,
      onHeaderCell: () =>
        ({
          width: widths.employmentStatus,
          onResize: (w: number) => handleResize("employmentStatus", w),
        }) as object,
      render: (v?: string) => {
        if (!v) return null;
        const colors: Record<string, string> = {
          Regular: "success",
          Probationary: "processing",
          Contractual: "warning",
          ProjectBased: "purple",
          Seasonal: "cyan",
          Casual: "default",
          PartTime: "geekblue",
          Term: "volcano",
          Internship: "magenta",
        };
        const labels: Record<string, string> = {
          ProjectBased: "Project Based",
          PartTime: "Part Time",
        };
        return <Tag color={colors[v] ?? "default"}>{labels[v] ?? v}</Tag>;
      },
    },
    {
      title: EMPLOYEE_LABEL.SSS_NO,
      dataIndex: "sssNo",
      key: "sssNo",
      width: widths.sssNo,
      onHeaderCell: () =>
        ({
          width: widths.sssNo,
          onResize: (w: number) => handleResize("sssNo", w),
        }) as object,
    },
    {
      title: EMPLOYEE_LABEL.PHIC_NO,
      dataIndex: "phicNo",
      key: "phicNo",
      width: widths.phicNo,
      onHeaderCell: () =>
        ({
          width: widths.phicNo,
          onResize: (w: number) => handleResize("phicNo", w),
        }) as object,
    },
    {
      title: EMPLOYEE_LABEL.HDMF_NO,
      dataIndex: "hdmfNo",
      key: "hdmfNo",
      width: widths.hdmfNo,
      onHeaderCell: () =>
        ({
          width: widths.hdmfNo,
          onResize: (w: number) => handleResize("hdmfNo", w),
        }) as object,
    },
    {
      title: EMPLOYEE_LABEL.TIN,
      dataIndex: "tin",
      key: "tin",
      width: widths.tin,
      onHeaderCell: () =>
        ({
          width: widths.tin,
          onResize: (w: number) => handleResize("tin", w),
        }) as object,
    },
    {
      title: "Actions",
      key: "actions",
      fixed: "right",
      width: 80,
      render: (_, record) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => navigate({ to: `/setup/employee/${record.id}` })}
          />
          {onDelete && (
            <Popconfirm
              title="Delete this employee?"
              onConfirm={() => onDelete(record.id)}
              okText="Yes"
              cancelText="No"
            >
              <Button type="text" danger icon={<DeleteOutlined />} />
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-3">
      <Input
        prefix={<SearchOutlined />}
        placeholder="Search..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        allowClear
        style={{ maxWidth: 320 }}
      />
      <Table
        rowKey="id"
        dataSource={filtered}
        columns={columns}
        size="small"
        loading={loading}
        pagination={{ pageSize: 10 }}
        scroll={{ x: "max-content" }}
        sticky
        components={{ header: { cell: ResizableTitle } }}
      />
    </div>
  );
}
