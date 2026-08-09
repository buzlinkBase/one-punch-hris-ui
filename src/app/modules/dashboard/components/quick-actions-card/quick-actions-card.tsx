import { Card, Typography } from "antd";
import {
  CalendarOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
  GlobalOutlined,
  IdcardOutlined,
  MinusCircleOutlined,
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
    color: "#1DA081",
  },
  {
    key: "upload-attendance",
    label: "Upload Attendance",
    icon: <IdcardOutlined />,
    to: "/timekeeping/upload-attendance",
    color: "#1890FF",
  },
  {
    key: "attendance-entry",
    label: "Attendance Entry",
    icon: <FileTextOutlined />,
    to: "/timekeeping/attendance-entry",
    color: "#13C2C2",
  },
  {
    key: "file-leave",
    label: "File Leave",
    icon: <CalendarOutlined />,
    to: "/applications/leave/create",
    color: "#722ED1",
  },
  {
    key: "file-overtime",
    label: "File Overtime",
    icon: <ClockCircleOutlined />,
    to: "/applications/overtime/create",
    color: "#FAAD14",
  },
  {
    key: "file-undertime",
    label: "File Undertime",
    icon: <MinusCircleOutlined />,
    to: "/applications/undertime/create",
    color: "#FF7A45",
  },
  {
    key: "official-business",
    label: "Official Business",
    icon: <GlobalOutlined />,
    to: "/applications/official-business/create",
    color: "#1DA081",
  },
  {
    key: "change-rest-day",
    label: "Change Rest Day",
    icon: <SwapOutlined />,
    to: "/change-schedule/change-rest-day/create",
    color: "#F5222D",
  },
] as const;

export default function QuickActionsCard() {
  const navigate = useNavigate();

  return (
    <Card size="small" className="h-full">
      <Title level={5} className="mb-4!">
        {DASHBOARD_LABEL.QUICK_ACTIONS}
      </Title>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {ACTIONS.map((action) => (
          <button
            key={action.key}
            type="button"
            onClick={() => navigate({ to: action.to })}
            className="flex flex-col items-center gap-1.5 rounded-xl border border-gray-100 bg-gray-50/60 px-2 py-3 text-center transition-colors hover:bg-gray-100 cursor-pointer"
          >
            <span
              className="w-8 h-8 rounded-lg flex items-center justify-center text-sm"
              style={{ background: `${action.color}15`, color: action.color }}
            >
              {action.icon}
            </span>
            <span className="text-[11px] font-medium text-gray-600 leading-tight">
              {action.label}
            </span>
          </button>
        ))}
      </div>
    </Card>
  );
}
