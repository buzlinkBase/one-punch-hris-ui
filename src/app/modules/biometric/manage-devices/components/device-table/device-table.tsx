import { useState } from "react";
import { Table, Button, Space, Popconfirm, Input, Tag } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
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
    { title: DEVICE_LABEL.SN, dataIndex: "sn", key: "sn", width: 140 },
    {
      title: DEVICE_LABEL.DEVICE_NAME,
      dataIndex: "deviceName",
      key: "deviceName",
      width: 180,
      render: (v: string) => v || "—",
    },
    {
      title: DEVICE_LABEL.DESCRIPTION,
      dataIndex: "description",
      key: "description",
      width: 200,
      render: (v: string) => v || "—",
    },
    {
      title: DEVICE_LABEL.MAC_ADDRESS,
      dataIndex: "macAddress",
      key: "macAddress",
      width: 160,
      render: (v: string) => v || "—",
    },
    {
      title: DEVICE_LABEL.IP_ADDRESS,
      dataIndex: "ipAddress",
      key: "ipAddress",
      width: 140,
      render: (v: string) => v || "—",
    },
    {
      title: DEVICE_LABEL.PLATFORM,
      dataIndex: "platform",
      key: "platform",
      width: 120,
      render: (v: string) => v || "—",
    },
    {
      title: DEVICE_LABEL.OEM_VENDOR,
      dataIndex: "oemVendor",
      key: "oemVendor",
      width: 120,
      render: (v: string) => v || "—",
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
      width: 140,
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            onClick={() =>
              navigate({ to: `/biometric/manage-devices/${record.id}` })
            }
          >
            Edit
          </Button>
          {onDelete && (
            <Popconfirm
              title="Delete this device?"
              onConfirm={() => onDelete(record.id)}
              okText="Yes"
              cancelText="No"
            >
              <Button type="link" danger>
                Delete
              </Button>
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
        size="small"
        loading={loading}
        pagination={{ pageSize: 15 }}
        scroll={{ x: "max-content" }}
        sticky
      />
    </div>
  );
}
