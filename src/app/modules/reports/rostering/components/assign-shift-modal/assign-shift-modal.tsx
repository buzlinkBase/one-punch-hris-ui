import { Button, Modal, Select, Space, Tag, Tooltip } from "antd";
import dayjs from "dayjs";
import {
  ROSTER_LABEL,
  SCHEDULE_SOURCE_LABEL,
} from "../../constants/label.const";
import type { AssignTarget } from "../../hooks/use-shift-assignment";
import {
  clientAfterSiteChange,
  clientSiteMismatch,
  siteAfterClientChange,
  siteOptionGroups,
  type SiteLite,
} from "@/app/modules/change-schedule/work-rotation/utils/site-client-options.util";

interface Props {
  assignTarget: AssignTarget | null;
  selectedShiftId: string | null;
  onSelectShift: (shiftId: string) => void;
  timeShiftOptions: { value: string; label: string }[];
  isLoadingShifts: boolean;
  selectedAreaId: string | null;
  onSelectArea: (areaId: string | null) => void;
  /** Every project site with the client it belongs to (if any) -- the site list narrows by client. */
  sites: SiteLite[];
  selectedClientId: string | null;
  onSelectClient: (clientId: string | null) => void;
  clientOptions: { value: string; label: string }[];
  clientNameOf: (clientId: string) => string;
  isAssigning: boolean;
  isRemoving: boolean;
  onAssign: () => void;
  onRemove: () => void;
  onCancel: () => void;
}

/** Shared "Assign Shift" modal — used identically by the Timeline and Month roster views (see
 * useShiftAssignment). Always creates a Work Rotation Plan override for the exact target date,
 * regardless of what the day currently resolves from (Fixed Schedule, Permanent Shift, or an
 * existing override). */
export default function AssignShiftModal({
  assignTarget,
  selectedShiftId,
  onSelectShift,
  timeShiftOptions,
  isLoadingShifts,
  selectedAreaId,
  onSelectArea,
  sites,
  selectedClientId,
  onSelectClient,
  clientOptions,
  clientNameOf,
  isAssigning,
  isRemoving,
  onAssign,
  onRemove,
  onCancel,
}: Props) {
  // Client first, then the sites under it. The site list shows that client's sites plus the ones
  // not tied to any client; picking a site that belongs to a client fills the client in.
  const siteGroups = siteOptionGroups(
    sites,
    selectedClientId,
    clientNameOf,
    selectedAreaId,
  );
  const changeClient = (clientId: string | null) => {
    onSelectClient(clientId);
    onSelectArea(siteAfterClientChange(sites, clientId, selectedAreaId));
  };
  const changeSite = (siteId: string | null) => {
    onSelectArea(siteId);
    onSelectClient(clientAfterSiteChange(sites, siteId, selectedClientId));
  };
  // Only an entry saved before the two pickers narrowed each other can still disagree.
  const mismatchedSite = clientSiteMismatch(
    sites,
    selectedClientId,
    selectedAreaId,
  );

  return (
    <Modal
      title={
        assignTarget
          ? `Assign Shift — ${assignTarget.employeeName} on ${dayjs(assignTarget.date).format("MMM D, YYYY")}`
          : "Assign Shift"
      }
      open={!!assignTarget}
      onCancel={onCancel}
      destroyOnClose
      footer={
        <div className="flex items-center justify-between">
          <Tooltip
            title={
              assignTarget?.overrideId
                ? undefined
                : "No Work Rotation Plan override to remove — this shift comes from Fixed Schedule or the employee's Permanent Shift."
            }
          >
            <Button
              danger
              disabled={!assignTarget?.overrideId}
              loading={isRemoving}
              onClick={onRemove}
            >
              Remove Shift
            </Button>
          </Tooltip>
          <Space>
            <Button onClick={onCancel}>Cancel</Button>
            <Button
              type="primary"
              loading={isAssigning}
              disabled={!selectedShiftId}
              onClick={onAssign}
            >
              Assign
            </Button>
          </Space>
        </div>
      }
    >
      {assignTarget?.currentShiftId && assignTarget.scheduleSource && (
        <div className="mb-3 text-sm text-gray-500">
          Currently from:{" "}
          <Tag
            color={SCHEDULE_SOURCE_LABEL[assignTarget.scheduleSource]?.color}
          >
            {SCHEDULE_SOURCE_LABEL[assignTarget.scheduleSource]?.label ??
              assignTarget.scheduleSource}
          </Tag>
        </div>
      )}
      <Select
        className="w-full mt-2"
        showSearch
        loading={isLoadingShifts}
        placeholder="Select a time shift"
        options={timeShiftOptions}
        value={selectedShiftId ?? undefined}
        onChange={onSelectShift}
        filterOption={(input, option) =>
          String(option?.label ?? "")
            .toLowerCase()
            .includes(input.toLowerCase())
        }
      />
      <div className="mt-3 mb-1 text-sm">{ROSTER_LABEL.CLIENT}</div>
      <Select
        className="w-full"
        showSearch
        allowClear
        placeholder={ROSTER_LABEL.CLIENT_PLACEHOLDER}
        options={clientOptions}
        value={selectedClientId ?? undefined}
        onChange={(v: string | undefined) => changeClient(v ?? null)}
        filterOption={(input, option) =>
          String(option?.label ?? "")
            .toLowerCase()
            .includes(input.toLowerCase())
        }
      />
      <p className="text-xs text-gray-400 mt-1">{ROSTER_LABEL.CLIENT_HINT}</p>
      <div className="mt-3 mb-1 text-sm">{ROSTER_LABEL.AREA}</div>
      <Select
        className="w-full"
        showSearch
        allowClear
        placeholder={ROSTER_LABEL.AREA_PLACEHOLDER}
        options={siteGroups}
        value={selectedAreaId ?? undefined}
        onChange={(v: string | undefined) => changeSite(v ?? null)}
        filterOption={(input, option) =>
          String(option?.label ?? "")
            .toLowerCase()
            .includes(input.toLowerCase())
        }
      />
      {selectedClientId && (
        <p className="text-xs text-gray-400 mt-1">
          {ROSTER_LABEL.AREA_FILTERED_HINT}
        </p>
      )}
      {mismatchedSite && (
        <p className="text-xs text-amber-600 mt-1">
          {`This project site belongs to ${mismatchedSite.clientName ?? "another client"}. The client you picked is used for this day instead.`}
        </p>
      )}
      <p className="text-xs text-gray-400 mt-2">
        Assigning here always creates a Work Rotation Plan override for this
        exact date, regardless of the current source. With a project site
        picked, attendance on this day is recorded under that site.
      </p>
    </Modal>
  );
}
