import { useState } from "react";
import { Button, Select, Space, Typography } from "antd";
import { PlusOutlined, ReloadOutlined } from "@ant-design/icons";
import { useNavigate } from "@tanstack/react-router";
import {
  useWtaxTableRows,
  useWtaxTableVersions,
  useDeleteWtaxTableRow,
} from "../../hooks/use-wtax-table-queries";
import WtaxTableTable from "../../components/wtax-table-table";
import {
  WTAX_TABLE_LABEL,
  PAYROLL_TYPE_OPTIONS,
} from "../../constants/label.const";

const { Title } = Typography;

export default function WtaxTableList() {
  const navigate = useNavigate();
  const [payrollType, setPayrollType] = useState<string>("SEMI_MONTHLY");
  const [effectivity, setEffectivity] = useState<string | undefined>(undefined);

  const { data: versions = [], isLoading: isLoadingVersions } =
    useWtaxTableVersions(payrollType);

  // Default to the most recent effectivity date for the selected payroll type.
  // Derived inline rather than synced via effect: whenever the current pick
  // isn't valid for this payroll type (nothing picked yet, or it switched and
  // the old date isn't offered anymore), this falls back to the newest date
  // that's actually available.
  const resolvedEffectivity =
    effectivity && versions.includes(effectivity) ? effectivity : versions[0];

  const {
    data: rows = [],
    isLoading,
    refetch,
    isFetching,
  } = useWtaxTableRows(resolvedEffectivity, payrollType);
  const { mutate: remove } = useDeleteWtaxTableRow();

  const versionOptions = versions.map((v) => ({ value: v, label: v }));

  return (
    <div className="content-page">
      <div className="page-toolbar">
        <div className="page-toolbar-row">
          <div>
            <Title level={4} className="mb-0!">
              {WTAX_TABLE_LABEL.TITLE}
            </Title>
            <p className="page-toolbar-subtitle">
              Manage withholding tax brackets by effectivity date and payroll
              type.
            </p>
          </div>
          <Space>
            <Button
              icon={<ReloadOutlined spin={isFetching} />}
              onClick={() => refetch()}
              loading={isFetching && !isLoading}
            />
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => navigate({ to: "/setup/wtax-table/create" })}
            >
              Add Bracket
            </Button>
          </Space>
        </div>
        <div className="page-toolbar-row">
          <Space>
            <span>{WTAX_TABLE_LABEL.PAYROLL_TYPE}:</span>
            <Select
              value={payrollType}
              onChange={setPayrollType}
              options={PAYROLL_TYPE_OPTIONS}
              style={{ width: 160 }}
            />
            <span>Effectivity Date:</span>
            <Select
              value={resolvedEffectivity}
              onChange={setEffectivity}
              options={versionOptions}
              loading={isLoadingVersions}
              placeholder="Select effectivity date"
              style={{ width: 180 }}
              notFoundContent={
                isLoadingVersions ? undefined : "No dates on file"
              }
            />
          </Space>
        </div>
      </div>

      <WtaxTableTable data={rows} loading={isLoading} onDelete={remove} />
    </div>
  );
}
