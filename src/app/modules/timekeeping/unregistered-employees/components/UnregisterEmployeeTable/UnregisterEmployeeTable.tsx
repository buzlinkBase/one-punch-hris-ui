import { Button, Popconfirm, Table, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import type { UnregisterEmployeeResponse } from "../../models/api/response/unregister-employee-response.model";
import { UNREGISTER_EMPLOYEE_LABEL } from "../../constants/label.const";

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
  const columns: ColumnsType<UnregisterEmployeeResponse> = [
    {
      title: UNREGISTER_EMPLOYEE_LABEL.EMPLOYEE_NO,
      dataIndex: "employeeNo",
      key: "employeeNo",
      width: 130,
    },
    {
      title: UNREGISTER_EMPLOYEE_LABEL.EMPLOYEE_NAME,
      dataIndex: "employeeName",
      key: "employeeName",
      width: 190,
    },
    {
      title: UNREGISTER_EMPLOYEE_LABEL.DEPARTMENT,
      dataIndex: "department",
      key: "department",
      width: 160,
    },
    {
      title: UNREGISTER_EMPLOYEE_LABEL.POSITION,
      dataIndex: "position",
      key: "position",
      width: 140,
    },
    {
      title: UNREGISTER_EMPLOYEE_LABEL.BIOMETRIC_ID,
      dataIndex: "biometricId",
      key: "biometricId",
      width: 150,
      render: (value: string | null) => value || "-",
    },
    {
      title: UNREGISTER_EMPLOYEE_LABEL.STATUS,
      dataIndex: "status",
      key: "status",
      width: 150,
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
      width: 180,
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
    />
  );
}
