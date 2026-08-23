import { useState } from "react";
import { Button, Select, Space, Typography } from "antd";
import { PlusOutlined, ReloadOutlined } from "@ant-design/icons";
import { useNavigate } from "@tanstack/react-router";
import {
  useAnnualTaxTableRows,
  useAnnualTaxTableVersions,
  useDeleteAnnualTaxTableRow,
} from "../../hooks/use-annual-tax-table-queries";
import AnnualTaxTableTable from "../../components/annual-tax-table-table";
import { ANNUAL_TAX_TABLE_LABEL } from "../../constants/label.const";

const { Title } = Typography;

export default function AnnualTaxTableList() {
  const navigate = useNavigate();
  const [effectivity, setEffectivity] = useState<string | undefined>(undefined);

  const { data: versions = [], isLoading: isLoadingVersions } =
    useAnnualTaxTableVersions();

  // Default to the most recent effectivity date once versions load. Derived
  // inline rather than synced via effect: no explicit pick yet just falls
  // back to the newest version each render.
  const resolvedEffectivity = effectivity ?? versions[0];

  const {
    data: rows = [],
    isLoading,
    refetch,
    isFetching,
  } = useAnnualTaxTableRows(resolvedEffectivity);
  const { mutate: remove } = useDeleteAnnualTaxTableRow();

  const versionOptions = versions.map((v) => ({ value: v, label: v }));

  return (
    <div className="content-page">
      <div className="page-toolbar">
        <div className="page-toolbar-row">
          <div>
            <Title level={4} className="mb-0!">
              {ANNUAL_TAX_TABLE_LABEL.TITLE}
            </Title>
            <p className="page-toolbar-subtitle">
              Manage annual income tax brackets by effectivity date.
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
              onClick={() => navigate({ to: "/setup/annual-tax-table/create" })}
            >
              Add Bracket
            </Button>
          </Space>
        </div>
        <div className="page-toolbar-row">
          <Space>
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

      <AnnualTaxTableTable data={rows} loading={isLoading} onDelete={remove} />
    </div>
  );
}
