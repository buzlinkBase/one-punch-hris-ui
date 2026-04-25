import { Typography } from "antd";

const { Title, Text } = Typography;

export default function Timekeeping() {
  return (
    <div className="content-page">
      <div className="page-toolbar">
        <div className="page-toolbar-row">
          <div>
            <Title level={4} className="mb-0!">
              Time Keeping
            </Title>
            <p className="page-toolbar-subtitle">
              Review attendance records and manage daily timekeeping workflows.
            </p>
          </div>
        </div>
      </div>
      <div className="flex flex-col items-center justify-center min-h-65 text-center rounded-xl border border-emerald-100 bg-emerald-50/40">
        <Title level={5} className="mb-1! text-emerald-900!">
          Coming soon
        </Title>
        <Text type="secondary">
          Timekeeping tools will be available in this workspace.
        </Text>
      </div>
    </div>
  );
}
