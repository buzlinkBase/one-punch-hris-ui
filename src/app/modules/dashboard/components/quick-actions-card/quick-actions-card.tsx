import { Card, Typography } from "antd";
import {
  FileTextOutlined,
  IdcardOutlined,
  SwapOutlined,
  UserAddOutlined,
} from "@ant-design/icons";
import { useNavigate } from "@tanstack/react-router";
import { DASHBOARD_LABEL } from "../../constants/label.const";

const { Title } = Typography;

const ACTIONS = [
  {
    key: "add-employee",
    label: "Add Employee",
    icon: <UserAddOutlined />,
    to: "/setup/employee/create",
  },
  {
    key: "attendance-entry",
    label: "Attendance Entry",
    icon: <IdcardOutlined />,
    to: "/timekeeping/attendance-entry/create",
  },
  {
    key: "upload-attendance",
    label: "Upload Attendance",
    icon: <FileTextOutlined />,
    to: "/timekeeping/upload-attendance",
  },
  {
    key: "change-rest-day",
    label: "Change Rest Day",
    icon: <SwapOutlined />,
    to: "/change-schedule/change-rest-day/create",
  },
] as const;

export default function QuickActionsCard() {
  const navigate = useNavigate();

  return (
    <Card size="small" className="h-full">
      <Title level={5} className="mb-4!">
        {DASHBOARD_LABEL.QUICK_ACTIONS}
      </Title>
      <div className="grid grid-cols-2 gap-3">
        {ACTIONS.map((action) => (
          <button
            key={action.key}
            type="button"
            onClick={() => navigate({ to: action.to })}
            className="flex flex-col items-start gap-2 rounded-xl border border-emerald-100 bg-emerald-50/40 px-3 py-3 text-left transition-colors hover:bg-emerald-50 cursor-pointer"
          >
            <span className="w-8 h-8 rounded-lg bg-white text-emerald-700 flex items-center justify-center shadow-sm">
              {action.icon}
            </span>
            <span className="text-sm font-medium text-gray-700">
              {action.label}
            </span>
          </button>
        ))}
      </div>
    </Card>
  );
}
