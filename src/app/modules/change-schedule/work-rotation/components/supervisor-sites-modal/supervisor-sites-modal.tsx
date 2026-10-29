import { useState } from "react";
import { Alert, Modal, Select, Typography } from "antd";
import { apiErrorMessage } from "@/core/http/api-error";
import { getNotify } from "@/shared/utils/notify";
import { useEmployeeFilter } from "@/app/modules/timekeeping/attendance-entry/hooks/use-attendance-entry-queries";
import { useOperationAreas } from "@/app/modules/setup/operation-area/hooks/use-operation-area-queries";
import {
  useSetSupervisorSiteGrants,
  useSupervisorSiteGrants,
} from "../../hooks/use-work-rotation-queries";

const { Text } = Typography;

interface SupervisorSitesModalProps {
  open: boolean;
  onClose: () => void;
}

const filterByLabel = (
  input: string,
  option?: { label?: string | number | boolean },
) =>
  String(option?.label ?? "")
    .toLowerCase()
    .includes(input.toLowerCase());

export function SupervisorSitesModal({
  open,
  onClose,
}: SupervisorSitesModalProps) {
  const [employeeId, setEmployeeId] = useState<string | undefined>();
  const [edited, setEdited] = useState<string[] | undefined>();

  const { data: employees = [], isLoading: isEmployeesLoading } =
    useEmployeeFilter({}, { enabled: open });
  const { data: areas = [] } = useOperationAreas();
  const { data: granted, isFetching } = useSupervisorSiteGrants(employeeId);
  const { mutateAsync: saveGrants, isPending: isSaving } =
    useSetSupervisorSiteGrants();

  // Until edited, the picked supervisor's existing sites are shown.
  const areaIds = edited ?? granted ?? [];

  const pickSupervisor = (id: string | undefined) => {
    setEmployeeId(id);
    setEdited(undefined);
  };

  const close = () => {
    setEmployeeId(undefined);
    setEdited(undefined);
    onClose();
  };

  const save = async () => {
    if (!employeeId) return;
    try {
      await saveGrants({ employeeId, areaIds });
      getNotify().success({
        message: "Supervisor sites saved",
        description: areaIds.length
          ? `${areaIds.length} project site${areaIds.length === 1 ? "" : "s"} granted.`
          : "No sites granted. This supervisor schedules only their direct reports.",
      });
      close();
    } catch (err) {
      getNotify().error({
        message: "Save Failed",
        description: apiErrorMessage(
          err,
          "Couldn't save the supervisor's sites.",
        ),
      });
    }
  };

  return (
    <Modal
      title="Supervisor project sites"
      open={open}
      onCancel={close}
      onOk={save}
      okText="Save"
      okButtonProps={{ disabled: !employeeId, loading: isSaving }}
      confirmLoading={isSaving}
    >
      <div className="flex flex-col gap-4">
        <Alert
          type="info"
          showIcon
          message="Grant a supervisor project sites so they can schedule the employees assigned there, on top of their direct reports. They can then only send people to those sites. With no sites, they schedule only their direct reports."
        />
        <div className="flex flex-col gap-1">
          <Text>Supervisor</Text>
          <Select
            showSearch={{ filterOption: filterByLabel }}
            placeholder="Find a supervisor"
            loading={isEmployeesLoading}
            options={employees.map((e) => ({
              value: e.id,
              label: e.name ?? e.id,
            }))}
            value={employeeId}
            onChange={pickSupervisor}
          />
        </div>
        <div className="flex flex-col gap-1">
          <Text>Project sites</Text>
          <Select
            mode="multiple"
            disabled={!employeeId}
            loading={isFetching}
            placeholder="Select project sites"
            showSearch={{ filterOption: filterByLabel }}
            options={areas.map((a) => ({
              value: a.id,
              label: `${a.code} - ${a.name}`,
            }))}
            value={areaIds}
            onChange={setEdited}
          />
        </div>
      </div>
    </Modal>
  );
}
