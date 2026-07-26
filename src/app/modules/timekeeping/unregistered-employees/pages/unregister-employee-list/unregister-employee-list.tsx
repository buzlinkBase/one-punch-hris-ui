import { useState } from "react";
import { Badge, Button, Card, Typography } from "antd";
import dayjs from "dayjs";
import { FilterOutlined, PlusOutlined } from "@ant-design/icons";
import { useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import UnregisterEmployeeFilter from "../../components/unregister-employee-filter";
import UnregisterEmployeeTable from "../../components/unregister-employee-table";
import TagToEmployeeModal from "../../components/tag-to-employee-modal/tag-to-employee-modal";
import { UNREGISTER_EMPLOYEE_LABEL } from "../../constants/label.const";
import {
  useUnregisterEmployees,
  UNREGISTER_EMPLOYEES_QUERY_KEY,
} from "../../hooks/use-unregister-employee-queries";
import type { UnregisterEmployeeFilter as UnregisterEmployeeFilterRequest } from "../../models/api/request/unregister-employee-filter.model";
import type { UnregisteredAttendanceLog } from "../../models/api/response/unregister-employee-response.model";

const { Title } = Typography;

function currentCutoff(): UnregisterEmployeeFilterRequest {
  const today = dayjs();
  const day = today.date();
  if (day <= 15) {
    return {
      fromDate: today.startOf("month").format("YYYY-MM-DD"),
      toDate: today.date(15).format("YYYY-MM-DD"),
    };
  }
  return {
    fromDate: today.date(16).format("YYYY-MM-DD"),
    toDate: today.endOf("month").format("YYYY-MM-DD"),
  };
}

const DEFAULT_FILTER = currentCutoff();

export default function UnregisterEmployeeList() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filters, setFilters] =
    useState<UnregisterEmployeeFilterRequest>(DEFAULT_FILTER);
  const [taggingEntries, setTaggingEntries] = useState<
    UnregisteredAttendanceLog[] | null
  >(null);

  const activeFilterCount = [filters.fromDate, filters.toDate].filter(
    Boolean,
  ).length;

  const { data: logs = [], isLoading } = useUnregisterEmployees(filters);

  const handleApplyFilter = (newFilters: UnregisterEmployeeFilterRequest) => {
    queryClient.invalidateQueries({ queryKey: UNREGISTER_EMPLOYEES_QUERY_KEY });
    setFilters(newFilters);
  };

  return (
    <div className="content-page">
      <div className="page-toolbar">
        <div className="page-toolbar-row">
          <div>
            <Title level={4} className="mb-0!">
              {UNREGISTER_EMPLOYEE_LABEL.TITLE}
            </Title>
            <p className="page-toolbar-subtitle">
              {UNREGISTER_EMPLOYEE_LABEL.SUBTITLE}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => navigate({ to: "/setup/employee/create" })}
            >
              Create Employee
            </Button>
            <Badge count={activeFilterCount} size="small">
              <Button
                icon={<FilterOutlined />}
                onClick={() => setFiltersOpen((v) => !v)}
                type={filtersOpen ? "default" : "text"}
              >
                Filters
              </Button>
            </Badge>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {filtersOpen && (
          <Card size="small">
            <UnregisterEmployeeFilter
              onFilter={handleApplyFilter}
              loading={isLoading}
              defaultValues={DEFAULT_FILTER}
            />
          </Card>
        )}
        <UnregisterEmployeeTable
          data={logs}
          loading={isLoading}
          onTag={setTaggingEntries}
        />
      </div>

      <TagToEmployeeModal
        key={taggingEntries?.[0]?.id}
        entries={taggingEntries}
        onClose={() => setTaggingEntries(null)}
      />
    </div>
  );
}
