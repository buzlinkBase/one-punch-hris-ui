import { Button, Popconfirm, Table, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import type { UnregisterEmployeeResponse } from "../../models/api/response/unregister-employee-response.model";
import { UNREGISTER_EMPLOYEE_LABEL } from "../../constants/label.const";
import { ResizableTitle } from "@/shared/components/resizable-title";
import { useResizableColumns } from "@/shared/hooks/use-resizable-columns";

interface Props {
  data: UnregisterEmployeeResponse[];
  loading?: boolean;
  actionLoadingId?: string | null;
  onRegister: (employeeId: string) => Promise<void> | void;
  onUnregister: (employeeId: string) => Promise<void> | void;
}

export default function UnregisterEmployeeTable({
  data,
  loading,
  actionLoadingId,
  onRegister,
  onUnregister,
}: Props) {
  const { widths, handleResize } = useResizableColumns({
    employeeNo: 130,
    employeeName: 190,
    department: 160,
    position: 140,
    biometricId: 150,
    status: 150,
    lastActionAt: 180,
  });

  const columns: ColumnsType<UnregisterEmployeeResponse> = [
    {
      title: UNREGISTER_EMPLOYEE_LABEL.EMPLOYEE_NO,
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
      title: UNREGISTER_EMPLOYEE_LABEL.EMPLOYEE_NAME,
      dataIndex: "employeeName",
      key: "employeeName",
      width: widths.employeeName,
      onHeaderCell: () =>
        ({
          width: widths.employeeName,
          onResize: (w: number) => handleResize("employeeName", w),
        }) as object,
    },
    {
      title: UNREGISTER_EMPLOYEE_LABEL.DEPARTMENT,
      dataIndex: "department",
      key: "department",
      width: widths.department,
      onHeaderCell: () =>
        ({
          width: widths.department,
          onResize: (w: number) => handleResize("department", w),
        }) as object,
    },
    {
      title: UNREGISTER_EMPLOYEE_LABEL.POSITION,
      dataIndex: "position",
      key: "position",
      width: widths.position,
      onHeaderCell: () =>
        ({
          width: widths.position,
          onResize: (w: number) => handleResize("position", w),
        }) as object,
    },
    {
      title: UNREGISTER_EMPLOYEE_LABEL.BIOMETRIC_ID,
      dataIndex: "biometricId",
      key: "biometricId",
      width: widths.biometricId,
      onHeaderCell: () =>
        ({
          width: widths.biometricId,
          onResize: (w: number) => handleResize("biometricId", w),
        }) as object,
      render: (value: string | null) => value || "-",
    },
    {
      title: UNREGISTER_EMPLOYEE_LABEL.STATUS,
      dataIndex: "status",
      key: "status",
      width: widths.status,
      onHeaderCell: () =>
        ({
          width: widths.status,
          onResize: (w: number) => handleResize("status", w),
        }) as object,
      render: (value: UnregisterEmployeeResponse["status"]) => (
        <Tag color={value === "REGISTERED" ? "green" : "orange"}>
          {value === "REGISTERED"
            ? UNREGISTER_EMPLOYEE_LABEL.STATUS_REGISTERED
            : UNREGISTER_EMPLOYEE_LABEL.STATUS_UNREGISTERED}
        </Tag>
      ),
    },
    {
      title: UNREGISTER_EMPLOYEE_LABEL.LAST_ACTION_AT,
      dataIndex: "lastActionAt",
      key: "lastActionAt",
      width: widths.lastActionAt,
      onHeaderCell: () =>
        ({
          width: widths.lastActionAt,
          onResize: (w: number) => handleResize("lastActionAt", w),
        }) as object,
      render: (value: string) => dayjs(value).format("MMM DD, YYYY hh:mm A"),
    },
    {
      title: UNREGISTER_EMPLOYEE_LABEL.ACTIONS,
      key: "actions",
      fixed: "right",
      width: 150,
      render: (_, record) => {
        const isLoading = actionLoadingId === record.employeeId;

        if (record.status === "REGISTERED") {
          return (
            <Popconfirm
              title="Unregister employee from biometric?"
              onConfirm={() => onUnregister(record.employeeId)}
            >
              <Button danger loading={isLoading}>
                {UNREGISTER_EMPLOYEE_LABEL.UNREGISTER}
              </Button>
            </Popconfirm>
          );
        }

        return (
          <Popconfirm
            title="Register employee to biometric?"
            onConfirm={() => onRegister(record.employeeId)}
          >
            <Button type="primary" loading={isLoading}>
              {UNREGISTER_EMPLOYEE_LABEL.REGISTER}
            </Button>
          </Popconfirm>
        );
      },
    },
  ];

  return (
    <Table
      rowKey="id"
      dataSource={data}
      columns={columns}
      loading={loading}
      size="small"
      pagination={{ pageSize: 10 }}
      scroll={{ x: "max-content" }}
      sticky
      components={{ header: { cell: ResizableTitle } }}
    />
  );
}
