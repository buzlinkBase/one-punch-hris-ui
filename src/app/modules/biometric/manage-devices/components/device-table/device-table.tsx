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
    sn: 140,
    deviceName: 180,
    description: 200,
    macAddress: 160,
    ipAddress: 140,
    platform: 120,
    oemVendor: 120,
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
      item.macAddress,
      item.ipAddress,
      item.platform,
      item.oemVendor,
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
      title: DEVICE_LABEL.MAC_ADDRESS,
      dataIndex: "macAddress",
      key: "macAddress",
      ...resizable("macAddress"),
    },
    {
      title: DEVICE_LABEL.IP_ADDRESS,
      dataIndex: "ipAddress",
      key: "ipAddress",
      ...resizable("ipAddress"),
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
      title: DEVICE_LABEL.STATUS,
      dataIndex: "status",
      key: "status",
      width: 100,
      fixed: "right",
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
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() =>
              navigate({ to: `/biometric/manage-devices/${record.id}` })
            }
          />
          {onDelete && (
            <Popconfirm
              title="Delete this device?"
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
