import { useState } from "react";
import { Table, Button, Space, Popconfirm, Input, Tooltip } from "antd";
import {
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { useNavigate } from "@tanstack/react-router";
import type { ClientResponse } from "../../models/api/response/client-response.model";
import { CLIENT_LABEL } from "../../constants/label.const";
import { ResizableTitle } from "@/shared/components/resizable-title";
import { useResizableColumns } from "@/shared/hooks/use-resizable-columns";
import ClientSettingsModal from "../client-settings-modal/client-settings-modal";

interface Props {
  data: ClientResponse[];
  loading?: boolean;
  onDelete?: (id: string) => void;
}

export default function ClientTable({ data, loading, onDelete }: Props) {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [settingsClient, setSettingsClient] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const { widths, handleResize } = useResizableColumns({
    code: 120,
    name: 200,
    status: 120,
  });

  const filtered = data.filter((item) =>
    Object.values(item).some((val) =>
      String(val ?? "")
        .toLowerCase()
        .includes(search.toLowerCase()),
    ),
  );

  const columns: ColumnsType<ClientResponse> = [
    {
      title: CLIENT_LABEL.CODE,
      dataIndex: "code",
      key: "code",
      width: widths.code,
      onHeaderCell: () =>
        ({
          width: widths.code,
          onResize: (w: number) => handleResize("code", w),
        }) as object,
    },
    {
      title: CLIENT_LABEL.NAME,
      dataIndex: "name",
      key: "name",
      width: widths.name,
      onHeaderCell: () =>
        ({
          width: widths.name,
          onResize: (w: number) => handleResize("name", w),
        }) as object,
    },
    {
      title: CLIENT_LABEL.STATUS,
      dataIndex: "status",
      key: "status",
      width: widths.status,
      onHeaderCell: () =>
        ({
          width: widths.status,
          onResize: (w: number) => handleResize("status", w),
        }) as object,
    },
    {
      title: "Actions",
      key: "actions",
      fixed: "right",
      width: 150,
      render: (_, record) => (
        <Space>
          <Tooltip title="Client Settings">
            <Button
              type="text"
              icon={<SettingOutlined />}
              onClick={() =>
                setSettingsClient({ id: record.id, name: record.name })
              }
            />
          </Tooltip>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => navigate({ to: `/setup/client/${record.id}` })}
          />
          {onDelete && (
            <Popconfirm
              title="Delete this client?"
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
      {settingsClient && (
        <ClientSettingsModal
          clientId={settingsClient.id}
          clientName={settingsClient.name}
          onClose={() => setSettingsClient(null)}
        />
      )}
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
