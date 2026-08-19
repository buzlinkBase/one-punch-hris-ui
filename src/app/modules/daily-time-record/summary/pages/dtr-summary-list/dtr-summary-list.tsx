import { useState } from "react";
import { Button, Dropdown, Select, Space, Typography, message } from "antd";
import type { MenuProps } from "antd";
import { DownloadOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import {
  useDtrBatchCodes,
  useDtrSummaryByBatch,
} from "../../hooks/use-dtr-summary-queries";
import DtrSummaryTable from "../../components/dtr-summary-table";
import { DTR_SUMMARY_LABEL } from "../../constants/label.const";
import {
  buildDtrSummaryCsv,
  buildDtrSummaryExcel,
} from "../../utils/dtr-summary-export.utils";
import { triggerDownload } from "@/shared/utils/export.utils";

const { Title } = Typography;

export default function DtrSummaryList() {
  const [selectedBatchCode, setSelectedBatchCode] = useState<
    string | undefined
  >(undefined);
  const [messageApi, contextHolder] = message.useMessage();

  const { data: batchCodes = [], isLoading: isLoadingCodes } =
    useDtrBatchCodes();

  const {
    data: records = [],
    isLoading: isLoadingRecords,
    refetch,
  } = useDtrSummaryByBatch(selectedBatchCode ?? "", { enabled: false });

  const options = batchCodes.map((item) => ({
    value: item.code ?? "",
    label: item.code ?? "",
  }));

  // ── Export ────────────────────────────────────────────────────────────────────

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
        buildDtrSummaryCsv(records),
        `dtr-summary-${suffix}.csv`,
        "text/plain",
      );
    } else {
      triggerDownload(
        buildDtrSummaryExcel(records),
        `dtr-summary-${suffix}.xls`,
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
    <div className="content-page">
      {contextHolder}

      <div className="page-toolbar">
        <div className="page-toolbar-row">
          <div>
            <Title level={4} className="mb-0!">
              {DTR_SUMMARY_LABEL.TITLE}
            </Title>
            <p className="page-toolbar-subtitle">
              View aggregated DTR summary by batch code.
            </p>
          </div>
          <Space>
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
      </div>

      <div className="mb-4 flex gap-2" style={{ maxWidth: 620 }}>
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
          loading={isLoadingRecords}
          onClick={() => refetch()}
        >
          Search
        </Button>
      </div>

      <DtrSummaryTable data={records} loading={isLoadingRecords} />
    </div>
  );
}
