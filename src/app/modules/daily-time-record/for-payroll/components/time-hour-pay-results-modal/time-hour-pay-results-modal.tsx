import { Modal, Table, Typography, theme } from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import type { DtrPayResult } from "../../models/api/response/payroll-run-result.model";

const { Text } = Typography;

interface Props {
  open: boolean;
  onClose: () => void;
  employeeName?: string;
  results: DtrPayResult[];
}

const fmt = (n: number) =>
  (n ?? 0).toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

// "RegularWorkDay" -> "Regular Work Day" — same space-before-caps convention
// dtr-detail-table.tsx's own WorkType column uses (backend StringHelpers.AddSpacesBeforeCaps,
// duplicated here since it lives in DTR.Core, which Hrms.Core/this payroll response can't
// reference).
const spaceOutPascalCase = (v: string) => v.replace(/([a-z])([A-Z])/g, "$1 $2");

type Pick = (r: DtrPayResult) => number;
interface Leaf {
  title: string;
  key: string;
  pick: Pick;
}
interface Group {
  title: string;
  cols: Leaf[];
}

// Mirrors dtr-detail-table.tsx's Hours Breakdown, group for group and in the same order
// (Regular / Rest Day / Legal Holiday / Special Holiday / Rest+Legal Day / Rest+Special Day
// / Double Legal Holiday / Rest+Double Legal, each Amt/OT/ND/ND-OT) — amounts instead of
// hours. No Official Business group here: DTRPayModel has no OB amount field (OB is
// hours/informational only, no separate pay component).
const GROUPS: Group[] = [
  {
    title: "Regular",
    cols: [
      { title: "Amt", key: "regularDayPay", pick: (r) => r.regularDayPay },
      { title: "OT", key: "regularOTPay", pick: (r) => r.regularOTPay },
      { title: "ND", key: "regularNDPay", pick: (r) => r.regularNDPay },
      { title: "ND-OT", key: "regularNDOTPay", pick: (r) => r.regularNDOTPay },
    ],
  },
  {
    title: "Rest Day",
    cols: [
      { title: "Amt", key: "restDayPay", pick: (r) => r.restDayPay },
      { title: "OT", key: "restDayOTPay", pick: (r) => r.restDayOTPay },
      { title: "ND", key: "restDayNDPay", pick: (r) => r.restDayNDPay },
      { title: "ND-OT", key: "restDayNDOTPay", pick: (r) => r.restDayNDOTPay },
    ],
  },
  {
    title: "Legal Holiday",
    cols: [
      { title: "Amt", key: "legalPay", pick: (r) => r.legalPay },
      { title: "OT", key: "legalOTPay", pick: (r) => r.legalOTPay },
      { title: "ND", key: "legalNDPay", pick: (r) => r.legalNDPay },
      { title: "ND-OT", key: "legalNDOTPay", pick: (r) => r.legalNDOTPay },
    ],
  },
  {
    title: "Special Holiday",
    cols: [
      { title: "Amt", key: "specialPay", pick: (r) => r.specialPay },
      { title: "OT", key: "specialOTPay", pick: (r) => r.specialOTPay },
      { title: "ND", key: "specialNDPay", pick: (r) => r.specialNDPay },
      { title: "ND-OT", key: "specialNDOTPay", pick: (r) => r.specialNDOTPay },
    ],
  },
  {
    title: "Rest + Legal Day",
    cols: [
      { title: "Amt", key: "restLegalPay", pick: (r) => r.restLegalPay },
      { title: "OT", key: "restLegalOTPay", pick: (r) => r.restLegalOTPay },
      { title: "ND", key: "restLegalNDPay", pick: (r) => r.restLegalNDPay },
      {
        title: "ND-OT",
        key: "restLegalNDOTPay",
        pick: (r) => r.restLegalNDOTPay,
      },
    ],
  },
  {
    title: "Rest + Special Day",
    cols: [
      { title: "Amt", key: "restSpecialPay", pick: (r) => r.restSpecialPay },
      { title: "OT", key: "restSpecialOTPay", pick: (r) => r.restSpecialOTPay },
      { title: "ND", key: "restSpecialNDPay", pick: (r) => r.restSpecialNDPay },
      {
        title: "ND-OT",
        key: "restSpecialNDOTPay",
        pick: (r) => r.restSpecialNDOTPay,
      },
    ],
  },
  {
    title: "Double Legal Holiday",
    cols: [
      { title: "Amt", key: "doubleLegalPay", pick: (r) => r.doubleLegalPay },
      { title: "OT", key: "doubleLegalOTPay", pick: (r) => r.doubleLegalOTPay },
      { title: "ND", key: "doubleLegalNDPay", pick: (r) => r.doubleLegalNDPay },
      {
        title: "ND-OT",
        key: "doubleLegalNDOTPay",
        pick: (r) => r.doubleLegalNDOTPay,
      },
    ],
  },
  {
    title: "Rest + Double Legal",
    cols: [
      {
        title: "Amt",
        key: "restDoubleLegalPay",
        pick: (r) => r.restDoubleLegalPay,
      },
      {
        title: "OT",
        key: "restDoubleLegalOTPay",
        pick: (r) => r.restDoubleLegalOTPay,
      },
      {
        title: "ND",
        key: "restDoubleLegalNDPay",
        pick: (r) => r.restDoubleLegalNDPay,
      },
      {
        title: "ND-OT",
        key: "restDoubleLegalNDOTPay",
        pick: (r) => r.restDoubleLegalNDOTPay,
      },
    ],
  },
];

// Mirrors DTR's "Minutes" band (Late / UT / Over) — amounts instead of minutes. Absent has
// no minutes equivalent in DTR (it's tracked separately there), but is included here since
// it directly explains the parent row's own Attendance band.
const ATTENDANCE_LEAVES: Leaf[] = [
  { title: "Late", key: "lateAmount", pick: (r) => r.lateAmount },
  { title: "UT", key: "utAmount", pick: (r) => r.utAmount },
  { title: "Absent", key: "absentAmount", pick: (r) => r.absentAmount },
];

const LEAVE_LEAVES: Leaf[] = [
  { title: "Paid Leave", key: "paidLeave", pick: (r) => r.paidLeave },
  { title: "Unpaid Leave", key: "unpaidLeave", pick: (r) => r.unpaidLeave },
];

// Flattened in the exact same left-to-right order the columns render in, so the summary
// row's cell indices line up (Date is index 0, these fill 1..n after it).
const ALL_LEAVES: Leaf[] = [
  ...ATTENDANCE_LEAVES,
  ...GROUPS.flatMap((g) => g.cols),
  ...LEAVE_LEAVES,
];

const groupHeader = (): object => ({ style: { fontWeight: 600 } });

export default function TimeHourPayResultsModal({
  open,
  onClose,
  employeeName,
  results,
}: Props) {
  const { token } = theme.useToken();
  const sorted = [...results].sort((a, b) => a.date.localeCompare(b.date));

  // Zero-amount cells are the common case for most categories on most days — rendering them
  // as a muted dash (matching dtr-detail-table.tsx's own convention) instead of "0.00" makes
  // the days that actually have something in each category stand out.
  const leafColumn = (leaf: Leaf): ColumnsType<DtrPayResult>[number] => ({
    title: leaf.title,
    key: leaf.key,
    align: "right",
    width: 90,
    render: (_, r) => {
      const n = leaf.pick(r);
      if (!n) {
        return (
          <span style={{ color: token.colorTextDisabled, userSelect: "none" }}>
            —
          </span>
        );
      }
      return fmt(n);
    },
  });

  const columns: ColumnsType<DtrPayResult> = [
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      width: 150,
      render: (v: string) => dayjs(v).format("MMM DD, YYYY (ddd)"),
    },
    {
      title: "Work Type",
      dataIndex: "workType",
      key: "workType",
      width: 150,
      render: (v: string) => spaceOutPascalCase(v),
    },
    {
      title: "Minutes",
      onHeaderCell: groupHeader,
      children: ATTENDANCE_LEAVES.map(leafColumn),
    },
    ...GROUPS.map((g) => ({
      title: g.title,
      onHeaderCell: groupHeader,
      children: g.cols.map(leafColumn),
    })),
    {
      title: "Leave",
      onHeaderCell: groupHeader,
      children: LEAVE_LEAVES.map(leafColumn),
    },
  ];

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width="90vw"
      style={{ top: 20 }}
      destroyOnClose
      title={
        <Text ellipsis={{ tooltip: employeeName }}>
          Daily Pay Breakdown{employeeName ? ` — ${employeeName}` : ""}
        </Text>
      }
    >
      <Table
        rowKey="date"
        size="small"
        dataSource={sorted}
        columns={columns}
        pagination={false}
        scroll={{ x: "max-content", y: 480 }}
        summary={(rows) => (
          <Table.Summary.Row>
            <Table.Summary.Cell index={0} colSpan={2}>
              <strong>Total</strong>
            </Table.Summary.Cell>
            {ALL_LEAVES.map((leaf, i) => (
              <Table.Summary.Cell key={leaf.key} index={i + 2} align="right">
                <strong>
                  {fmt(rows.reduce((s, r) => s + (leaf.pick(r) ?? 0), 0))}
                </strong>
              </Table.Summary.Cell>
            ))}
          </Table.Summary.Row>
        )}
      />
    </Modal>
  );
}
