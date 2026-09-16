import { useState } from "react";
import { Table, Button, Space, Popconfirm, Input, Tag } from "antd";
import {
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { ResizableTitle } from "@/shared/components/resizable-title";
import { useResizableColumns } from "@/shared/hooks/use-resizable-columns";
import { useNavigate } from "@tanstack/react-router";
import type { BiometricDeviceModel } from "../../models/api/response/device-response.model";
import { DEVICE_LABEL } from "../../constants/label.const";
import { PermissionGate } from "@/shared/components/permission-gate/permission-gate";

interface Props {
  data: BiometricDeviceModel[];
  loading?: boolean;
  onDelete?: (id: string) => void;
}

const STATUS_COLOR: Record<string, string> = {
  Active: "success",
  Inactive: "default",
};

export default function DeviceTable({ data, loading, onDelete }: Props) {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const { widths, handleResize } = useResizableColumns({
    sn: 160,
    deviceName: 180,
    description: 200,
    platform: 120,
    oemVendor: 120,
    fwVersion: 120,
    pushVersion: 120,
    regDeviceType: 120,
    state: 100,
  });

  const resizable = (key: string) =>
    ({
      width: widths[key],
      onHeaderCell: () =>
        ({
          width: widths[key],
          onResize: (w: number) => handleResize(key, w),
        }) as object,
    }) as object;

  const filtered = data.filter((item) =>
    [
      item.sn,
      item.deviceName,
      item.description,
      item.platform,
      item.oemVendor,
      item.regDeviceType,
      item.state,
      item.status,
    ].some((val) =>
      String(val ?? "")
        .toLowerCase()
        .includes(search.toLowerCase()),
    ),
  );

  const columns: ColumnsType<BiometricDeviceModel> = [
    { title: DEVICE_LABEL.SN, dataIndex: "sn", key: "sn", ...resizable("sn") },
    {
      title: DEVICE_LABEL.DEVICE_NAME,
      dataIndex: "deviceName",
      key: "deviceName",
      ...resizable("deviceName"),
    },
    {
      title: DEVICE_LABEL.DESCRIPTION,
      dataIndex: "description",
      key: "description",
      ...resizable("description"),
    },
    {
      title: DEVICE_LABEL.PLATFORM,
      dataIndex: "platform",
      key: "platform",
      ...resizable("platform"),
    },
    {
      title: DEVICE_LABEL.OEM_VENDOR,
      dataIndex: "oemVendor",
      key: "oemVendor",
      ...resizable("oemVendor"),
    },
    {
      title: DEVICE_LABEL.FW_VERSION,
      dataIndex: "fwVersion",
      key: "fwVersion",
      ...resizable("fwVersion"),
    },
    {
      title: DEVICE_LABEL.PUSH_VERSION,
      dataIndex: "pushVersion",
      key: "pushVersion",
      ...resizable("pushVersion"),
    },
    {
      title: DEVICE_LABEL.REG_DEVICE_TYPE,
      dataIndex: "regDeviceType",
      key: "regDeviceType",
      ...resizable("regDeviceType"),
    },
    {
      title: DEVICE_LABEL.STATE,
      dataIndex: "state",
      key: "state",
      ...resizable("state"),
    },
    {
      title: DEVICE_LABEL.STATUS,
      dataIndex: "status",
      key: "status",
      width: 100,
      render: (v: string) => (
        <Tag color={STATUS_COLOR[v] ?? "default"}>{v}</Tag>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      fixed: "right",
      width: 80,
      render: (_, record) => (
        <Space>
          <PermissionGate permission="Biometric Setup:Edit">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() =>
                navigate({ to: `/biometric/manage-devices/${record.id}` })
              }
            />
          </PermissionGate>
          {onDelete && (
            <PermissionGate permission="Biometric Setup:Delete">
              <Popconfirm
                title="Delete this device?"
                onConfirm={() => onDelete(record.id)}
                okText="Yes"
                cancelText="No"
              >
                <Button type="text" danger icon={<DeleteOutlined />} />
              </Popconfirm>
            </PermissionGate>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-3">
      <Input
        prefix={<SearchOutlined />}
        placeholder="Search by SN, name, IP, platform..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        allowClear
        style={{ maxWidth: 360 }}
      />
      <Table
        rowKey="id"
        dataSource={filtered}
        columns={columns}
        components={{ header: { cell: ResizableTitle } }}
        size="small"
        loading={loading}
        pagination={{ pageSize: 15 }}
        scroll={{ x: "max-content" }}
        sticky
      />
    </div>
  );
}
