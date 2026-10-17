import { Skeleton, Tabs, Typography } from "antd";
import { useCoworkerSettings } from "../../../shared/hooks/use-my-employee-queries";
import TodayTab from "../../components/today-tab";
import DirectoryTab from "../../components/directory-tab";
import OrgChartTab from "../../components/org-chart-tab";

const { Title } = Typography;

export default function PortalCoworkers() {
  const { data: settings, isLoading } = useCoworkerSettings();

  return (
    <div className="content-page">
      <div className="page-toolbar">
        <div className="page-toolbar-row">
          <div>
            <Title level={4} className="mb-0!">
              Coworkers
            </Title>
            <p className="page-toolbar-subtitle">
              Celebrations, teammates and who&apos;s around today.
            </p>
          </div>
        </div>
      </div>

      <div className="form-page-body">
        {isLoading || !settings ? (
          <Skeleton active paragraph={{ rows: 6 }} />
        ) : (
          <Tabs
            items={[
              {
                key: "today",
                label: "Today",
                children: <TodayTab settings={settings} />,
              },
              ...(settings.showDirectory
                ? [
                    {
                      key: "directory",
                      label: "Directory",
                      children: <DirectoryTab />,
                    },
                    {
                      key: "org-chart",
                      label: "Org Chart",
                      children: <OrgChartTab />,
                    },
                  ]
                : []),
            ]}
          />
        )}
      </div>
    </div>
  );
}
