import { SearchOutlined, EditOutlined } from "@ant-design/icons";
import { useNavigate } from "@tanstack/react-router";
import { Button, Input, Popconfirm, Space, Table, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useState } from "react";
import { CLIENT_LABEL } from "../../constants/label.const";
import type { ClientResponse } from "../../models/api/response/client-response.model";
import { ResizableTitle } from "@/shared/components/resizable-title";
import { useResizableColumns } from "@/shared/hooks/use-resizable-columns";

interface Props {
  data: ClientResponse[];
  loading?: boolean;
  onDeactivate?: (id: string) => void;
}

const currencyFormatter = new Intl.NumberFormat("en-PH", {
  style: "currency",
  currency: "PHP",
  minimumFractionDigits: 2,
});

export default function ClientTable({ data, loading, onDeactivate }: Props) {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const { widths, handleResize } = useResizableColumns({
    clientCode: 130,
    clientName: 200,
    contactPerson: 160,
    contactNumber: 140,
    unpaidDues: 130,
    status: 120,
  });

  const filtered = data.filter((item) =>
    Object.values(item).some((value) =>
      String(value ?? "")
        .toLowerCase()
        .includes(search.toLowerCase()),
    ),
  );

  const columns: ColumnsType<ClientResponse> = [
    {
      title: CLIENT_LABEL.CLIENT_CODE,
      dataIndex: "clientCode",
      key: "clientCode",
      width: widths.clientCode,
      onHeaderCell: () =>
        ({
          width: widths.clientCode,
          onResize: (w: number) => handleResize("clientCode", w),
        }) as object,
    },
    {
      title: CLIENT_LABEL.CLIENT_NAME,
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
      title: CLIENT_LABEL.CONTACT_PERSON,
      dataIndex: "contactPerson",
      key: "contactPerson",
      width: widths.contactPerson,
      onHeaderCell: () =>
        ({
          width: widths.contactPerson,
          onResize: (w: number) => handleResize("contactPerson", w),
        }) as object,
    },
    {
      title: CLIENT_LABEL.CONTACT_NUMBER,
      dataIndex: "contactNumber",
      key: "contactNumber",
      width: widths.contactNumber,
      onHeaderCell: () =>
        ({
          width: widths.contactNumber,
          onResize: (w: number) => handleResize("contactNumber", w),
        }) as object,
    },
    {
      title: CLIENT_LABEL.UNPAID_DUES,
      dataIndex: "unpaidDues",
      key: "unpaidDues",
      width: widths.unpaidDues,
      onHeaderCell: () =>
        ({
          width: widths.unpaidDues,
          onResize: (w: number) => handleResize("unpaidDues", w),
        }) as object,
      render: (value: number) => currencyFormatter.format(value),
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
      render: (value: ClientResponse["status"]) => (
        <Tag color={value === "ACTIVE" ? "green" : "red"}>{value}</Tag>
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
            onClick={() => navigate({ to: `/clients/${record.id}` })}
          />
          {onDeactivate &&
          record.status === "ACTIVE" &&
          record.unpaidDues > 0 ? (
            <Popconfirm
              title="Deactivate this client due to unpaid dues?"
              description="This will mark the client as inactive."
              onConfirm={() => onDeactivate(record.id)}
              okText="Yes"
              cancelText="No"
            >
              <Button type="link" danger>
                Deactivate
              </Button>
            </Popconfirm>
          ) : (
            <Button type="link" danger disabled>
              Deactivate
            </Button>
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
        onChange={(event) => setSearch(event.target.value)}
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
