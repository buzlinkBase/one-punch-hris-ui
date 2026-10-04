import { useMemo } from "react";
import { Table, theme } from "antd";
import type { ColumnsType } from "antd/es/table";
import type { DtrSummaryResponse } from "../../models/api/response/dtr-summary-response.model";
import { ResizableTitle } from "@/shared/components/resizable-title";
import { useResizableColumns } from "@/shared/hooks/use-resizable-columns";

interface Props {
  data: DtrSummaryResponse[];
  loading?: boolean;
}

const R = "right" as const;

const groupHeader = (): object => ({
  style: { fontWeight: 600 },
});

export default function DtrSummaryTable({ data, loading }: Props) {
  const { token } = theme.useToken();
  const { widths, handleResize } = useResizableColumns({
    fullName: 260,
    lateHours: 70,
    utHours: 70,
    overHours: 70,
    absentCount: 60,
    regularNetHours: 80,
    regularOTHours: 75,
    regularNDHours: 75,
    restDayHours: 80,
    restDayOTHours: 75,
    restDayNDHours: 75,
    legalHolHours: 75,
    legalHolOTHours: 75,
    legalHolNightDiffHours: 75,
    specialHolHours: 75,
    specialHolOTHours: 75,
    specialHolNightDiffHours: 80,
    restLegalDayHours: 75,
    restLegalDayOTHours: 75,
    restLegalDayNDHours: 75,
    restSpecialDayHours: 75,
    restSpecialDayOTHours: 75,
    restSpecialDayNDHours: 75,
    doubleLegalHours: 75,
    doubleLegalOTHours: 75,
    doubleLegalNDHours: 75,
    restDoubleLegalHours: 75,
    restDoubleLegalOTHours: 75,
    restDoubleLegalNDHours: 75,
    obHours: 75,
    leaveHours: 100,
    unpaidLeaveHours: 105,
  });

  const sum = (field: keyof DtrSummaryResponse) =>
    data.reduce((acc, row) => acc + ((row[field] as number) ?? 0), 0);

  const totals = useMemo(
    () => ({
      lateHours: sum("lateHours"),
      utHours: sum("utHours"),
      overHours: sum("overHours"),
      absentCount: sum("absentCount"),
      regularNetHours: sum("regularNetHours"),
      regularOTHours: sum("regularOTHours"),
      regularNDHours: sum("regularNDHours"),
      restDayHours: sum("restDayHours"),
      restDayOTHours: sum("restDayOTHours"),
      restDayNDHours: sum("restDayNDHours"),
      legalHolHours: sum("legalHolHours"),
      legalHolOTHours: sum("legalHolOTHours"),
      legalHolNightDiffHours: sum("legalHolNightDiffHours"),
      specialHolHours: sum("specialHolHours"),
      specialHolOTHours: sum("specialHolOTHours"),
      specialHolNightDiffHours: sum("specialHolNightDiffHours"),
      restLegalDayHours: sum("restLegalDayHours"),
      restLegalDayOTHours: sum("restLegalDayOTHours"),
      restLegalDayNDHours: sum("restLegalDayNDHours"),
      restSpecialDayHours: sum("restSpecialDayHours"),
      restSpecialDayOTHours: sum("restSpecialDayOTHours"),
      restSpecialDayNDHours: sum("restSpecialDayNDHours"),
      doubleLegalHours: sum("doubleLegalHours"),
      doubleLegalOTHours: sum("doubleLegalOTHours"),
      doubleLegalNDHours: sum("doubleLegalNDHours"),
      restDoubleLegalHours: sum("restDoubleLegalHours"),
      restDoubleLegalOTHours: sum("restDoubleLegalOTHours"),
      restDoubleLegalNDHours: sum("restDoubleLegalNDHours"),
      obHours: sum("obHours"),
      leaveHours: sum("leaveHours"),
      unpaidLeaveHours: sum("unpaidLeaveHours"),
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data],
  );

  const tc = (v: number) => ({
    align: "right" as const,
    children:
      v === 0 ? (
        <span style={{ color: token.colorTextDisabled, userSelect: "none" }}>
          —
        </span>
      ) : (
        <span style={{ fontWeight: 600 }}>{v.toFixed(1)}</span>
      ),
  });

  const col = (
    title: string,
    dataIndex: keyof DtrSummaryResponse,
    width = 75,
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

  const columns: ColumnsType<DtrSummaryResponse> = [
    {
      title: "Employee",
      dataIndex: "fullName",
      key: "fullName",
      width: widths.fullName ?? 260,
      onHeaderCell: () =>
        ({
          width: widths.fullName ?? 260,
          onResize: (w: number) => handleResize("fullName", w),
        }) as object,
    },
    // ── ATTENDANCE ────────────────────────────────────────────────────────────────
    {
      title: "Attendance",
      onHeaderCell: groupHeader,
      children: [
        {
          title: "Late / Over Break",
          onHeaderCell: groupHeader,
          children: [
            col("Late", "lateHours", 70),
            col("UT", "utHours", 70),
            col("Over", "overHours", 70),
            col("Absent", "absentCount", 60),
          ],
        },
      ],
    },
    // ── HOURS ─────────────────────────────────────────────────────────────────────
    {
      title: "Hours",
      onHeaderCell: groupHeader,
      children: [
        {
          title: "Regular",
          onHeaderCell: groupHeader,
          children: [
            col("Hrs", "regularNetHours", 80),
            col("OT", "regularOTHours", 75),
            col("ND", "regularNDHours", 75),
          ],
        },
        {
          title: "Rest Day",
          onHeaderCell: groupHeader,
          children: [
            col("Hrs", "restDayHours", 80),
            col("OT", "restDayOTHours", 75),
            col("ND", "restDayNDHours", 75),
          ],
        },
        {
          title: "Legal Holiday",
          onHeaderCell: groupHeader,
          children: [
            col("Hrs", "legalHolHours", 75),
            col("OT", "legalHolOTHours", 75),
            col("ND", "legalHolNightDiffHours", 75),
          ],
        },
        {
          title: "Special Holiday",
          onHeaderCell: groupHeader,
          children: [
            col("Hrs", "specialHolHours", 75),
            col("OT", "specialHolOTHours", 75),
            col("ND", "specialHolNightDiffHours", 80),
          ],
        },
        {
          title: "Rest + Legal Day",
          onHeaderCell: groupHeader,
          children: [
            col("Hrs", "restLegalDayHours", 75),
            col("OT", "restLegalDayOTHours", 75),
            col("ND", "restLegalDayNDHours", 75),
          ],
        },
        {
          title: "Rest + Special Day",
          onHeaderCell: groupHeader,
          children: [
            col("Hrs", "restSpecialDayHours", 75),
            col("OT", "restSpecialDayOTHours", 75),
            col("ND", "restSpecialDayNDHours", 75),
          ],
        },
        {
          title: "Double Legal Holiday",
          onHeaderCell: groupHeader,
          children: [
            col("Hrs", "doubleLegalHours", 75),
            col("OT", "doubleLegalOTHours", 75),
            col("ND", "doubleLegalNDHours", 75),
          ],
        },
        {
          title: "Rest + Double Legal",
          onHeaderCell: groupHeader,
          children: [
            col("Hrs", "restDoubleLegalHours", 75),
            col("OT", "restDoubleLegalOTHours", 75),
            col("ND", "restDoubleLegalNDHours", 75),
          ],
        },
        {
          title: "Official Business",
          onHeaderCell: groupHeader,
          children: [col("OB Hrs", "obHours", 75)],
        },
        {
          title: "Leave",
          onHeaderCell: groupHeader,
          children: [
            col("Paid Leave Hours", "leaveHours", 100),
            col("Unpaid Leave Hours", "unpaidLeaveHours", 105),
          ],
        },
      ],
    },
  ];

  return (
    <Table
      rowKey="employeeId"
      dataSource={data}
      columns={columns}
      size="small"
      loading={loading}
      pagination={{ pageSize: 20 }}
      scroll={{ x: "max-content" }}
      bordered
      sticky
      components={{ header: { cell: ResizableTitle } }}
      summary={
        data.length === 0
          ? undefined
          : () => (
              <Table.Summary fixed="bottom">
                <Table.Summary.Row>
                  <Table.Summary.Cell index={0}>
                    <strong>Total</strong>
                  </Table.Summary.Cell>
                  {Object.values(totals).map((v, i) => (
                    <Table.Summary.Cell key={i} index={i + 1} {...tc(v)} />
                  ))}
                </Table.Summary.Row>
              </Table.Summary>
            )
      }
    />
  );
}
