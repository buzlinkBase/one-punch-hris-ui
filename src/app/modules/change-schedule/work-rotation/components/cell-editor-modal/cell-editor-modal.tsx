import { useState } from "react";
import { Button, Modal, Select, Space } from "antd";
import dayjs from "dayjs";
import { ROSTER_LABEL } from "@/app/modules/reports/rostering/constants/label.const";
import {
  clientAfterSiteChange,
  clientSiteMismatch,
  siteAfterClientChange,
  siteOptionGroups,
  type SiteLite,
} from "../../utils/site-client-options.util";
import type { CellPaint } from "../../utils/schedule-grid.util";

export interface CellEditTarget {
  key: string;
  employeeName: string;
  date: string;
  paint: CellPaint | null;
}

interface Option {
  value: string;
  label: string;
}

interface Props {
  target: CellEditTarget | null;
  shiftOptions: Option[];
  clientOptions: Option[];
  sites: SiteLite[];
  clientNameOf: (clientId: string) => string;
  onApply: (key: string, paint: CellPaint) => void;
  onClear: (key: string) => void;
  // Applies the values to this day and makes them the template for the next cells painted.
  onUseTemplate: (key: string, paint: CellPaint) => void;
  onCancel: () => void;
}

const filterByLabel = (
  input: string,
  option?: { label?: string | number | boolean },
) =>
  String(option?.label ?? "")
    .toLowerCase()
    .includes(input.toLowerCase());

interface FormProps extends Omit<Props, "target"> {
  target: CellEditTarget;
}

// Mounted per target, so each cell opens with its own values.
function CellEditorForm({
  target,
  shiftOptions,
  clientOptions,
  sites,
  clientNameOf,
  onApply,
  onClear,
  onUseTemplate,
  onCancel,
}: FormProps) {
  const [shiftId, setShiftId] = useState<string | null>(
    target.paint?.shiftId ?? null,
  );
  const [clientId, setClientId] = useState<string | null>(
    target.paint?.clientId ?? null,
  );
  const [areaId, setAreaId] = useState<string | null>(
    target.paint?.areaId ?? null,
  );

  const siteGroups = siteOptionGroups(sites, clientId, clientNameOf, areaId);
  const changeClient = (next: string | null) => {
    setClientId(next);
    setAreaId(siteAfterClientChange(sites, next, areaId));
  };
  const changeSite = (next: string | null) => {
    setAreaId(next);
    setClientId(clientAfterSiteChange(sites, next, clientId));
  };
  const mismatchedSite = clientSiteMismatch(sites, clientId, areaId);

  return (
    <Modal
      title={`Edit Day — ${target.employeeName} on ${dayjs(target.date).format("MMM D, YYYY")}`}
      open
      onCancel={onCancel}
      footer={
        <div className="flex items-center justify-between">
          <Button danger onClick={() => onClear(target.key)}>
            Clear Day
          </Button>
          <Space>
            <Button onClick={onCancel}>Cancel</Button>
            <Button
              disabled={!shiftId}
              onClick={() =>
                shiftId &&
                onUseTemplate(target.key, { shiftId, areaId, clientId })
              }
            >
              Use as template
            </Button>
            <Button
              type="primary"
              disabled={!shiftId}
              onClick={() =>
                shiftId && onApply(target.key, { shiftId, areaId, clientId })
              }
            >
              Apply
            </Button>
          </Space>
        </div>
      }
    >
      <div className="mb-1 mt-2 text-sm">Shift</div>
      <Select
        className="w-full"
        showSearch={{ filterOption: filterByLabel }}
        placeholder="Select a time shift"
        options={shiftOptions}
        value={shiftId ?? undefined}
        onChange={(v: string) => setShiftId(v)}
      />
      <div className="mt-3 mb-1 text-sm">{ROSTER_LABEL.CLIENT}</div>
      <Select
        className="w-full"
        allowClear
        showSearch={{ filterOption: filterByLabel }}
        placeholder={ROSTER_LABEL.CLIENT_PLACEHOLDER}
        options={clientOptions}
        value={clientId ?? undefined}
        onChange={(v?: string) => changeClient(v ?? null)}
      />
      <p className="mt-1 text-xs text-gray-400">{ROSTER_LABEL.CLIENT_HINT}</p>
      <div className="mt-3 mb-1 text-sm">{ROSTER_LABEL.AREA}</div>
      <Select
        className="w-full"
        allowClear
        showSearch={{ filterOption: filterByLabel }}
        placeholder={ROSTER_LABEL.AREA_PLACEHOLDER}
        options={siteGroups}
        value={areaId ?? undefined}
        onChange={(v?: string) => changeSite(v ?? null)}
      />
      {clientId && (
        <p className="mt-1 text-xs text-gray-400">
          {ROSTER_LABEL.AREA_FILTERED_HINT}
        </p>
      )}
      {mismatchedSite && (
        <p className="mt-1 text-xs text-amber-600">
          {`This project site belongs to ${mismatchedSite.clientName ?? "another client"}. The client you picked is used for this day instead.`}
        </p>
      )}
      <p className="mt-2 text-xs text-gray-400">
        Applies to this day only. Nothing is saved until you click Save
        schedule.
      </p>
    </Modal>
  );
}

/** Per-day editor for Quick Schedule: shift, client and project site for one grid cell. It only
 * changes the unsaved edits; the schedule is saved from the grid's save bar. */
export function CellEditorModal({ target, ...rest }: Props) {
  if (!target) return null;
  return <CellEditorForm key={target.key} target={target} {...rest} />;
}
