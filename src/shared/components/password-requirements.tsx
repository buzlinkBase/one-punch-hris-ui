import {
  CheckCircleFilled,
  CloseCircleFilled,
  MinusCircleFilled,
} from "@ant-design/icons";

const RULES = [
  { label: "At least 8 characters", test: (v: string) => v.length >= 8 },
  {
    label: "One uppercase letter (A–Z)",
    test: (v: string) => /[A-Z]/.test(v),
  },
  {
    label: "One lowercase letter (a–z)",
    test: (v: string) => /[a-z]/.test(v),
  },
  { label: "One number (0–9)", test: (v: string) => /[0-9]/.test(v) },
  {
    label: "One special character (!@#$%...)",
    test: (v: string) => /[^A-Za-z0-9]/.test(v),
  },
];

interface Props {
  value: string;
}

export function PasswordRequirements({ value }: Props) {
  const empty = !value;

  return (
    <ul
      style={{
        listStyle: "none",
        margin: "6px 0 4px",
        padding: 0,
        fontSize: 12,
        lineHeight: 1.8,
      }}
    >
      {RULES.map(({ label, test }) => {
        const met = !empty && test(value);
        const color = empty ? "#8c8c8c" : met ? "#52c41a" : "#ff4d4f";
        const Icon = empty
          ? MinusCircleFilled
          : met
            ? CheckCircleFilled
            : CloseCircleFilled;

        return (
          <li
            key={label}
            style={{ display: "flex", alignItems: "center", gap: 6, color }}
          >
            <Icon style={{ fontSize: 11 }} />
            {label}
          </li>
        );
      })}
    </ul>
  );
}
