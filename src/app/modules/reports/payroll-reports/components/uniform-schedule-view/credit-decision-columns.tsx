import { Tag } from "antd";
import dayjs from "dayjs";
import { UNIFORM_OUTCOME_TAG } from "@/app/modules/setup/client/constants/uniform-allowance.const";
import type { UniformAllowanceCreditLog } from "@/app/modules/setup/client/models/api/response/uniform-allowance-policy.model";

export const peso = (value: number) =>
  `₱${value.toLocaleString("en-PH", { minimumFractionDigits: 2 })}`;
export const day = (value: string) => dayjs(value).format("MMM D, YYYY");
export const period = (from: string, to: string) =>
  `${dayjs(from).format("MMM D")} – ${day(to)}`;

/** Credit-log columns shared with the Credit Log drawer (which adds employee and client). */
export const CREDIT_DECISION_COLUMNS = [
  {
    title: "Credit date",
    dataIndex: "creditDate",
    key: "creditDate",
    width: 120,
    render: (v: string) => day(v),
  },
  {
    title: "Period",
    key: "period",
    width: 170,
    render: (_: unknown, r: UniformAllowanceCreditLog) =>
      period(r.periodStart, r.periodEnd),
  },
  {
    title: "Outcome",
    dataIndex: "outcome",
    key: "outcome",
    width: 100,
    render: (v: UniformAllowanceCreditLog["outcome"]) => (
      <Tag color={UNIFORM_OUTCOME_TAG[v].color}>
        {UNIFORM_OUTCOME_TAG[v].label}
      </Tag>
    ),
  },
  {
    title: "Present days",
    key: "days",
    width: 110,
    align: "right" as const,
    render: (_: unknown, r: UniformAllowanceCreditLog) =>
      r.presentDays === null
        ? "—"
        : r.requiredDays === null
          ? r.presentDays
          : `${r.presentDays} / ${r.requiredDays}`,
  },
  {
    title: "Amount",
    dataIndex: "amount",
    key: "amount",
    width: 110,
    align: "right" as const,
    render: (v: number) => (v > 0 ? peso(v) : "—"),
  },
  { title: "Reason", dataIndex: "reasonText", key: "reason" },
];
