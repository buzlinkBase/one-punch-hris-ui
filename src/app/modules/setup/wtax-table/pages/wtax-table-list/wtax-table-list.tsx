import { useState } from "react";
import { Button, Select, Space, Typography } from "antd";
import { PlusOutlined, ReloadOutlined } from "@ant-design/icons";
import { useNavigate } from "@tanstack/react-router";
import {
  useWtaxTableRows,
  useDeleteWtaxTableRow,
} from "../../hooks/use-wtax-table-queries";
import WtaxTableTable from "../../components/wtax-table-table";
import {
  WTAX_TABLE_LABEL,
  PAYROLL_TYPE_OPTIONS,
} from "../../constants/label.const";
import { PermissionGate } from "@/shared/components/permission-gate/permission-gate";

const { Title } = Typography;

export default function WtaxTableList() {
  const navigate = useNavigate();
  const [payrollType, setPayrollType] = useState<string>("SEMI_MONTHLY");

  const {
    data: rows = [],
    isLoading,
    refetch,
    isFetching,
  } = useWtaxTableRows(payrollType);
  const { mutate: remove } = useDeleteWtaxTableRow();

  return (
    <div className="content-page">
      <div className="page-toolbar">
        <div className="page-toolbar-row">
          <div>
            <Title level={4} className="mb-0!">
              {WTAX_TABLE_LABEL.TITLE}
            </Title>
            <p className="page-toolbar-subtitle">
              Manage withholding tax brackets by payroll type.
            </p>
          </div>
          <Space>
            <Button
              icon={<ReloadOutlined spin={isFetching} />}
              onClick={() => refetch()}
              loading={isFetching && !isLoading}
            />
            <PermissionGate permission="Statutory Tables:Create">
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => navigate({ to: "/setup/wtax-table/create" })}
              >
                Add Bracket
              </Button>
            </PermissionGate>
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
          </Space>
        </div>
      </div>

      <WtaxTableTable data={rows} loading={isLoading} onDelete={remove} />
    </div>
  );
}
