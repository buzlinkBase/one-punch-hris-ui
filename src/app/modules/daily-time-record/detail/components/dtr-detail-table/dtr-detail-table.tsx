import { useState } from "react";
import dayjs from "dayjs";
import { Button, Space, Table, Tooltip, theme } from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  CalendarOutlined,
  EyeOutlined,
  PushpinOutlined,
  SwapOutlined,
} from "@ant-design/icons";
import type { DtrDetailResponse } from "../../models/api/response/dtr-detail-response.model";
import { DTR_DETAIL_LABEL } from "../../constants/label.const";
import { ResizableTitle } from "@/shared/components/resizable-title";
import { useResizableColumns } from "@/shared/hooks/use-resizable-columns";
import DtrAttendanceLogsModal from "../dtr-attendance-logs-modal/dtr-attendance-logs-modal";
import DtrChangeTimeShiftModal from "../dtr-change-time-shift-modal/dtr-change-time-shift-modal";
import DtrChangeRestDayModal from "../dtr-change-rest-day-modal/dtr-change-rest-day-modal";
import DtrSetRestDayModal from "../dtr-set-rest-day-modal/dtr-set-rest-day-modal";
import { useThemeStore } from "@/core/stores/theme.store";

interface Props {
  data: DtrDetailResponse[];
  loading?: boolean;
  onChanged?: () => void;
  readOnly?: boolean;
  dateFrom?: string;
  dateTo?: string;
}

function rowKey(r: DtrDetailResponse) {
  return `${r.employeeId}-${r.workDate}-${r.workType}`;
}

const R = "right" as const;
const L = "left" as const;

function makeGC(isDark: boolean) {
  const g = isDark ? 0.45 : 0.22;
  const s = isDark ? 0.18 : 0.07;
  return {
    minutes: { group: `rgba(100,116,139,${g})`, sub: `rgba(100,116,139,${s})` }, // slate  — penalties/minutes
    regular: { group: `rgba(37,99,235,${g})`, sub: `rgba(37,99,235,${s})` }, // blue   — regular work
    restDay: { group: `rgba(234,88,12,${g})`, sub: `rgba(234,88,12,${s})` }, // orange — rest day work
    legalHol: { group: `rgba(220,38,38,${g})`, sub: `rgba(220,38,38,${s})` }, // red    — legal holiday
    specialHol: {
      group: `rgba(147,51,234,${g})`,
      sub: `rgba(147,51,234,${s})`,
    }, // violet — special holiday
    restLegal: { group: `rgba(5,150,105,${g})`, sub: `rgba(5,150,105,${s})` }, // emerald — rest+legal
    restSpecial: {
      group: `rgba(101,163,13,${g})`,
      sub: `rgba(101,163,13,${s})`,
    }, // lime   — rest+special
    doubleLegal: { group: `rgba(190,18,60,${g})`, sub: `rgba(190,18,60,${s})` }, // rose   — double legal
    restDoubleLegal: {
      group: `rgba(109,40,217,${g})`,
      sub: `rgba(109,40,217,${s})`,
    }, // purple — rest+double
    ob: { group: `rgba(8,145,178,${g})`, sub: `rgba(8,145,178,${s})` }, // cyan   — official business
  };
}

export default function DtrDetailTable({
  data,
  loading,
  onChanged,
  readOnly,
  dateFrom,
  dateTo,
}: Props) {
  const { token } = theme.useToken();
  const isDark = useThemeStore((s) => s.mode) === "dark";
  const GC = makeGC(isDark);
  const groupHeader = (bg: string) => (): object => ({
    style: { backgroundColor: bg, color: token.colorText, fontWeight: 600 },
  });
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [shiftModalOpen, setShiftModalOpen] = useState(false);
  const [restDayModalOpen, setRestDayModalOpen] = useState(false);
  const [restDayDateModalOpen, setRestDayDateModalOpen] = useState(false);

  // Derive selected row from current data — auto-clears when data is replaced
  const selectedRow = data.find((r) => rowKey(r) === selectedKey) ?? null;

  const { widths, handleResize } = useResizableColumns({
    fullName: 260,
    workType: 120,
    workDate: 110,
    shiftName: 150,
    startTime: 75,
    endTime: 75,
    lateMinutes: 75,
    utMinutes: 75,
    overMinutes: 75,
    regularNetHours: 80,
    regularOTHours: 75,
    regularNDHours: 75,
    regularNDOTHours: 75,
    restDayHours: 80,
    restDayOTHours: 75,
    restDayNDHours: 75,
    restDayNDOTHours: 90,
    legalHolHours: 75,
    legalHolOTHours: 75,
    legalHolNightDiffHours: 75,
    legalHolNightDiffOTHours: 90,
    specialHolHours: 75,
    specialHolOTHours: 75,
    specialHolNightDiffHours: 80,
    specialHolNightDiffOTHours: 95,
    restLegalDayHours: 75,
    restLegalDayOTHours: 75,
    restLegalDayNDHours: 75,
    restLegalDayNDOTHours: 80,
    restSpecialDayHours: 75,
    restSpecialDayOTHours: 75,
    restSpecialDayNDHours: 75,
    restSpecialDayNDOTHours: 80,
    doubleLegalHours: 75,
    doubleLegalOTHours: 75,
    doubleLegalNDHours: 75,
    doubleLegalNDOTHours: 90,
    restDoubleLegalHours: 75,
    restDoubleLegalOTHours: 75,
    restDoubleLegalNDHours: 75,
    restDoubleLegalNDOTHours: 90,
    obHours: 75,
    paidLeaveHours: 75,
    unpaidLeaveHours: 85,
  });

  const col = (
    title: string,
    dataIndex: keyof DtrDetailResponse,
    width = 75,
    subBg?: string,
  ) => ({
    title,
    dataIndex,
    key: dataIndex as string,
    align: R,
    width: widths[dataIndex as string] ?? width,
    onHeaderCell: () =>
      ({
        width: widths[dataIndex as string] ?? width,
        onResize: (w: number) => handleResize(dataIndex as string, w),
        style: subBg ? { backgroundColor: subBg } : undefined,
      }) as object,
    render: (v: number | null | undefined) => {
      const n = v ?? 0;
      if (n === 0)
        return (
          <span style={{ color: token.colorTextDisabled, userSelect: "none" }}>
            —
          </span>
        );
      return <span style={{ fontWeight: 500 }}>{n.toFixed(1)}</span>;
    },
  });

  const actionsColumn: ColumnsType<DtrDetailResponse>[number] = {
    key: "row-actions",
    width: 130,
    title: "",
    render: (_: unknown, record: DtrDetailResponse) => {
      const select = () => setSelectedKey(rowKey(record));
      return (
        <Space size={4}>
          <Tooltip title="View Attendance">
            <Button
              size="small"
              icon={<EyeOutlined />}
              onClick={(e) => {
                e.stopPropagation();
                select();
                setModalOpen(true);
              }}
            />
          </Tooltip>
          <Tooltip title="Change Time Shift">
            <Button
              size="small"
              icon={<SwapOutlined />}
              onClick={(e) => {
                e.stopPropagation();
                select();
                setShiftModalOpen(true);
              }}
            />
          </Tooltip>
          <Tooltip title="Change Rest Day">
            <Button
              size="small"
              icon={<CalendarOutlined />}
              onClick={(e) => {
                e.stopPropagation();
                select();
                setRestDayModalOpen(true);
              }}
            />
          </Tooltip>
          <Tooltip title="Set Restday Date">
            <Button
              size="small"
              icon={<PushpinOutlined />}
              onClick={(e) => {
                e.stopPropagation();
                select();
                setRestDayDateModalOpen(true);
              }}
            />
          </Tooltip>
        </Space>
      );
    },
  };

  const columns: ColumnsType<DtrDetailResponse> = [
    ...(readOnly ? [] : [actionsColumn]),
    {
      title: DTR_DETAIL_LABEL.EMPLOYEE,
      dataIndex: "fullName",
      key: "fullName",
      width: widths.fullName,
      align: L,
      onHeaderCell: () =>
        ({
          width: widths.fullName,
          onResize: (w: number) => handleResize("fullName", w),
        }) as object,
    },
    {
      title: DTR_DETAIL_LABEL.WORK_TYPE,
      dataIndex: "workType",
      key: "workType",
      width: widths.workType,
      align: L,
      onHeaderCell: () =>
        ({
          width: widths.workType,
          onResize: (w: number) => handleResize("workType", w),
        }) as object,
    },
    {
      title: DTR_DETAIL_LABEL.DTR_DATE,
      dataIndex: "workDate",
      key: "workDate",
      width: widths.workDate,
      align: L,
      onHeaderCell: () =>
        ({
          width: widths.workDate,
          onResize: (w: number) => handleResize("workDate", w),
        }) as object,
    },
    {
      title: DTR_DETAIL_LABEL.TIME_SHIFT,
      dataIndex: "shiftName",
      key: "shiftName",
      width: widths.shiftName,
      align: L,
      onHeaderCell: () =>
        ({
          width: widths.shiftName,
          onResize: (w: number) => handleResize("shiftName", w),
        }) as object,
      render: (name: string | null, record: DtrDetailResponse) => {
        const start = record.shiftStartTime
          ? dayjs(record.shiftStartTime).format("HH:mm")
          : null;
        const end = record.shiftEndTime
          ? dayjs(record.shiftEndTime).format("HH:mm")
          : null;
        return (
          <div style={{ lineHeight: 1.3 }}>
            <div>{name}</div>
            {(start || end) && (
              <div style={{ fontSize: 11, color: token.colorTextTertiary }}>
                {start ?? "—"} – {end ?? "—"}
              </div>
            )}
          </div>
        );
      },
    },
    {
      title: DTR_DETAIL_LABEL.START,
      dataIndex: "startTime",
      key: "startTime",
      width: widths.startTime,
      align: "center",
      onHeaderCell: () =>
        ({
          width: widths.startTime,
          onResize: (w: number) => handleResize("startTime", w),
        }) as object,
      render: (v: string | null) => (v ? dayjs(v).format("HH:mm") : null),
    },
    {
      title: DTR_DETAIL_LABEL.END,
      dataIndex: "endTime",
      key: "endTime",
      width: widths.endTime,
      align: "center",
      onHeaderCell: () =>
        ({
          width: widths.endTime,
          onResize: (w: number) => handleResize("endTime", w),
        }) as object,
      render: (v: string | null, record) => {
        if (!v) return null;
        const endDay = dayjs(v);
        const isCrossDate = endDay.isAfter(dayjs(record.workDate), "day");
        return (
          <span>
            {endDay.format("HH:mm")}
            {isCrossDate && (
              <sup
                style={{
                  color: token.colorPrimary,
                  fontSize: 9,
                  fontWeight: 700,
                  marginLeft: 2,
                }}
              >
                +1
              </sup>
            )}
          </span>
        );
      },
    },
    // ── MINUTES ──────────────────────────────────────────────────────────────────
    {
      title: "Minutes",
      onHeaderCell: groupHeader(GC.minutes.group),
      children: [
        {
          title: "Late / Over Break",
          onHeaderCell: groupHeader(GC.minutes.group),
          children: [
            col(
              DTR_DETAIL_LABEL.MINUTES_LATE,
              "lateMinutes",
              75,
              GC.minutes.sub,
            ),
            col(DTR_DETAIL_LABEL.MINUTES_UT, "utMinutes", 75, GC.minutes.sub),
            col(
              DTR_DETAIL_LABEL.MINUTES_OVER,
              "overMinutes",
              75,
              GC.minutes.sub,
            ),
          ],
        },
      ],
    },
    // ── HOURS ────────────────────────────────────────────────────────────────────
    {
      title: "Hours",
      onHeaderCell: groupHeader(GC.minutes.group),
      children: [
        {
          title: "Regular",
          onHeaderCell: groupHeader(GC.regular.group),
          children: [
            col("Hrs", "regularNetHours", 80, GC.regular.sub),
            col("OT", "regularOTHours", 75, GC.regular.sub),
            col("ND", "regularNDHours", 75, GC.regular.sub),
            col("ND-OT", "regularNDOTHours", 75, GC.regular.sub),
          ],
        },
        {
          title: "Rest Day",
          onHeaderCell: groupHeader(GC.restDay.group),
          children: [
            col("Hrs", "restDayHours", 80, GC.restDay.sub),
            col("OT", "restDayOTHours", 75, GC.restDay.sub),
            col("ND", "restDayNDHours", 75, GC.restDay.sub),
            col("ND-OT", "restDayNDOTHours", 90, GC.restDay.sub),
          ],
        },
        {
          title: "Legal Holiday",
          onHeaderCell: groupHeader(GC.legalHol.group),
          children: [
            col("Hrs", "legalHolHours", 75, GC.legalHol.sub),
            col("OT", "legalHolOTHours", 75, GC.legalHol.sub),
            col("ND", "legalHolNightDiffHours", 75, GC.legalHol.sub),
            col("ND-OT", "legalHolNightDiffOTHours", 90, GC.legalHol.sub),
          ],
        },
        {
          title: "Special Holiday",
          onHeaderCell: groupHeader(GC.specialHol.group),
          children: [
            col("Hrs", "specialHolHours", 75, GC.specialHol.sub),
            col("OT", "specialHolOTHours", 75, GC.specialHol.sub),
            col("ND", "specialHolNightDiffHours", 80, GC.specialHol.sub),
            col("ND-OT", "specialHolNightDiffOTHours", 95, GC.specialHol.sub),
          ],
        },
        {
          title: "Rest + Legal Day",
          onHeaderCell: groupHeader(GC.restLegal.group),
          children: [
            col("Hrs", "restLegalDayHours", 75, GC.restLegal.sub),
            col("OT", "restLegalDayOTHours", 75, GC.restLegal.sub),
            col("ND", "restLegalDayNDHours", 75, GC.restLegal.sub),
            col("ND-OT", "restLegalDayNDOTHours", 80, GC.restLegal.sub),
          ],
        },
        {
          title: "Rest + Special Day",
          onHeaderCell: groupHeader(GC.restSpecial.group),
          children: [
            col("Hrs", "restSpecialDayHours", 75, GC.restSpecial.sub),
            col("OT", "restSpecialDayOTHours", 75, GC.restSpecial.sub),
            col("ND", "restSpecialDayNDHours", 75, GC.restSpecial.sub),
            col("ND-OT", "restSpecialDayNDOTHours", 80, GC.restSpecial.sub),
          ],
        },
        {
          title: "Double Legal Holiday",
          onHeaderCell: groupHeader(GC.doubleLegal.group),
          children: [
            col("Hrs", "doubleLegalHours", 75, GC.doubleLegal.sub),
            col("OT", "doubleLegalOTHours", 75, GC.doubleLegal.sub),
            col("ND", "doubleLegalNDHours", 75, GC.doubleLegal.sub),
            col("ND-OT", "doubleLegalNDOTHours", 90, GC.doubleLegal.sub),
          ],
        },
        {
          title: "Rest + Double Legal",
          onHeaderCell: groupHeader(GC.restDoubleLegal.group),
          children: [
            col("Hrs", "restDoubleLegalHours", 75, GC.restDoubleLegal.sub),
            col("OT", "restDoubleLegalOTHours", 75, GC.restDoubleLegal.sub),
            col("ND", "restDoubleLegalNDHours", 75, GC.restDoubleLegal.sub),
            col(
              "ND-OT",
              "restDoubleLegalNDOTHours",
              90,
              GC.restDoubleLegal.sub,
            ),
          ],
        },
        {
          title: "Official Business",
          onHeaderCell: groupHeader(GC.ob.group),
          children: [col("OB Hrs", "obHours", 75, GC.ob.sub)],
        },
        {
          title: "Leave",
          onHeaderCell: groupHeader(GC.ob.group),
          children: [
            {
              ...col("Paid Leave Hrs", "paidLeaveHours", 75, GC.ob.sub),
              render: (
                v: number | null | undefined,
                record: DtrDetailResponse,
              ) => {
                const n = v ?? 0;
                const cell =
                  n === 0 ? (
                    <span
                      style={{
                        color: token.colorTextDisabled,
                        userSelect: "none",
                      }}
                    >
                      —
                    </span>
                  ) : (
                    <span style={{ fontWeight: 500 }}>{n.toFixed(1)}</span>
                  );
                if (!record.leavesInfo || record.leavesInfo.length === 0)
                  return cell;
                return (
                  <Tooltip
                    title={
                      <div>
                        {record.leavesInfo.map((li, idx) => (
                          <div key={`${li.leaveId}-${idx}`}>
                            {li.name ?? "Leave"}: {li.hours.toFixed(1)} hrs (
                            {li.payType === "WithoutPay" ? "Unpaid" : "Paid"})
                          </div>
                        ))}
                      </div>
                    }
                  >
                    {cell}
                  </Tooltip>
                );
              },
            },
            col("Unpaid Leave Hrs", "unpaidLeaveHours", 85, GC.ob.sub),
          ],
        },
      ],
    },
  ];

  return (
    <>
      <Table
        rowKey={rowKey}
        dataSource={data}
        columns={columns}
        size="small"
        loading={loading}
        pagination={{ pageSize: 10 }}
        scroll={{ x: "max-content" }}
        bordered
        sticky
        components={{ header: { cell: ResizableTitle } }}
        rowClassName={(record) =>
          rowKey(record) === selectedKey ? "ant-table-row-selected" : ""
        }
        onRow={(record) => ({
          onClick: () => {
            const key = rowKey(record);
            setSelectedKey((prev) => (prev === key ? null : key));
          },
          style: { cursor: "pointer" },
        })}
      />

      {selectedRow && (
        <DtrAttendanceLogsModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          employeeId={selectedRow.employeeId}
          employeeName={selectedRow.fullName}
          workDate={selectedRow.workDate}
          startTime={selectedRow.startTime}
          endTime={selectedRow.endTime}
        />
      )}

      {selectedRow && (
        <DtrChangeTimeShiftModal
          open={shiftModalOpen}
          onClose={() => setShiftModalOpen(false)}
          onSuccess={() => onChanged?.()}
          employeeId={selectedRow.employeeId}
          employeeName={selectedRow.fullName}
          workDate={selectedRow.workDate}
          currentShiftId={selectedRow.shiftId}
          currentShiftName={selectedRow.shiftName}
        />
      )}

      {selectedRow && (
        <DtrChangeRestDayModal
          open={restDayModalOpen}
          onClose={() => setRestDayModalOpen(false)}
          onSuccess={() => onChanged?.()}
          employeeId={selectedRow.employeeId}
          employeeName={selectedRow.fullName}
          workDate={selectedRow.workDate}
        />
      )}

      {selectedRow && (
        <DtrSetRestDayModal
          open={restDayDateModalOpen}
          onClose={() => setRestDayDateModalOpen(false)}
          onSuccess={() => onChanged?.()}
          employeeId={selectedRow.employeeId}
          employeeName={selectedRow.fullName}
          workDate={selectedRow.workDate}
          dateFrom={dateFrom}
          dateTo={dateTo}
        />
      )}
    </>
  );
}
