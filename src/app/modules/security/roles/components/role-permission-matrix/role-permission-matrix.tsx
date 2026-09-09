import { useMemo } from "react";
import { Card, Checkbox, Empty, Skeleton, Typography } from "antd";
import type { PermissionResponse } from "@/app/modules/security/permissions/models/api/response/permission-response.model";
import { PERMISSION_ACTION_OPTIONS } from "@/app/modules/security/permissions/constants/label.const";

const { Text } = Typography;

interface Props {
  permissions: PermissionResponse[];
  loading?: boolean;
  checkedIds: Set<string>;
  onChange: (checkedIds: Set<string>) => void;
}

// One collapsible-by-scroll card per Module; each row is a Feature with a checkbox per Action
// that catalog actually offers for it (not every feature exposes every verb in the standard set).
export default function RolePermissionMatrix({
  permissions,
  loading,
  checkedIds,
  onChange,
}: Props) {
  const groupedByModule = useMemo(() => {
    const modules = new Map<string, Map<string, PermissionResponse[]>>();
    for (const permission of permissions) {
      if (!modules.has(permission.module))
        modules.set(permission.module, new Map());
      const features = modules.get(permission.module)!;
      if (!features.has(permission.feature))
        features.set(permission.feature, []);
      features.get(permission.feature)!.push(permission);
    }
    return modules;
  }, [permissions]);

  const toggle = (permissionId: string, checked: boolean) => {
    const next = new Set(checkedIds);
    if (checked) next.add(permissionId);
    else next.delete(permissionId);
    onChange(next);
  };

  if (loading) return <Skeleton active paragraph={{ rows: 6 }} />;
  if (permissions.length === 0)
    return <Empty description="No permissions in the catalog yet." />;

  return (
    <div className="flex flex-col gap-4">
      {Array.from(groupedByModule.entries()).map(([module, features]) => (
        <Card key={module} title={module} size="small">
          <div className="flex flex-col gap-2">
            <div className="grid grid-cols-[minmax(160px,1fr)_repeat(8,80px)] gap-2 items-center">
              <span />
              {PERMISSION_ACTION_OPTIONS.map((action) => (
                <Text
                  key={action.value}
                  type="secondary"
                  className="text-xs text-center"
                >
                  {action.label}
                </Text>
              ))}
            </div>
            {Array.from(features.entries()).map(
              ([feature, featurePermissions]) => (
                <div
                  key={feature}
                  className="grid grid-cols-[minmax(160px,1fr)_repeat(8,80px)] gap-2 items-center"
                >
                  <span>{feature}</span>
                  {PERMISSION_ACTION_OPTIONS.map((action) => {
                    const permission = featurePermissions.find(
                      (p) => p.action === action.value,
                    );
                    if (!permission) return <span key={action.value} />;
                    return (
                      <div key={action.value} className="flex justify-center">
                        <Checkbox
                          checked={checkedIds.has(permission.id)}
                          onChange={(e) =>
                            toggle(permission.id, e.target.checked)
                          }
                        />
                      </div>
                    );
                  })}
                </div>
              ),
            )}
          </div>
        </Card>
      ))}
    </div>
  );
}
