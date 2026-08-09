import { Tabs, Typography } from "antd";
import DtrBatchTab from "./dtr-batch-tab";
import DtrGenerateTab from "./dtr-generate-tab";

const { Title } = Typography;

const TAB_ITEMS = [
  {
    key: "generate",
    label: "Generate",
    children: <DtrGenerateTab />,
  },
  {
    key: "batch",
    label: "Posted DTR",
    children: <DtrBatchTab />,
  },
];

export default function DtrDetailMaster() {
  return (
    <div className="content-page">
      <div className="page-toolbar">
        <div className="page-toolbar-row">
          <div>
            <Title level={4} className="mb-0!">
              DTR Detail
            </Title>
            <p className="page-toolbar-subtitle">
              View per-day time record details by batch code or generate by date
              range.
            </p>
          </div>
        </div>
      </div>

      <Tabs items={TAB_ITEMS} />
    </div>
  );
}
