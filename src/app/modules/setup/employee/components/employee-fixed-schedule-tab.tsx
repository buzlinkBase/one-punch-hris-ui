import { Alert, Button, Select, Typography } from "antd";
import { CloseCircleOutlined, InfoCircleOutlined } from "@ant-design/icons";
import { useFixedTimeShifts } from "@/app/modules/setup/time-shift/fixed/hooks/use-fixed-time-shift-queries";
import type {
  DayName,
  EmployeeFixedScheduleDayModel,
} from "../models/api/response/employee-response.model";

const { Text } = Typography;

const DAYS: DayName[] = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const RESOLUTION_STEPS = [
  {
    title: "A special change for that exact day?",
    detail:
      "If someone moved their schedule for just one date (Work Rotation), that wins.",
  },
  {
    title: "Then, this weekly schedule",
    detail:
      "Otherwise, whatever shift you pick above for that day of the week is used.",
  },
  {
    title: "Then, their Permanent Shift",
    detail:
      "If that day is left blank here, we fall back to their one regular default shift.",
  },
  {
    title: "Last resort: Open Shift",
    detail:
      "If nothing above is set, they're simply marked Open Shift — no fixed time.",
  },
];

interface Props {
  value: EmployeeFixedScheduleDayModel[];
  onChange: (next: EmployeeFixedScheduleDayModel[]) => void;
}

export default function EmployeeFixedScheduleTab({ value, onChange }: Props) {
  const { data: timeShifts = [], isLoading: isLoadingShifts } =
    useFixedTimeShifts();

  const byDay = new Map(value.map((v) => [v.dayName, v]));

  const shiftOptions = timeShifts.map((s) => ({
    value: s.id,
    label: `${s.shiftName} (${s.startTime.slice(0, 5)}–${s.endTime.slice(0, 5)}) · ${s.shiftType}`,
  }));

  const handleChange = (day: DayName, timeShiftId: string) => {
    const existing = byDay.get(day);
    const next = value.filter((v) => v.dayName !== day);
    next.push({ id: existing?.id, dayName: day, timeShiftId });
    onChange(next);
  };

  const handleRemove = (day: DayName) => {
    onChange(value.filter((v) => v.dayName !== day));
  };

  return (
    <div className="flex flex-col gap-3" style={{ maxWidth: 560 }}>
      {DAYS.map((day) => {
        const assigned = byDay.get(day);
        return (
          <div key={day} className="flex items-center gap-3">
            <Text style={{ width: 90 }}>{day}</Text>
            <Select
              style={{ flex: 1 }}
              placeholder="Not assigned"
              options={shiftOptions}
              value={assigned?.timeShiftId}
              onChange={(v) => handleChange(day, v)}
              loading={isLoadingShifts}
              showSearch
              filterOption={(input, option) =>
                String(option?.label ?? "")
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
            />
            {assigned && (
              <Button
                type="text"
                danger
                size="small"
                icon={<CloseCircleOutlined />}
                onClick={() => handleRemove(day)}
              />
            )}
          </div>
        );
      })}
      <Alert
        type="info"
        showIcon
        icon={<InfoCircleOutlined />}
        message="You don't have to fill in every day"
        description={
          <div>
            <p className="mb-3">
              Leave a day blank if it has no fixed shift — that's fine. When
              it's time to figure out what shift someone actually works on a
              given day, we check these one at a time, in order, and go with the
              first one that's set:
            </p>
            <div className="flex flex-col">
              {RESOLUTION_STEPS.map((step, i) => (
                <div key={step.title}>
                  <div className="flex items-start gap-2">
                    <span
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: 20,
                        height: 20,
                        borderRadius: "50%",
                        background: "var(--ant-color-primary)",
                        color: "var(--ant-color-white)",
                        fontSize: 11,
                        fontWeight: 600,
                        flexShrink: 0,
                      }}
                    >
                      {i + 1}
                    </span>
                    <div>
                      <div style={{ fontWeight: 600 }}>{step.title}</div>
                      <div
                        style={{
                          fontSize: 12,
                          color: "var(--ant-color-text-tertiary)",
                        }}
                      >
                        {step.detail}
                      </div>
                    </div>
                  </div>
                  {i < RESOLUTION_STEPS.length - 1 && (
                    <div
                      style={{
                        width: 1,
                        height: 10,
                        marginLeft: 9,
                        background: "var(--ant-color-border)",
                      }}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        }
      />
    </div>
  );
}
