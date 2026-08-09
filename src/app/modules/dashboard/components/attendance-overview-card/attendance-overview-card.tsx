import { useState } from "react";
import { Card, Skeleton, Typography } from "antd";
import type { AttendanceTrendPoint } from "../../models/api/response/dashboard-response.model";
import { DASHBOARD_LABEL } from "../../constants/label.const";

const { Title, Text } = Typography;

interface AttendanceOverviewCardProps {
  data: AttendanceTrendPoint[];
  loading?: boolean;
}

const SERIES = [
  { key: "present" as const, label: "Present", color: "#1DA081" },
  { key: "late" as const, label: "Late", color: "#FAAD14" },
  { key: "absent" as const, label: "Absent", color: "#F5222D" },
];

const SVG_W = 520;
const SVG_H = 170;
const PL = 36;
const PR = 12;
const PT = 10;
const PB = 28;
const IW = SVG_W - PL - PR;
const IH = SVG_H - PT - PB;

function niceMax(max: number): number {
  if (max <= 0) return 10;
  const raw = max * 1.2;
  const mag = Math.pow(10, Math.floor(Math.log10(raw)));
  for (const f of [1, 2, 2.5, 5, 10]) {
    if (f * mag >= raw) return f * mag;
  }
  return Math.ceil(raw / 10) * 10;
}

export default function AttendanceOverviewCard({
  data,
  loading,
}: AttendanceOverviewCardProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const rawMax = Math.max(
    1,
    ...SERIES.flatMap((s) => data.map((d) => d[s.key])),
  );
  const yMax = niceMax(rawMax);
  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((f) => Math.round(f * yMax));

  const n = Math.max(data.length, 1);
  // Points spread edge-to-edge like a line chart
  const xOf = (i: number) => (n === 1 ? IW / 2 : (i / (n - 1)) * IW);
  const yOf = (v: number) => IH - (v / yMax) * IH;
  // Zone width = spacing between consecutive points
  const zoneW = n > 1 ? IW / (n - 1) : IW;
  // Stick gap within a group — tighten as dates crowd
  const stickGap = Math.min(13, zoneW / (SERIES.length + 1));
  const halfSpan = ((SERIES.length - 1) * stickGap) / 2;

  const avgRate =
    data.length > 0
      ? Math.round(
          data.reduce((sum, d) => {
            const t = d.present + d.late + d.absent;
            return sum + (t > 0 ? (d.present / t) * 100 : 0);
          }, 0) / data.length,
        )
      : 0;

  const hovered = hoveredIdx !== null ? data[hoveredIdx] : null;

  return (
    <Card size="small" className="h-full">
      <div className="flex items-start justify-between mb-3">
        <div>
          <Title level={5} className="mb-0!">
            {DASHBOARD_LABEL.ATTENDANCE_OVERVIEW}
          </Title>
          <Text type="secondary" className="text-xs">
            {DASHBOARD_LABEL.ATTENDANCE_OVERVIEW_SUBTITLE}
            {" · "}
            <span className="font-semibold" style={{ color: "#1DA081" }}>
              {avgRate}% avg attendance rate
            </span>
          </Text>
        </div>
        <div className="flex gap-4 shrink-0">
          {SERIES.map((s) => (
            <div key={s.key} className="flex items-center gap-1.5">
              {/* Lollipop mini-icon in legend */}
              <svg width={12} height={14} style={{ display: "block" }}>
                <line
                  x1={6}
                  y1={13}
                  x2={6}
                  y2={5}
                  stroke={s.color}
                  strokeWidth={1.5}
                  strokeLinecap="round"
                />
                <circle
                  cx={6}
                  cy={4}
                  r={3}
                  fill="none"
                  stroke={s.color}
                  strokeWidth={1.5}
                />
              </svg>
              <span className="text-xs text-gray-500">{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {loading ? (
        <Skeleton active paragraph={{ rows: 5 }} />
      ) : (
        <>
          <svg
            viewBox={`0 0 ${SVG_W} ${SVG_H}`}
            width="100%"
            style={{ display: "block", overflow: "visible" }}
          >
            <g transform={`translate(${PL},${PT})`}>
              {/* Grid lines + Y labels */}
              {yTicks.map((tick) => {
                const y = yOf(tick);
                return (
                  <g key={tick}>
                    <line
                      x1={0}
                      y1={y}
                      x2={IW}
                      y2={y}
                      stroke={tick === 0 ? "#e2e8f0" : "#f1f5f9"}
                      strokeWidth={1}
                    />
                    <text
                      x={-5}
                      y={y}
                      textAnchor="end"
                      dominantBaseline="middle"
                      fontSize={9}
                      fill="#c0c0c0"
                    >
                      {tick}
                    </text>
                  </g>
                );
              })}

              {/* Per-date lollipop groups */}
              {data.map((point, i) => {
                const cx = xOf(i);
                const isHovered = hoveredIdx === i;

                return (
                  <g key={point.date}>
                    {/* Hover column highlight */}
                    {isHovered && (
                      <rect
                        x={cx - zoneW / 2 + 2}
                        y={0}
                        width={zoneW - 4}
                        height={IH}
                        fill="#f8fafc"
                        rx={4}
                      />
                    )}

                    {/* Three lollipops */}
                    {SERIES.map((s, si) => {
                      const sx = cx - halfSpan + si * stickGap;
                      const sy = yOf(point[s.key]);
                      const h = IH - sy;

                      return (
                        <g key={s.key}>
                          {/* Stem */}
                          <line
                            x1={sx}
                            y1={IH}
                            x2={sx}
                            y2={sy + (isHovered ? 5 : 3.5)}
                            stroke={s.color}
                            strokeWidth={isHovered ? 2 : 1.5}
                            strokeLinecap="round"
                            opacity={h <= 0 ? 0 : isHovered ? 1 : 0.7}
                          />
                          {/* Head — open circle at rest, filled on hover */}
                          {h > 0 && (
                            <circle
                              cx={sx}
                              cy={sy}
                              r={isHovered ? 5 : 3.5}
                              fill={isHovered ? s.color : "#fff"}
                              stroke={s.color}
                              strokeWidth={isHovered ? 0 : 2}
                              opacity={isHovered ? 1 : 0.85}
                            />
                          )}
                        </g>
                      );
                    })}

                    {/* X-axis date label */}
                    <text
                      x={cx}
                      y={IH + 17}
                      textAnchor="middle"
                      fontSize={10}
                      fill={isHovered ? "#374151" : "#c0c0c0"}
                      fontWeight={isHovered ? "600" : "400"}
                    >
                      {point.date}
                    </text>

                    {/* Invisible hit zone */}
                    <rect
                      x={cx - zoneW / 2}
                      y={0}
                      width={zoneW}
                      height={IH}
                      fill="transparent"
                      style={{ cursor: "default" }}
                      onMouseEnter={() => setHoveredIdx(i)}
                      onMouseLeave={() => setHoveredIdx(null)}
                    />
                  </g>
                );
              })}
            </g>
          </svg>

          {/* Tooltip strip */}
          <div
            className="mt-2 rounded-lg px-3 py-2 flex items-center gap-4 text-xs"
            style={{
              background: hovered ? "#fafafa" : "transparent",
              border: `1px solid ${hovered ? "#f0f0f0" : "transparent"}`,
              minHeight: 34,
              transition: "background 0.15s, border-color 0.15s",
            }}
          >
            {hovered ? (
              <>
                <span className="font-semibold text-gray-700">
                  {hovered.date}
                </span>
                {SERIES.map((s) => (
                  <span key={s.key} className="flex items-center gap-1">
                    <span
                      className="inline-block w-2 h-2 rounded-full"
                      style={{ background: s.color }}
                    />
                    <span className="text-gray-400">{s.label}</span>
                    <span className="font-semibold text-gray-800 tabular-nums">
                      {hovered[s.key]}
                    </span>
                  </span>
                ))}
                <span className="ml-auto text-gray-400 tabular-nums">
                  Total{" "}
                  <span className="font-semibold text-gray-700">
                    {hovered.present + hovered.late + hovered.absent}
                  </span>
                </span>
              </>
            ) : (
              <span className="text-gray-300 text-[11px]">
                Hover a date to see breakdown
              </span>
            )}
          </div>
        </>
      )}
    </Card>
  );
}
