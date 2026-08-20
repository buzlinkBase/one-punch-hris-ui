import { useState } from "react";
import { Button, Dropdown, Popconfirm, Select, Space, message } from "antd";
import type { MenuProps } from "antd";
import {
  DeleteOutlined,
  DownloadOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { useQueryClient } from "@tanstack/react-query";
import {
  useDtrDetailBatchCodes,
  useDtrDetailMaster,
  useDeleteDtrBatch,
} from "../../hooks/use-dtr-detail-queries";
import DtrDetailTable from "../../components/dtr-detail-table";
import {
  buildDtrCsv,
  buildDtrExcel,
  triggerDownload,
} from "../../utils/dtr-export.utils";

export default function DtrBatchTab() {
  const [selectedBatchCode, setSelectedBatchCode] = useState<
    string | undefined
  >(undefined);
  const [messageApi, contextHolder] = message.useMessage();
  const queryClient = useQueryClient();

  const {
    data: batchCodes = [],
    isLoading: isLoadingCodes,
    refetch: refetchBatchCodes,
  } = useDtrDetailBatchCodes();

  const {
    data: records = [],
    isLoading,
    refetch,
  } = useDtrDetailMaster(selectedBatchCode ?? "", { enabled: false });

  const { mutateAsync: deleteBatch, isPending: isDeleting } =
    useDeleteDtrBatch();

  const handleDelete = async () => {
    if (!selectedBatchCode) return;
    await deleteBatch(selectedBatchCode);
    messageApi.success(`Batch "${selectedBatchCode}" deleted.`);
    setSelectedBatchCode(undefined);
    queryClient.invalidateQueries({
      queryKey: ["daily-time-record", "detail", "batch-codes"],
    });
  };

  const options = batchCodes.map((item) => ({
    value: item.code ?? "",
    label: item.code ?? "",
  }));

  const handleExport = (format: "csv" | "excel") => {
    if (!records.length) {
      messageApi.info("No data to export. Click Search first.");
      return;
    }
    const suffix = selectedBatchCode
      ? selectedBatchCode.replace(/[^a-zA-Z0-9_-]/g, "_")
      : dayjs().format("YYYYMMDD");
    if (format === "csv") {
      triggerDownload(
        buildDtrCsv(records),
        `dtr-detail-${suffix}.csv`,
        "text/plain",
      );
    } else {
      triggerDownload(
        buildDtrExcel(records),
        `dtr-detail-${suffix}.xls`,
        "application/vnd.ms-excel;charset=utf-8;",
      );
    }
  };

  const exportMenuItems: MenuProps["items"] = [
    { key: "csv", label: "Export as CSV", onClick: () => handleExport("csv") },
    {
      key: "excel",
      label: "Export as Excel",
      onClick: () => handleExport("excel"),
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      {contextHolder}
      <div className="flex justify-end">
        <Space>
          <Popconfirm
            title="Delete batch"
            description={`Delete all records in "${selectedBatchCode}"?`}
            okText="Delete"
            okButtonProps={{ danger: true }}
            cancelText="Cancel"
            onConfirm={handleDelete}
            disabled={!selectedBatchCode}
          >
            <Button
              danger
              icon={<DeleteOutlined />}
              disabled={!selectedBatchCode}
              loading={isDeleting}
            >
              Delete
            </Button>
          </Popconfirm>
          <Dropdown
            menu={{ items: exportMenuItems }}
            trigger={["click"]}
            disabled={!records.length}
          >
            <Button icon={<DownloadOutlined />} disabled={!records.length}>
              Export
            </Button>
          </Dropdown>
        </Space>
      </div>

      <div className="flex gap-2" style={{ maxWidth: 660 }}>
        <Button
          icon={<ReloadOutlined />}
          loading={isLoadingCodes}
          onClick={() => refetchBatchCodes()}
          title="Refresh batch codes"
        />
        <Select
          showSearch
          allowClear
          loading={isLoadingCodes}
          placeholder="Select or search a DTR batch code…"
          style={{ flex: 1 }}
          options={options}
          value={selectedBatchCode}
          onChange={setSelectedBatchCode}
          filterOption={(input, option) =>
            String(option?.label ?? "")
              .toLowerCase()
              .includes(input.toLowerCase())
          }
        />
        <Button
          type="primary"
          disabled={!selectedBatchCode}
          loading={isLoading}
          onClick={() => refetch()}
        >
          Search
        </Button>
      </div>

      <DtrDetailTable
        data={records}
        loading={isLoading}
        onChanged={() => refetch()}
        readOnly
      />
    </div>
  );
}
