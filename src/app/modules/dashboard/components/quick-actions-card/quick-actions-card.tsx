import { Button, Typography } from "antd";
import {
  CalendarOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
  GlobalOutlined,
  IdcardOutlined,
  SwapOutlined,
  UserAddOutlined,
} from "@ant-design/icons";
import { useNavigate } from "@tanstack/react-router";
import { DASHBOARD_LABEL } from "../../constants/label.const";

const { Text } = Typography;

const ACTIONS = [
  {
    key: "add-employee",
    label: "Add Employee",
    icon: <UserAddOutlined />,
    to: "/setup/employee/create",
  },
  {
    key: "upload-attendance",
    label: "Upload Attendance",
    icon: <IdcardOutlined />,
    to: "/timekeeping/upload-attendance",
  },
  {
    key: "attendance-entry",
    label: "Attendance Entry",
    icon: <FileTextOutlined />,
    to: "/timekeeping/attendance-entry",
  },
  {
    key: "file-leave",
    label: "File Leave",
    icon: <CalendarOutlined />,
    to: "/applications/leave/create",
  },
  {
    key: "file-overtime",
    label: "File Overtime",
    icon: <ClockCircleOutlined />,
    to: "/applications/overtime/create",
  },
  {
    key: "official-business",
    label: "Official Business",
    icon: <GlobalOutlined />,
    to: "/applications/official-business/create",
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
    <div className="flex items-center gap-3 flex-wrap">
      <Text type="secondary" className="text-xs! shrink-0">
        {DASHBOARD_LABEL.QUICK_ACTIONS}:
      </Text>
      <div className="flex flex-wrap gap-2">
        {ACTIONS.map((action) => (
          <Button
            key={action.key}
            size="small"
            icon={action.icon}
            onClick={() => navigate({ to: action.to })}
          >
            {action.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
