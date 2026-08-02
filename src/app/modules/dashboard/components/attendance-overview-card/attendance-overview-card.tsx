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
const PL = 40;
const PR = 8;
const PT = 8;
const PB = 26;
const IW = SVG_W - PL - PR;
const IH = SVG_H - PT - PB;

function niceMax(max: number): number {
  if (max <= 0) return 50;
  const raw = max * 1.1;
  const magnitude = Math.pow(10, Math.floor(Math.log10(raw)));
  for (const factor of [1, 2, 2.5, 5, 10]) {
    if (factor * magnitude >= raw) return factor * magnitude;
  }
  return Math.ceil(raw / 50) * 50;
}

export default function AttendanceOverviewCard({
  data,
  loading,
}: AttendanceOverviewCardProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const rawMax = Math.max(1, ...data.map((d) => d.present + d.late + d.absent));
  const yMax = niceMax(rawMax);
  const yTicks = [0, yMax * 0.25, yMax * 0.5, yMax * 0.75, yMax].map(
    Math.round,
  );

  const n = data.length || 1;
  const groupW = IW / n;
  const barW = Math.min(groupW * 0.65, 48);
  const barPad = (groupW - barW) / 2;

  const scaleY = (v: number) => IH - (v / yMax) * IH;

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
        <div className="flex gap-3 shrink-0">
          {SERIES.map((s) => (
            <div key={s.key} className="flex items-center gap-1.5">
              <span
                className="w-2.5 h-2.5 rounded-sm"
                style={{ background: s.color, display: "inline-block" }}
              />
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
              {yTicks.map((tick) => {
                const y = scaleY(tick);
                return (
                  <g key={tick}>
                    <line
                      x1={0}
                      y1={y}
                      x2={IW}
                      y2={y}
                      stroke={tick === 0 ? "#e5e7eb" : "#f3f4f6"}
                      strokeWidth={1}
                    />
                    <text
                      x={-6}
                      y={y}
                      textAnchor="end"
                      dominantBaseline="middle"
                      fontSize={9}
                      fill="#9ca3af"
                    >
                      {tick}
                    </text>
                  </g>
                );
              })}

              {data.map((point, i) => {
                const gx = i * groupW;
                const bx = gx + barPad;
                const isHovered = hoveredIdx === i;
                const total = point.present + point.late + point.absent;
                const topY = scaleY(total);

                let cumY = IH;
                const segments = SERIES.map((s) => {
                  const h = yMax > 0 ? (point[s.key] / yMax) * IH : 0;
                  cumY -= h;
                  const segY = cumY;
                  return (
                    <rect
                      key={s.key}
                      x={bx}
                      y={segY}
                      width={barW}
                      height={Math.max(0, h)}
                      fill={s.color}
                      opacity={isHovered ? 1 : 0.82}
                    />
                  );
                });

                return (
                  <g
                    key={point.date}
                    onMouseEnter={() => setHoveredIdx(i)}
                    onMouseLeave={() => setHoveredIdx(null)}
                    style={{ cursor: "default" }}
                  >
                    {isHovered && (
                      <rect
                        x={gx + 1}
                        y={0}
                        width={groupW - 2}
                        height={IH}
                        fill="#f9fafb"
                        rx={4}
                      />
                    )}
                    {segments}
                    {isHovered && total > 0 && (
                      <text
                        x={bx + barW / 2}
                        y={topY - 5}
                        textAnchor="middle"
                        fontSize={9}
                        fill="#374151"
                        fontWeight="bold"
                      >
                        {total}
                      </text>
                    )}
                    <text
                      x={gx + groupW / 2}
                      y={IH + 16}
                      textAnchor="middle"
                      fontSize={10}
                      fill={isHovered ? "#374151" : "#9ca3af"}
                      fontWeight={isHovered ? "600" : "400"}
                    >
                      {point.date}
                    </text>
                  </g>
                );
              })}
            </g>
          </svg>

          <div
            className="mt-2 rounded-lg px-3 py-2 flex items-center gap-4 text-xs transition-colors"
            style={{
              background: hovered ? "#f9fafb" : "transparent",
              border: `1px solid ${hovered ? "#f0f0f0" : "transparent"}`,
              minHeight: 34,
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
                      className="w-2 h-2 rounded-sm"
                      style={{ background: s.color, display: "inline-block" }}
                    />
                    <span className="text-gray-500">{s.label}:</span>
                    <span className="font-semibold text-gray-800">
                      {hovered[s.key]}
                    </span>
                  </span>
                ))}
                <span className="ml-auto text-gray-400">
                  Total:{" "}
                  <span className="font-semibold text-gray-700">
                    {hovered.present + hovered.late + hovered.absent}
                  </span>
                </span>
              </>
            ) : (
              <span className="text-gray-400 text-[11px]">
                Hover over a bar to see breakdown
              </span>
            )}
          </div>
        </>
      )}
    </Card>
  );
}
