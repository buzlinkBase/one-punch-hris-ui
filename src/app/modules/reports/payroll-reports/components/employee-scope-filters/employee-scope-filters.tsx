import { Form, Select } from "antd";
import { useClients } from "@/app/modules/setup/client/hooks/use-client-queries";
import { useOperationAreas } from "@/app/modules/setup/operation-area/hooks/use-operation-area-queries";
import { usePayrollGroups } from "@/app/modules/setup/payroll-group/hooks/use-payroll-group-queries";
import { useDepartments } from "@/app/modules/setup/department/hooks/use-department-queries";
import { useBranches } from "@/app/modules/setup/branch/hooks/use-branch-queries";
import type { EmployeeScopeFilter } from "../../models/api/request/employee-scope-filter.model";

interface Props {
  value: EmployeeScopeFilter;
  onChange: (value: EmployeeScopeFilter) => void;
}

interface Named {
  id: string;
  name: string;
  status?: string;
}

const toOptions = (items: Named[] = []) =>
  items
    .filter((i) => !i.status || i.status.toUpperCase() === "ACTIVE")
    .map((i) => ({ value: i.id, label: i.name }))
    .sort((a, b) => a.label.localeCompare(b.label));

// The optional "narrow to these employees" filters shared by payroll reports: every one is a
// single-select that can be cleared, and a cleared one simply isn't sent to the API.
export function EmployeeScopeFilters({ value, onChange }: Props) {
  const { data: clients } = useClients();
  const { data: areas } = useOperationAreas();
  const { data: payrollGroups } = usePayrollGroups();
  const { data: departments } = useDepartments();
  const { data: branches } = useBranches();

  const set = (key: keyof EmployeeScopeFilter) => (next?: string) =>
    onChange({ ...value, [key]: next });

  const field = (
    label: string,
    key: keyof EmployeeScopeFilter,
    items: Named[] | undefined,
  ) => (
    <Form.Item label={label} className="mb-0 min-w-52">
      <Select
        allowClear
        showSearch={{ optionFilterProp: "label" }}
        placeholder={`All ${label}s`}
        options={toOptions(items)}
        value={value[key]}
        onChange={set(key)}
        className="w-full"
      />
    </Form.Item>
  );

  return (
    <>
      {field("Client", "clientId", clients)}
      {field("Area", "areaId", areas)}
      {field("Payroll Group", "payrollGroupId", payrollGroups)}
      {field("Department", "departmentId", departments)}
      {field("Branch", "branchId", branches)}
    </>
  );
}
