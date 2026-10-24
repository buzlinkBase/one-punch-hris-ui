import { Tabs, Typography } from "antd";
import ForPayrollGenerateTab from "./for-payroll-generate-tab";
import PayrollBatchesTab from "../../components/payroll-batches-tab";
import CutoffTrackerTab from "../../components/cutoff-tracker-tab";

const { Title } = Typography;

const TAB_ITEMS = [
  {
    key: "generate",
    label: "Generate",
    children: <ForPayrollGenerateTab />,
  },
  {
    key: "batches",
    label: "Saved Payroll Runs",
    children: <PayrollBatchesTab />,
  },
  {
    key: "tracker",
    label: "Cutoff Tracker",
    children: <CutoffTrackerTab />,
  },
];

export default function ForPayrollList() {
  return (
    <div className="content-page">
      <div className="page-toolbar">
        <div className="page-toolbar-row">
          <div>
            <Title level={4} className="mb-0!">
              Payroll Run
            </Title>
            <p className="page-toolbar-subtitle">
              Pick a cutoff to see who is ready to be paid, choose a payroll
              group, then preview and save.
            </p>
          </div>
        </div>
      </div>

      <Tabs items={TAB_ITEMS} />
    </div>
  );
}
