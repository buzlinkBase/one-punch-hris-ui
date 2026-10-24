import { Avatar, Tag, Typography } from "antd";
import { DownOutlined, RightOutlined } from "@ant-design/icons";
import type { OrgNodeResponse } from "../../../shared/models/api/response/coworker-response.model";
import { countDescendants, initialsOf, orgNodeDomId } from "./org-chart-utils";

const { Text } = Typography;

interface OrgNodeProps {
  node: OrgNodeResponse;
  expanded: ReadonlySet<string>;
  /** People who matched the search, drawn with the brand outline. */
  matchedIds: ReadonlySet<string>;
  meId?: string;
  onToggle: (id: string) => void;
}

/** One person in the reporting tree, with their reports nested (and connected) beneath. */
export default function OrgNode({
  node,
  expanded,
  matchedIds,
  meId,
  onToggle,
}: OrgNodeProps) {
  const hasReports = node.reports.length > 0;
  const isOpen = hasReports && expanded.has(node.id);
  const isMe = node.id === meId;
  const isMatch = matchedIds.has(node.id);
  const total = hasReports ? countDescendants(node) : 0;

  const Chevron = isOpen ? DownOutlined : RightOutlined;

  return (
    <li className="list-none">
      <div
        id={orgNodeDomId(node.id)}
        className={`flex items-center gap-3 rounded-lg border bg-(--bg-surface) p-2 pr-3 transition-colors ${
          isMe || isMatch
            ? "border-(--primary) bg-(--primary-soft)"
            : "border-(--border-subtle)"
        }`}
      >
        {hasReports ? (
          <button
            type="button"
            onClick={() => onToggle(node.id)}
            aria-expanded={isOpen}
            aria-label={`${isOpen ? "Collapse" : "Expand"} ${node.fullName}'s team`}
            className="flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center rounded border-0 bg-transparent text-xs text-(--text-secondary) hover:bg-(--bg-hover)"
          >
            <Chevron />
          </button>
        ) : (
          <span className="h-6 w-6 shrink-0" aria-hidden />
        )}

        <Avatar size={36} className="shrink-0 bg-(--primary)!">
          {initialsOf(node.fullName)}
        </Avatar>

        <div className="min-w-0 flex-1">
          <p className="m-0 truncate font-medium">
            {node.fullName}
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
          <Tag className="m-0 shrink-0">
            {total} {total === 1 ? "person" : "people"}
          </Tag>
        )}
      </div>

      {isOpen && (
        <ul className="m-0 mt-2 ml-5 flex flex-col gap-2 border-0 border-l-2 border-solid border-(--border-chip) p-0 pl-4">
          {node.reports.map((child) => (
            <OrgNode
              key={child.id}
              node={child}
              expanded={expanded}
              matchedIds={matchedIds}
              meId={meId}
              onToggle={onToggle}
            />
          ))}
        </ul>
      )}
    </li>
  );
}
