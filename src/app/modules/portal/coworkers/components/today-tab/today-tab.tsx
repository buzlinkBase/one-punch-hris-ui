import { Tag } from "antd";
import {
  CalendarOutlined,
  GiftOutlined,
  LogoutOutlined,
  SmileOutlined,
} from "@ant-design/icons";
import {
  useAnniversaries,
  useMyEmployee,
  useNewHires,
  useOutToday,
  useTodayBirthdays,
} from "../../../shared/hooks/use-my-employee-queries";
import type { CoworkerSettingsResponse } from "../../../shared/models/api/response/coworker-response.model";
import BirthdayGreetingBanner from "../../../shared/components/birthday-greeting-banner";
import CoworkerCard, { joinSubtitle } from "../coworker-card";
import CoworkerSection from "../coworker-section";

interface TodayTabProps {
  settings: CoworkerSettingsResponse;
}

function anniversaryBadge(years: number, daysUntil: number) {
  const when = daysUntil === 0 ? "Today" : `In ${daysUntil}d`;
  return (
    <Tag color="gold">
      {years} {years === 1 ? "year" : "years"} · {when}
    </Tag>
  );
}

export default function TodayTab({ settings }: TodayTabProps) {
  const { data: employee } = useMyEmployee();
  const { data: celebrants = [], isLoading: birthdaysLoading } =
    useTodayBirthdays();
  const { data: newHires = [], isLoading: hiresLoading } = useNewHires(
    settings.showNewHires,
  );
  const { data: anniversaries = [], isLoading: anniversariesLoading } =
    useAnniversaries(settings.showAnniversaries);
  const { data: away = [], isLoading: awayLoading } = useOutToday(
    settings.showWhosOut,
  );

  return (
    <div>
      <BirthdayGreetingBanner
        firstName={employee?.firstName}
        dob={employee?.dob}
      />

      <CoworkerSection
        title="Today's birthdays"
        icon={<GiftOutlined />}
        loading={birthdaysLoading}
        isEmpty={celebrants.length === 0}
        emptyText="No coworker birthdays to celebrate today"
      >
        {celebrants.map((c) => (
          <CoworkerCard
            key={c.id}
            name={c.fullName}
            imageUrl={c.profileImg}
            subtitle={joinSubtitle(c.positionName, c.departmentName)}
          />
        ))}
      </CoworkerSection>

      {settings.showAnniversaries && (
        <CoworkerSection
          title="Work anniversaries"
          icon={<CalendarOutlined />}
          loading={anniversariesLoading}
          isEmpty={anniversaries.length === 0}
          emptyText="No work anniversaries coming up this week"
        >
          {anniversaries.map((a) => (
            <CoworkerCard
              key={a.id}
              name={a.fullName}
              imageUrl={a.profileImg}
              subtitle={joinSubtitle(a.positionName, a.departmentName)}
              badge={anniversaryBadge(a.years, a.daysUntil)}
            />
          ))}
        </CoworkerSection>
      )}

      {settings.showNewHires && (
        <CoworkerSection
          title="Welcome our newest teammates"
          icon={<SmileOutlined />}
          loading={hiresLoading}
          isEmpty={newHires.length === 0}
          emptyText="No new hires in the last 30 days"
        >
          {newHires.map((h) => (
            <CoworkerCard
              key={h.id}
              name={h.fullName}
              imageUrl={h.profileImg}
              subtitle={joinSubtitle(h.positionName, h.departmentName)}
              badge={<Tag color="green">New</Tag>}
            />
          ))}
        </CoworkerSection>
      )}

      {settings.showWhosOut && (
        <CoworkerSection
          title="Who's out today"
          icon={<LogoutOutlined />}
          loading={awayLoading}
          isEmpty={away.length === 0}
          emptyText="Everyone is in today"
        >
          {away.map((p) => (
            <CoworkerCard
              key={p.id}
              name={p.fullName}
              imageUrl={p.profileImg}
              subtitle={joinSubtitle(p.positionName, p.departmentName)}
              badge={<Tag>{p.note}</Tag>}
            />
          ))}
        </CoworkerSection>
      )}
    </div>
  );
}
