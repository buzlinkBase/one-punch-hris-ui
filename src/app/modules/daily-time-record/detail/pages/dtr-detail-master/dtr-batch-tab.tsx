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
import type { DtrDetailResponse } from "../../models/api/response/dtr-detail-response.model";

type AnyRow = Record<string, unknown>;

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

  const toExportRows = (): AnyRow[] =>
    records.map((r: DtrDetailResponse) => ({
      Employee: r.fullName,
      WorkType: r.workType,
      WorkDate: r.workDate,
      ShiftName: r.shiftName,
      Start: r.startTime ? dayjs(r.startTime).format("HH:mm") : "",
      End: r.endTime ? dayjs(r.endTime).format("HH:mm") : "",
      Late_min: r.lateMinutes,
      UT_min: r.utMinutes,
      OverBreak_min: r.overMinutes,
      Leave_hr: r.leaveHours,
      Reg_hr: r.regularNetHours,
      Reg_OT_hr: r.regularOTHours,
      Reg_ND_hr: r.regularNDHours,
      Reg_ND_OT_hr: r.regularNDOTHours,
      RD_hr: r.restDayHours,
      RD_OT_hr: r.restDayOTHours,
      RD_ND_hr: r.restDayNDHours,
      RD_ND_OT_hr: r.restDayNDOTHours,
      LH_hr: r.legalHolHours,
      LH_OT_hr: r.legalHolOTHours,
      LH_ND_hr: r.legalHolNightDiffHours,
      LH_ND_OT_hr: r.legalHolNightDiffOTHours,
      SPH_hr: r.specialHolHours,
      SPH_OT_hr: r.specialHolOTHours,
      SPH_ND_hr: r.specialHolNightDiffHours,
      SPH_ND_OT_hr: r.specialHolNightDiffOTHours,
      RestLegal_hr: r.restLegalDayHours,
      RestLegal_OT_hr: r.restLegalDayOTHours,
      RestLegal_ND_hr: r.restLegalDayNDHours,
      RestLegal_ND_OT_hr: r.restLegalDayNDOTHours,
      RestSpecial_hr: r.restSpecialDayHours,
      RestSpecial_OT_hr: r.restSpecialDayOTHours,
      RestSpecial_ND_hr: r.restSpecialDayNDHours,
      RestSpecial_ND_OT_hr: r.restSpecialDayNDOTHours,
      DoubleLegal_hr: r.doubleLegalHours,
      DoubleLegal_OT_hr: r.doubleLegalOTHours,
      DoubleLegal_ND_hr: r.doubleLegalNDHours,
      DoubleLegal_ND_OT_hr: r.doubleLegalNDOTHours,
      RestDoubleLegal_hr: r.restDoubleLegalHours,
      RestDoubleLegal_OT_hr: r.restDoubleLegalOTHours,
      RestDoubleLegal_ND_hr: r.restDoubleLegalNDHours,
      RestDoubleLegal_ND_OT_hr: r.restDoubleLegalNDOTHours,
    }));

  const buildCsv = (rows: AnyRow[]): string => {
    if (!rows.length) return "";
    const headers = Object.keys(rows[0]);
    return [
      headers.join(","),
      ...rows.map((r) =>
        headers
          .map((h) => `"${String(r[h] ?? "").replaceAll('"', '""')}"`)
          .join(","),
      ),
    ].join("\n");
  };

  const escapeHtml = (v: string) =>
    v
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");

  const buildExcel = (rows: AnyRow[]): string => {
    if (!rows.length) return "";
    const headers = Object.keys(rows[0]);
    const th = headers.map((h) => `<th>${escapeHtml(h)}</th>`).join("");
    const trs = rows
      .map(
        (r) =>
          `<tr>${headers.map((h) => `<td>${escapeHtml(String(r[h] ?? ""))}</td>`).join("")}</tr>`,
      )
      .join("");
    return `<html><head><meta charset="utf-8"/></head><body><table><thead><tr>${th}</tr></thead><tbody>${trs}</tbody></table></body></html>`;
  };

  const handleExport = (format: "csv" | "excel") => {
    const rows = toExportRows();
    if (!rows.length) {
      messageApi.info("No data to export. Click Search first.");
      return;
    }
    const suffix = selectedBatchCode
      ? selectedBatchCode.replace(/[^a-zA-Z0-9_-]/g, "_")
      : dayjs().format("YYYYMMDD");
    if (format === "csv") {
      const a = document.createElement("a");
      a.href = `data:text/plain;charset=utf-8,${encodeURIComponent(buildCsv(rows))}`;
      a.download = `dtr-detail-${suffix}.csv`;
      a.style.display = "none";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else {
      const blob = new Blob([buildExcel(rows)], {
        type: "application/vnd.ms-excel;charset=utf-8;",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `dtr-detail-${suffix}.xls`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
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
    <>
      {contextHolder}
      <div className="flex justify-end mb-3">
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

      <div className="mb-4 flex gap-2" style={{ maxWidth: 660 }}>
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
    </>
  );
}
