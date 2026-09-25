import { Table, Button, Space, Dropdown, Tag, Modal, message } from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  MailOutlined,
  PrinterOutlined,
  FileProtectOutlined,
  WalletOutlined,
  MoreOutlined,
  ExclamationCircleFilled,
} from "@ant-design/icons";
import type { ColumnsType, ColumnType, TableProps } from "antd/es/table";
import type { MenuProps } from "antd";
import { useNavigate } from "@tanstack/react-router";
import dayjs from "dayjs";
import type { EmployeeResponse } from "../../models/api/response/employee-response.model";
import type { EmployeeListQuery } from "../../models/api/request/employee-list-query.model";
import {
  EMPLOYEE_LABEL,
  EMPLOYMENT_STATUS_OPTIONS,
  GENDER_OPTIONS,
  JOB_LEVEL_OPTIONS,
  SALARY_TYPE_OPTIONS,
} from "../../constants/label.const";
import { formatFullName } from "../../utils/format-full-name";
import { useEmployeeFilterOptions } from "../../hooks/use-employee-queries";
import {
  applyTableFiltersAndSort,
  LIST_FILTER_COLUMNS,
  TEXT_FILTER_COLUMNS,
} from "./employee-list-query.mapper";
import { ResizableTitle } from "@/shared/components/resizable-title";
import { useResizableColumns } from "@/shared/hooks/use-resizable-columns";
import {
  dateRangeColumnFilter,
  textColumnFilter,
} from "@/shared/components/table-column-filters";
import httpClient from "@/core/http/http-client";
import { API_PREFIX, buildApiUrl } from "@/core/http/api-url.util";
import { PermissionGate } from "@/shared/components/permission-gate/permission-gate";
import { authStorage } from "@/core/auth/auth-storage";

interface Props {
  data: EmployeeResponse[];
  loading?: boolean;
  /** Current server query -- drives the controlled page, sort and column filter state. */
  query: EmployeeListQuery;
  /** Total rows matching the current filters (server-side count). */
  total: number;
  onQueryChange: (query: EmployeeListQuery) => void;
  onDelete?: (id: string) => void;
  onInvite?: (record: EmployeeResponse) => void;
  onPriorEmployerTax?: (record: EmployeeResponse) => void;
  onOpeningBalance?: (record: EmployeeResponse) => void;
}

const JOB_LEVEL_LABELS: Record<string, string> = {
  RankandFile: "Rank and File",
  EntryLevel: "Entry Level",
  TechnicalSpecialist: "Technical Specialist",
};

const STATUS_OPTIONS = [
  { text: "Active", value: "Active" },
  { text: "Inactive", value: "Inactive" },
];

const toFilterOptions = (options: { value: string; label: string }[]) =>
  options.map((o) => ({ text: o.label, value: o.value }));

export default function EmployeeTable({
  data,
  loading,
  query,
  total,
  onQueryChange,
  onDelete,
  onInvite,
  onPriorEmployerTax,
  onOpeningBalance,
}: Props) {
  const navigate = useNavigate();
  const filterOptions = useEmployeeFilterOptions();

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
    email: 160,
    sssNo: 130,
    phicNo: 140,
    hdmfNo: 130,
    tin: 120,
  });

  // Shared column plumbing: resizable header, server-driven sorting, and the column's filter
  // (lookup/enum list, free text, or date range) -- all controlled from `query`.
  type Width = keyof typeof widths;
  const resizable = (key: Width): ColumnType<EmployeeResponse> => ({
    key,
    width: widths[key],
    onHeaderCell: () =>
      ({
        width: widths[key],
        onResize: (w: number) => handleResize(key, w),
      }) as object,
  });
  const sortable = (key: string): ColumnType<EmployeeResponse> => ({
    sorter: true,
    sortOrder: query.sortField === key ? (query.sortOrder ?? null) : null,
  });
  const listFilter = (
    key: string,
    options: { text: string; value: string }[],
  ): ColumnType<EmployeeResponse> => ({
    filters: options,
    filterSearch: options.length > 8,
    filteredValue: query[LIST_FILTER_COLUMNS[key]] ?? null,
  });
  const textFilter = (key: string, placeholder: string) =>
    textColumnFilter<EmployeeResponse>(
      query[TEXT_FILTER_COLUMNS[key]],
      placeholder,
    );

  const columns: ColumnsType<EmployeeResponse> = [
    {
      title: "Actions",
      key: "actions",
      width: 90,
      fixed: "left",
      render: (_, record) => {
        const menuItems: MenuProps["items"] = [
          {
            key: "print201",
            icon: <PrinterOutlined />,
            label: "Print 201 File",
            onClick: () => handlePrint201(record.id),
          },
          onInvite && {
            key: "invite",
            icon: <MailOutlined />,
            label: "Invite to Company",
            onClick: () => onInvite(record),
          },
          onPriorEmployerTax && {
            key: "priorEmployerTax",
            icon: <FileProtectOutlined />,
            label: "Prior Employer (BIR 2316)",
            onClick: () => onPriorEmployerTax(record),
          },
          onOpeningBalance && {
            key: "openingBalance",
            icon: <WalletOutlined />,
            label: "Opening Balance (Pre-System YTD)",
            onClick: () => onOpeningBalance(record),
          },
          onDelete &&
            authStorage.hasAnyPermission("Workforce Setup:Delete") && {
              type: "divider" as const,
            },
          onDelete &&
            authStorage.hasAnyPermission("Workforce Setup:Delete") && {
              key: "delete",
              icon: <DeleteOutlined />,
              label: "Delete",
              danger: true,
              onClick: () =>
                Modal.confirm({
                  title: "Delete this employee?",
                  icon: <ExclamationCircleFilled />,
                  content: `${formatFullName(record)} will be permanently removed.`,
                  okText: "Delete",
                  okType: "danger",
                  cancelText: "Cancel",
                  onOk: () => onDelete(record.id),
                }),
            },
        ].filter(Boolean) as MenuProps["items"];

        return (
          <Space>
            <PermissionGate permission="Workforce Setup:Edit">
              <Button
                type="text"
                icon={<EditOutlined />}
                title="Edit"
                onClick={() => navigate({ to: `/setup/employee/${record.id}` })}
              />
            </PermissionGate>
            <Dropdown trigger={["click"]} menu={{ items: menuItems }}>
              <Button
                type="text"
                icon={<MoreOutlined />}
                title="More actions"
              />
            </Dropdown>
          </Space>
        );
      },
    },
    {
      title: EMPLOYEE_LABEL.EMPLOYEE_NO,
      dataIndex: "employeeNo",
      ...resizable("employeeNo"),
      ...sortable("employeeNo"),
      ...textFilter("employeeNo", "Search employee no."),
    },
    {
      title: EMPLOYEE_LABEL.BIO_ID,
      dataIndex: "bioId",
      ...resizable("bioId"),
      ...sortable("bioId"),
      ...textFilter("bioId", "Search Bio ID"),
    },
    {
      title: "Full Name",
      ...resizable("fullName"),
      ...sortable("fullName"),
      ...textFilter("fullName", "Search name"),
      render: (_, record) => formatFullName(record),
    },
    {
      title: EMPLOYEE_LABEL.POSITION,
      dataIndex: "positionName",
      ...resizable("positionName"),
      ...sortable("positionName"),
      ...listFilter("positionName", filterOptions.positions),
    },
    {
      title: EMPLOYEE_LABEL.DEPARTMENT,
      dataIndex: "departmentName",
      ...resizable("departmentName"),
      ...sortable("departmentName"),
      ...listFilter("departmentName", filterOptions.departments),
    },
    {
      title: EMPLOYEE_LABEL.CLIENT,
      dataIndex: "clientName",
      ...resizable("clientName"),
      ...sortable("clientName"),
      ...listFilter("clientName", filterOptions.clients),
    },
    {
      title: EMPLOYEE_LABEL.AREA,
      dataIndex: "areaName",
      ...resizable("areaName"),
      ...sortable("areaName"),
      ...listFilter("areaName", filterOptions.areas),
    },
    {
      title: EMPLOYEE_LABEL.BRANCH,
      dataIndex: "branchName",
      ...resizable("branchName"),
      ...sortable("branchName"),
      ...listFilter("branchName", filterOptions.branches),
    },
    {
      title: EMPLOYEE_LABEL.PAYROLL_GROUP,
      dataIndex: "payrollGroupName",
      ...resizable("payrollGroupName"),
      ...sortable("payrollGroupName"),
      ...listFilter("payrollGroupName", filterOptions.payrollGroups),
    },
    {
      title: EMPLOYEE_LABEL.JOB_LEVEL,
      dataIndex: "jobLevel",
      ...resizable("jobLevel"),
      ...sortable("jobLevel"),
      ...listFilter("jobLevel", toFilterOptions(JOB_LEVEL_OPTIONS)),
      render: (v?: string) => (v ? (JOB_LEVEL_LABELS[v] ?? v) : null),
    },
    {
      title: EMPLOYEE_LABEL.TIME_SHIFT,
      dataIndex: "timeShiftName",
      ...resizable("timeShiftName"),
      ...sortable("timeShiftName"),
      ...listFilter("timeShiftName", filterOptions.timeShifts),
    },
    {
      title: EMPLOYEE_LABEL.REST_DAYS,
      dataIndex: "restDays",
      ...resizable("restDays"),
      render: (restDays?: EmployeeResponse["restDays"]) =>
        restDays?.length
          ? restDays.map((r) => (
              <Tag key={r.dayName} className="mb-0.5">
                {r.dayName.slice(0, 3)}
              </Tag>
            ))
          : null,
    },
    {
      title: EMPLOYEE_LABEL.SALARY_TYPE,
      dataIndex: "salaryType",
      ...resizable("salaryType"),
      ...sortable("salaryType"),
      ...listFilter("salaryType", toFilterOptions(SALARY_TYPE_OPTIONS)),
      render: (v?: string) =>
        v ? <Tag>{v === "FIXED" ? "Fixed" : "Variable"}</Tag> : null,
    },
    {
      title: EMPLOYEE_LABEL.HIRE_DATE,
      dataIndex: "hireDate",
      ...resizable("hireDate"),
      ...sortable("hireDate"),
      ...dateRangeColumnFilter<EmployeeResponse>(
        query.hireDateFrom,
        query.hireDateTo,
      ),
      render: (v?: string) => (v ? dayjs(v).format("MMM DD, YYYY") : null),
    },
    {
      title: EMPLOYEE_LABEL.EMPLOYMENT_STATUS,
      dataIndex: "employmentStatus",
      ...resizable("employmentStatus"),
      ...sortable("employmentStatus"),
      ...listFilter(
        "employmentStatus",
        toFilterOptions(EMPLOYMENT_STATUS_OPTIONS),
      ),
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
      ...resizable("status"),
      ...sortable("status"),
      ...listFilter("status", STATUS_OPTIONS),
      render: (v?: string) => (
        <Tag color={v === "Active" ? "success" : "default"}>{v ?? "—"}</Tag>
      ),
    },
    {
      title: EMPLOYEE_LABEL.GENDER,
      dataIndex: "gender",
      ...resizable("gender"),
      ...sortable("gender"),
      ...listFilter("gender", toFilterOptions(GENDER_OPTIONS)),
    },
    {
      title: "Contact",
      ...resizable("contact"),
      ...sortable("contact"),
      ...textFilter("contact", "Search contact"),
      render: (_, record) => record.contact || null,
    },
    {
      title: "Email",
      ...resizable("email"),
      ...sortable("email"),
      ...textFilter("email", "Search email"),
      render: (_, record) => record.email || null,
    },
    {
      title: EMPLOYEE_LABEL.SSS_NO,
      dataIndex: "sssNo",
      ...resizable("sssNo"),
      ...sortable("sssNo"),
      ...textFilter("sssNo", "Search SSS no."),
    },
    {
      title: EMPLOYEE_LABEL.PHIC_NO,
      dataIndex: "phicNo",
      ...resizable("phicNo"),
      ...sortable("phicNo"),
      ...textFilter("phicNo", "Search PhilHealth no."),
    },
    {
      title: EMPLOYEE_LABEL.HDMF_NO,
      dataIndex: "hdmfNo",
      ...resizable("hdmfNo"),
      ...sortable("hdmfNo"),
      ...textFilter("hdmfNo", "Search Pag-IBIG no."),
    },
    {
      title: EMPLOYEE_LABEL.TIN,
      dataIndex: "tin",
      ...resizable("tin"),
      ...sortable("tin"),
      ...textFilter("tin", "Search TIN"),
    },
  ];

  const handleChange: TableProps<EmployeeResponse>["onChange"] = (
    pagination,
    filters,
    sorter,
    { action },
  ) => {
    if (action === "paginate") {
      const limit = pagination.pageSize ?? query.limit;
      onQueryChange({
        ...query,
        limit,
        // A page-size change re-slices everything -- start over at page 1.
        page: limit !== query.limit ? 1 : (pagination.current ?? 1),
      });
      return;
    }
    onQueryChange(applyTableFiltersAndSort(query, filters, sorter));
  };

  return (
    <div className="flex flex-col gap-3">
      <Table
        rowKey="id"
        dataSource={data}
        columns={columns}
        size="small"
        loading={loading}
        onChange={handleChange}
        pagination={{
          current: query.page,
          pageSize: query.limit,
          total,
          showSizeChanger: true,
          pageSizeOptions: [10, 20, 50, 100],
          showTotal: (count, [from, to]) => `${from}–${to} of ${count}`,
        }}
        scroll={{ x: "max-content" }}
        sticky
        components={{ header: { cell: ResizableTitle } }}
      />
    </div>
  );
}
