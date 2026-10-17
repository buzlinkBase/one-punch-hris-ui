import { Typography } from "antd";
import dayjs from "dayjs";
import { authStorage } from "@/core/auth/auth-storage";
import StatTiles from "./components/stat-tiles/stat-tiles";
import AttendanceOverviewCard from "./components/attendance-overview-card/attendance-overview-card";
import TodayAttendanceCard from "./components/today-attendance-card/today-attendance-card";
import DepartmentHeadcountCard from "./components/department-headcount-card/department-headcount-card";
import CountBarCard from "./components/count-bar-card/count-bar-card";
import RecentActivityCard from "./components/recent-activity-card/recent-activity-card";
import UpcomingHolidaysCard from "./components/upcoming-holidays-card/upcoming-holidays-card";
import UpcomingBirthdaysCard from "./components/upcoming-birthdays-card/upcoming-birthdays-card";
import PendingRequestsCard from "./components/pending-requests-card/pending-requests-card";
import { DASHBOARD_LABEL } from "./constants/label.const";
import { useDashboardOverview } from "./hooks/use-dashboard-queries";
import { spaceWords } from "./utils/space-words";

const { Title, Text } = Typography;

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

export default function Dashboard() {
  const { data, isLoading } = useDashboardOverview();

  const user = authStorage.getUser();
  const firstName = user?.name?.split(" ")[0] ?? "there";
  const today = dayjs().format("dddd, MMMM D, YYYY");

  return (
    <div className="content-page">
      {/* Greeting */}
      <div className="mb-6">
        <Title level={4} className="m-0!">
          {getGreeting()}, {firstName}
        </Title>
        <Text type="secondary" className="text-[13px]">
          {today}
        </Text>
      </div>

      {/* The dashboard's own report: today, the last 7 days and who works here now -- not the
          Analytics pages' monthly history. */}
      <div className="mb-4">
        <StatTiles stats={data?.stats} loading={isLoading} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        <div className="lg:col-span-2">
          <AttendanceOverviewCard
            data={data?.attendanceTrend ?? []}
            loading={isLoading}
          />
        </div>
        <TodayAttendanceCard stats={data?.stats} loading={isLoading} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-4">
        <DepartmentHeadcountCard
          data={data?.departmentHeadcount ?? []}
          loading={isLoading}
        />
        <CountBarCard
          title={DASHBOARD_LABEL.BRANCH_HEADCOUNT}
          data={data?.workforce?.branches ?? []}
          loading={isLoading}
          horizontal
        />
        <CountBarCard
          title={DASHBOARD_LABEL.EMPLOYMENT_STATUS}
          data={data?.workforce?.employmentStatus ?? []}
          loading={isLoading}
          formatLabel={spaceWords}
          horizontal
        />
        <CountBarCard
          title={DASHBOARD_LABEL.TENURE}
          data={data?.workforce?.tenure ?? []}
          loading={isLoading}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        <UpcomingHolidaysCard
          data={data?.upcomingHolidays ?? []}
          loading={isLoading}
        />
        <UpcomingBirthdaysCard
          data={data?.upcomingBirthdays ?? []}
          loading={isLoading}
        />
        <PendingRequestsCard
          data={data?.pendingRequests ?? []}
          loading={isLoading}
        />
      </div>

      <div className="grid grid-cols-1 gap-4">
        <RecentActivityCard
          data={data?.recentActivity ?? []}
          loading={isLoading}
        />
      </div>
    </div>
  );
}
