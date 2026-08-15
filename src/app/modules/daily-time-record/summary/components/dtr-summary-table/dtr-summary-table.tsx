import { useMemo } from "react";
import { Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import type { DtrSummaryResponse } from "../../models/api/response/dtr-summary-response.model";
import { ResizableTitle } from "@/shared/components/resizable-title";
import { useResizableColumns } from "@/shared/hooks/use-resizable-columns";

interface Props {
  data: DtrSummaryResponse[];
  loading?: boolean;
}

const R = "right" as const;

const GC = {
  attendance: { group: "#e4e9ee", sub: "#f8fafc" },
  regular: { group: "#dae8f5", sub: "#f4f9fe" },
  restDay: { group: "#f3e9d4", sub: "#fdfaf3" },
  legalHol: { group: "#f3dcdc", sub: "#fdf5f5" },
  specialHol: { group: "#ebe6f5", sub: "#f8f5fd" },
  restLegal: { group: "#d3ece8", sub: "#f0faf8" },
  restSpecial: { group: "#d4edd4", sub: "#f0faf0" },
  doubleLegal: { group: "#f0cccc", sub: "#fdf0f0" },
  restDoubleLegal: { group: "#dcd4f0", sub: "#f5f0fd" },
  ob: { group: "#ccece6", sub: "#f0faf8" },
};

const groupHeader = (bg: string) => (): object => ({
  style: { backgroundColor: bg, color: "#374151", fontWeight: 600 },
});

export default function DtrSummaryTable({ data, loading }: Props) {
  const { widths, handleResize } = useResizableColumns({
    fullName: 260,
    lateHours: 70,
    utHours: 70,
    overHours: 70,
    absentCount: 60,
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
    leaveHours: 75,
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
      regularNDOTHours: sum("regularNDOTHours"),
      restDayHours: sum("restDayHours"),
      restDayOTHours: sum("restDayOTHours"),
      restDayNDHours: sum("restDayNDHours"),
      restDayNDOTHours: sum("restDayNDOTHours"),
      legalHolHours: sum("legalHolHours"),
      legalHolOTHours: sum("legalHolOTHours"),
      legalHolNightDiffHours: sum("legalHolNightDiffHours"),
      legalHolNightDiffOTHours: sum("legalHolNightDiffOTHours"),
      specialHolHours: sum("specialHolHours"),
      specialHolOTHours: sum("specialHolOTHours"),
      specialHolNightDiffHours: sum("specialHolNightDiffHours"),
      specialHolNightDiffOTHours: sum("specialHolNightDiffOTHours"),
      restLegalDayHours: sum("restLegalDayHours"),
      restLegalDayOTHours: sum("restLegalDayOTHours"),
      restLegalDayNDHours: sum("restLegalDayNDHours"),
      restLegalDayNDOTHours: sum("restLegalDayNDOTHours"),
      restSpecialDayHours: sum("restSpecialDayHours"),
      restSpecialDayOTHours: sum("restSpecialDayOTHours"),
      restSpecialDayNDHours: sum("restSpecialDayNDHours"),
      restSpecialDayNDOTHours: sum("restSpecialDayNDOTHours"),
      doubleLegalHours: sum("doubleLegalHours"),
      doubleLegalOTHours: sum("doubleLegalOTHours"),
      doubleLegalNDHours: sum("doubleLegalNDHours"),
      doubleLegalNDOTHours: sum("doubleLegalNDOTHours"),
      restDoubleLegalHours: sum("restDoubleLegalHours"),
      restDoubleLegalOTHours: sum("restDoubleLegalOTHours"),
      restDoubleLegalNDHours: sum("restDoubleLegalNDHours"),
      restDoubleLegalNDOTHours: sum("restDoubleLegalNDOTHours"),
      obHours: sum("obHours"),
      leaveHours: sum("leaveHours"),
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data],
  );

  const tc = (v: number) => ({
    align: "right" as const,
    children:
      v === 0 ? (
        <span style={{ color: "#d9d9d9", userSelect: "none" }}>—</span>
      ) : (
        <span style={{ fontWeight: 600 }}>{v.toFixed(1)}</span>
      ),
  });

  const col = (
    title: string,
    dataIndex: keyof DtrSummaryResponse,
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
        return <span style={{ color: "#d9d9d9", userSelect: "none" }}>—</span>;
      return <span style={{ fontWeight: 500 }}>{n.toFixed(1)}</span>;
    },
  });

  const columns: ColumnsType<DtrSummaryResponse> = [
    {
      title: "Employee",
      dataIndex: "fullName",
      key: "fullName",
      fixed: "left" as const,
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
      onHeaderCell: groupHeader(GC.attendance.group),
      children: [
        {
          title: "Late / Over Break",
          onHeaderCell: groupHeader(GC.attendance.group),
          children: [
            col("Late", "lateHours", 70, GC.attendance.sub),
            col("UT", "utHours", 70, GC.attendance.sub),
            col("Over", "overHours", 70, GC.attendance.sub),
            col("Absent", "absentCount", 60, GC.attendance.sub),
          ],
        },
      ],
    },
    // ── HOURS ─────────────────────────────────────────────────────────────────────
    {
      title: "Hours",
      onHeaderCell: groupHeader(GC.attendance.group),
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
          children: [col("Leave Hrs", "leaveHours", 75, GC.ob.sub)],
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
                  <Table.Summary.Cell index={1} {...tc(totals.lateHours)} />
                  <Table.Summary.Cell index={2} {...tc(totals.utHours)} />
                  <Table.Summary.Cell index={3} {...tc(totals.overHours)} />
                  <Table.Summary.Cell index={4} {...tc(totals.absentCount)} />
                  <Table.Summary.Cell
                    index={5}
                    {...tc(totals.regularNetHours)}
                  />
                  <Table.Summary.Cell
                    index={6}
                    {...tc(totals.regularOTHours)}
                  />
                  <Table.Summary.Cell
                    index={7}
                    {...tc(totals.regularNDHours)}
                  />
                  <Table.Summary.Cell
                    index={8}
                    {...tc(totals.regularNDOTHours)}
                  />
                  <Table.Summary.Cell index={9} {...tc(totals.restDayHours)} />
                  <Table.Summary.Cell
                    index={10}
                    {...tc(totals.restDayOTHours)}
                  />
                  <Table.Summary.Cell
                    index={11}
                    {...tc(totals.restDayNDHours)}
                  />
                  <Table.Summary.Cell
                    index={12}
                    {...tc(totals.restDayNDOTHours)}
                  />
                  <Table.Summary.Cell
                    index={13}
                    {...tc(totals.legalHolHours)}
                  />
                  <Table.Summary.Cell
                    index={14}
                    {...tc(totals.legalHolOTHours)}
                  />
                  <Table.Summary.Cell
                    index={15}
                    {...tc(totals.legalHolNightDiffHours)}
                  />
                  <Table.Summary.Cell
                    index={16}
                    {...tc(totals.legalHolNightDiffOTHours)}
                  />
                  <Table.Summary.Cell
                    index={17}
                    {...tc(totals.specialHolHours)}
                  />
                  <Table.Summary.Cell
                    index={18}
                    {...tc(totals.specialHolOTHours)}
                  />
                  <Table.Summary.Cell
                    index={19}
                    {...tc(totals.specialHolNightDiffHours)}
                  />
                  <Table.Summary.Cell
                    index={20}
                    {...tc(totals.specialHolNightDiffOTHours)}
                  />
                  <Table.Summary.Cell
                    index={21}
                    {...tc(totals.restLegalDayHours)}
                  />
                  <Table.Summary.Cell
                    index={22}
                    {...tc(totals.restLegalDayOTHours)}
                  />
                  <Table.Summary.Cell
                    index={23}
                    {...tc(totals.restLegalDayNDHours)}
                  />
                  <Table.Summary.Cell
                    index={24}
                    {...tc(totals.restLegalDayNDOTHours)}
                  />
                  <Table.Summary.Cell
                    index={25}
                    {...tc(totals.restSpecialDayHours)}
                  />
                  <Table.Summary.Cell
                    index={26}
                    {...tc(totals.restSpecialDayOTHours)}
                  />
                  <Table.Summary.Cell
                    index={27}
                    {...tc(totals.restSpecialDayNDHours)}
                  />
                  <Table.Summary.Cell
                    index={28}
                    {...tc(totals.restSpecialDayNDOTHours)}
                  />
                  <Table.Summary.Cell
                    index={29}
                    {...tc(totals.doubleLegalHours)}
                  />
                  <Table.Summary.Cell
                    index={30}
                    {...tc(totals.doubleLegalOTHours)}
                  />
                  <Table.Summary.Cell
                    index={31}
                    {...tc(totals.doubleLegalNDHours)}
                  />
                  <Table.Summary.Cell
                    index={32}
                    {...tc(totals.doubleLegalNDOTHours)}
                  />
                  <Table.Summary.Cell
                    index={33}
                    {...tc(totals.restDoubleLegalHours)}
                  />
                  <Table.Summary.Cell
                    index={34}
                    {...tc(totals.restDoubleLegalOTHours)}
                  />
                  <Table.Summary.Cell
                    index={35}
                    {...tc(totals.restDoubleLegalNDHours)}
                  />
                  <Table.Summary.Cell
                    index={36}
                    {...tc(totals.restDoubleLegalNDOTHours)}
                  />
                  <Table.Summary.Cell index={37} {...tc(totals.obHours)} />
                  <Table.Summary.Cell index={38} {...tc(totals.leaveHours)} />
                </Table.Summary.Row>
              </Table.Summary>
            )
      }
    />
  );
}
