import { useState } from "react";
import { Button, Checkbox, InputNumber, Modal, Typography } from "antd";
import type { PaletteShift } from "../shift-palette";

const { Text } = Typography;

interface PatternModalProps {
  open: boolean;
  shifts: PaletteShift[];
  // The brush currently selected in the palette (a shift id, or null for clear).
  brush: string | null;
  targetCount: number;
  onApply: (
    pattern: (string | null)[],
    offset: number,
    stagger: boolean,
  ) => void;
  onClose: () => void;
}

const PRESETS = [
  { on: 4, off: 2 },
  { on: 5, off: 2 },
  { on: 6, off: 1 },
  { on: 3, off: 1 },
];

export function PatternModal({
  open,
  shifts,
  brush,
  targetCount,
  onApply,
  onClose,
}: PatternModalProps) {
  const [pattern, setPattern] = useState<(string | null)[]>([]);
  const [offset, setOffset] = useState(0);
  const [stagger, setStagger] = useState(false);

  const shiftById = new Map(shifts.map((s) => [s.id, s]));
  const preset = (on: number, off: number) =>
    setPattern([
      ...Array.from({ length: on }, () => brush),
      ...Array.from({ length: off }, () => null),
    ]);

  return (
    <Modal
      title="Repeat a pattern"
      open={open}
      onCancel={onClose}
      okText={`Apply to ${targetCount} employee${targetCount === 1 ? "" : "s"}`}
      okButtonProps={{ disabled: pattern.length === 0 }}
      onOk={() => {
        onApply(pattern, offset, stagger);
        onClose();
      }}
    >
      <div className="flex flex-col gap-4">
        <div>
          <Text type="secondary">
            Pick a shift in the palette, then choose a preset (days on, then
            days cleared) or build the cycle one day at a time.
          </Text>
        </div>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((p) => (
            <Button
              key={`${p.on}-${p.off}`}
              disabled={brush === null}
              onClick={() => preset(p.on, p.off)}
            >
              {p.on} on / {p.off} off
            </Button>
          ))}
          <Button onClick={() => setPattern((prev) => [...prev, brush])}>
            + Add current brush
          </Button>
          <Button
            disabled={pattern.length === 0}
            onClick={() => setPattern((prev) => prev.slice(0, -1))}
          >
            Remove last
          </Button>
        </div>
        <div className="flex min-h-10 flex-wrap gap-1 rounded-md border border-dashed border-gray-300 p-2">
          {pattern.length === 0 && <Text type="secondary">No days yet.</Text>}
          {pattern.map((id, i) => {
            const shift = id ? shiftById.get(id) : null;
            return (
              <span
                key={i}
                className={`rounded border px-2 py-0.5 text-xs ${
                  shift
                    ? shift.colorClass
                    : "border-red-300 bg-red-50 text-red-700"
                }`}
              >
                {shift ? shift.label : "Clear"}
              </span>
            );
          })}
        </div>
        <div className="flex items-center gap-2">
          <Text>Start the cycle at day</Text>
          <InputNumber
            min={1}
            max={Math.max(pattern.length, 1)}
            value={offset + 1}
            onChange={(v) => setOffset(Math.max((v ?? 1) - 1, 0))}
          />
        </div>
        <Checkbox
          checked={stagger}
          onChange={(e) => setStagger(e.target.checked)}
        >
          Start each next employee one day later in the cycle (rotating crews)
        </Checkbox>
      </div>
    </Modal>
  );
}
