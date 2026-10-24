import { Avatar, Tag, Typography } from "antd";
import {
  ApartmentOutlined,
  BankOutlined,
  DownOutlined,
  RightOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import type { OrgFlowNode } from "./org-chart-layout";
import { initialsOf } from "./org-chart-utils";

const { Text } = Typography;

const UNIT_ICON = {
  company: BankOutlined,
  department: ApartmentOutlined,
  section: TeamOutlined,
  employee: TeamOutlined,
} as const;

function Handles() {
  return (
    <>
      <Handle type="target" position={Position.Top} className="opacity-0!" />
      <Handle type="source" position={Position.Bottom} className="opacity-0!" />
    </>
  );
}

function ToggleButton({
  id,
  label,
  isOpen,
  onToggle,
}: {
  id: string;
  label: string;
  isOpen: boolean;
  onToggle: (id: string) => void;
}) {
  const Chevron = isOpen ? DownOutlined : RightOutlined;
  return (
    <button
      type="button"
      onClick={() => onToggle(id)}
      aria-expanded={isOpen}
      aria-label={`${isOpen ? "Collapse" : "Expand"} ${label}`}
      className="nodrag nopan flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center rounded border-0 bg-transparent text-xs text-(--text-secondary) hover:bg-(--bg-hover)"
    >
      <Chevron />
    </button>
  );
}

/** A company, department or section box. */
export function OrgUnitNode({ data }: NodeProps<OrgFlowNode>) {
  const { node, isOpen, isMatch, onToggle } = data;
  const Icon = UNIT_ICON[node.kind];
  const hasChildren = node.children.length > 0;

  return (
    <div
      className={`flex h-16 w-55 items-center gap-2 rounded-lg border-2 border-solid px-2 ${
        isMatch
          ? "border-(--primary) bg-(--primary-soft)"
          : "border-(--border-chip) bg-(--bg-surface)"
      }`}
    >
      <Handles />
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-(--primary-soft) text-(--primary)">
        <Icon />
      </span>
      <div className="min-w-0 flex-1">
        <p className="m-0 truncate font-semibold">{node.name}</p>
        <Text type="secondary" className="block truncate text-xs">
          {node.headCount} {node.headCount === 1 ? "person" : "people"}
        </Text>
      </div>
      {hasChildren && (
        <ToggleButton
          id={node.id}
          label={node.name}
          isOpen={isOpen}
          onToggle={onToggle}
        />
      )}
    </div>
  );
}

/** One person; their reports hang beneath and can be collapsed. */
export function OrgPersonNode({ data }: NodeProps<OrgFlowNode>) {
  const { node, isOpen, isMe, isMatch, onToggle } = data;
  const hasReports = node.children.length > 0;

  return (
    <div
      className={`flex h-18 w-55 items-center gap-2 rounded-lg border border-solid px-2 ${
        isMe || isMatch
          ? "border-(--primary) bg-(--primary-soft)"
          : "border-(--border-subtle) bg-(--bg-surface)"
      }`}
    >
      <Handles />
      <Avatar size={36} className="shrink-0 bg-(--primary)!">
        {initialsOf(node.name)}
      </Avatar>
      <div className="min-w-0 flex-1">
        <p className="m-0 truncate font-medium">
          {node.name}
          {isMe && (
            <Tag color="green" className="ml-2">
              You
            </Tag>
          )}
        </p>
        {node.positionName && (
          <Text type="secondary" className="block truncate text-xs">
            {node.positionName}
          </Text>
        )}
      </div>
      {hasReports && (
        <ToggleButton
          id={node.id}
          label={`${node.name}'s team`}
          isOpen={isOpen}
          onToggle={onToggle}
        />
      )}
    </div>
  );
}
