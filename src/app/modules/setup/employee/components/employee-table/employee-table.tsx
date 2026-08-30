import { Table, Button, Space, Popconfirm, Tag, Tooltip, message } from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  MailOutlined,
  PrinterOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { useNavigate } from "@tanstack/react-router";
import dayjs from "dayjs";
import type { EmployeeResponse } from "../../models/api/response/employee-response.model";
import { EMPLOYEE_LABEL } from "../../constants/label.const";
import { ResizableTitle } from "@/shared/components/resizable-title";
import { useResizableColumns } from "@/shared/hooks/use-resizable-columns";
import httpClient from "@/core/http/http-client";
import { API_PREFIX, buildApiUrl } from "@/core/http/api-url.util";

interface Props {
  data: EmployeeResponse[];
  loading?: boolean;
  onDelete?: (id: string) => void;
  onInvite?: (record: EmployeeResponse) => void;
}

const JOB_LEVEL_LABELS: Record<string, string> = {
  RankandFile: "Rank and File",
  EntryLevel: "Entry Level",
  TechnicalSpecialist: "Technical Specialist",
};

function formatFullName(record: EmployeeResponse) {
  if (record.fullName) return record.fullName;
  return `${record.lastName}, ${record.firstName} ${record.middleName ?? ""} ${record.suffix ?? ""}`
    .replace(/\s+/g, " ")
    .trim();
}

export default function EmployeeTable({
  data,
  loading,
  onDelete,
  onInvite,
}: Props) {
  const navigate = useNavigate();

  const handlePrint201 = async (id: string) => {
    // Open the tab synchronously (before the await) so popup blockers treat it as a
    // direct response to the click.
    const printTab = window.open("about:blank", "_blank");
    try {
      const blob = await httpClient.get<Blob>(
        `${buildApiUrl(API_PREFIX.hrms, "employees")}/${id}/print-201`,
        { responseType: "blob" },
      );
      const url = URL.createObjectURL(blob);
      if (printTab) printTab.location.href = url;
    } catch {
      printTab?.close();
      message.error("Failed to generate the 201 file. Please try again.");
    }
  };

  const { widths, handleResize } = useResizableColumns({
    employeeNo: 120,
    bioId: 80,
    fullName: 220,
    positionName: 160,
    departmentName: 160,
    clientName: 150,
    areaName: 160,
    branchName: 140,
    payrollGroupName: 150,
    jobLevel: 140,
    timeShiftName: 200,
    restDays: 220,
    salaryType: 110,
    hireDate: 120,
    employmentStatus: 150,
    status: 100,
    gender: 90,
    contact: 160,
    sssNo: 130,
    phicNo: 140,
    hdmfNo: 130,
    tin: 120,
  });

  const columns: ColumnsType<EmployeeResponse> = [
    {
      title: "Actions",
      key: "actions",
      width: 145,
      fixed: "left",
      render: (_, record) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => navigate({ to: `/setup/employee/${record.id}` })}
          />
          <Tooltip title="Print 201 File">
            <Button
              type="text"
              icon={<PrinterOutlined />}
              onClick={() => handlePrint201(record.id)}
            />
          </Tooltip>
          {onInvite && (
            <Button
              type="text"
              icon={<MailOutlined />}
              title="Invite to workspace"
              onClick={() => onInvite(record)}
            />
          )}
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
      title: "Full Name",
      key: "fullName",
      width: widths.fullName,
      onHeaderCell: () =>
        ({
          width: widths.fullName,
          onResize: (w: number) => handleResize("fullName", w),
        }) as object,
      render: (_, record) => formatFullName(record),
    },
    {
      title: EMPLOYEE_LABEL.POSITION,
      dataIndex: "positionName",
      key: "positionName",
      width: widths.positionName,
      onHeaderCell: () =>
        ({
          width: widths.positionName,
          onResize: (w: number) => handleResize("positionName", w),
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
      title: EMPLOYEE_LABEL.CLIENT,
      dataIndex: "clientName",
      key: "clientName",
      width: widths.clientName,
      onHeaderCell: () =>
        ({
          width: widths.clientName,
          onResize: (w: number) => handleResize("clientName", w),
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
      title: EMPLOYEE_LABEL.BRANCH,
      dataIndex: "branchName",
      key: "branchName",
      width: widths.branchName,
      onHeaderCell: () =>
        ({
          width: widths.branchName,
          onResize: (w: number) => handleResize("branchName", w),
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
      title: EMPLOYEE_LABEL.JOB_LEVEL,
      dataIndex: "jobLevel",
      key: "jobLevel",
      width: widths.jobLevel,
      onHeaderCell: () =>
        ({
          width: widths.jobLevel,
          onResize: (w: number) => handleResize("jobLevel", w),
        }) as object,
      render: (v?: string) => (v ? (JOB_LEVEL_LABELS[v] ?? v) : null),
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
      title: EMPLOYEE_LABEL.SALARY_TYPE,
      dataIndex: "salaryType",
      key: "salaryType",
      width: widths.salaryType,
      onHeaderCell: () =>
        ({
          width: widths.salaryType,
          onResize: (w: number) => handleResize("salaryType", w),
        }) as object,
      render: (v?: string) =>
        v ? <Tag>{v === "FIXED" ? "Fixed" : "Variable"}</Tag> : null,
    },
    {
      title: EMPLOYEE_LABEL.HIRE_DATE,
      dataIndex: "hireDate",
      key: "hireDate",
      width: widths.hireDate,
      onHeaderCell: () =>
        ({
          width: widths.hireDate,
          onResize: (w: number) => handleResize("hireDate", w),
        }) as object,
      render: (v?: string) => (v ? dayjs(v).format("MMM DD, YYYY") : null),
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
          PartTime: "geekblue",
          Probationary: "processing",
          Contract: "warning",
          Temporary: "cyan",
          Casual: "default",
          Intern: "magenta",
          OnLeave: "gold",
          Suspended: "orange",
          Terminated: "error",
          Resigned: "volcano",
          Retired: "purple",
          Deceased: "gray",
        };
        const labels: Record<string, string> = {
          PartTime: "Part Time",
          OnLeave: "On Leave",
        };
        return <Tag color={colors[v] ?? "default"}>{labels[v] ?? v}</Tag>;
      },
    },
    {
      title: EMPLOYEE_LABEL.STATUS,
      dataIndex: "status",
      key: "status",
      width: widths.status,
      onHeaderCell: () =>
        ({
          width: widths.status,
          onResize: (w: number) => handleResize("status", w),
        }) as object,
      render: (v?: string) => (
        <Tag color={v === "Active" ? "success" : "default"}>{v ?? "—"}</Tag>
      ),
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
      title: "Contact",
      key: "contact",
      width: widths.contact,
      onHeaderCell: () =>
        ({
          width: widths.contact,
          onResize: (w: number) => handleResize("contact", w),
        }) as object,
      render: (_, record) => record.email || record.contact || null,
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
  ];

  return (
    <div className="flex flex-col gap-3">
      <Table
        rowKey="id"
        dataSource={data}
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
