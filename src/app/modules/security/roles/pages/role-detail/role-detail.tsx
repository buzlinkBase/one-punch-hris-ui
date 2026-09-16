import { useEffect, useMemo, useState } from "react";
import {
  Form,
  Input,
  Button,
  Typography,
  Space,
  Tag,
  Collapse,
  Checkbox,
  Divider,
  Empty,
} from "antd";
import { useNavigate } from "@tanstack/react-router";
import { useRouteParams } from "@/shared/hooks/use-route-params";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  roleFormSchema,
  type RoleFormValues,
} from "../../models/forms/role-form.schema";
import {
  useRole,
  useCreateRole,
  useUpdateRole,
  useSetRolePermissions,
} from "../../hooks/use-role-queries";
import { usePermissions } from "@/app/modules/security/permissions/hooks/use-permission-queries";
import type { Permission } from "../../models/api/response/role-response.model";
import { ROLE_LABEL } from "../../constants/label.const";
import { NAVIGATION_BUTTON_LABEL } from "@/shared/constants/navigation.const";
import { PermissionGate } from "@/shared/components/permission-gate/permission-gate";

const { Title, Text } = Typography;

export default function RoleDetail() {
  const { id } = useRouteParams<{ id?: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { data: selected } = useRole(isEdit ? id : undefined);
  const { data: permissions = [] } = usePermissions();
  const { mutateAsync: add, isPending: isCreating } = useCreateRole();
  const { mutateAsync: update, isPending: isUpdating } = useUpdateRole();
  const { mutateAsync: setPermissions, isPending: isSavingPermissions } =
    useSetRolePermissions();

  const isSystemRole = Boolean(selected?.isSystemRole);
  const readOnly = isEdit && isSystemRole;

  const [checkedIds, setCheckedIds] = useState<string[]>([]);
  // Tracks which role's permissions checkedIds currently reflects, so it can be re-synced
  // (adjusted during render, not in an effect -- see React's guidance on syncing state to props)
  // whenever `selected` loads or switches to a different role, without fighting the user's own
  // checkbox edits on every re-render in between.
  const [syncedRoleId, setSyncedRoleId] = useState<string | undefined>();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RoleFormValues>({
    resolver: zodResolver(roleFormSchema),
    defaultValues: { name: "", description: "" },
  });

  if (isEdit && selected && selected.id !== syncedRoleId) {
    setSyncedRoleId(selected.id);
    setCheckedIds(selected.rolePermissions.map((rp) => rp.permissionId));
  }

  useEffect(() => {
    if (isEdit && selected) {
      reset({ name: selected.name, description: selected.description });
    }
  }, [selected, isEdit, reset]);

  const groups = useMemo(() => {
    const byModule = new Map<string, Map<string, Permission[]>>();
    for (const permission of permissions) {
      const byFeature = byModule.get(permission.module) ?? new Map();
      const list = byFeature.get(permission.feature) ?? [];
      list.push(permission);
      byFeature.set(permission.feature, list);
      byModule.set(permission.module, byFeature);
    }
    return byModule;
  }, [permissions]);

  const onSubmit = async (values: RoleFormValues) => {
    if (isEdit && id) {
      await update({ id, data: values });
      navigate({ to: "/security/roles" });
    } else {
      const role = await add(values);
      navigate({ to: `/security/roles/${role.id}` });
    }
  };

  const onSavePermissions = async () => {
    if (!id) return;
    await setPermissions({ id, permissionIds: checkedIds });
  };

  const toggleFeature = (
    featurePermissions: Permission[],
    checked: boolean,
  ) => {
    const ids = featurePermissions.map((p) => p.id);
    setCheckedIds((prev) =>
      checked
        ? [...new Set([...prev, ...ids])]
        : prev.filter((existing) => !ids.includes(existing)),
    );
  };

  return (
    <div className="content-page">
      <div className="page-toolbar">
        <div className="page-toolbar-row">
          <div>
            <Title level={4} className="mb-0!">
              {!isEdit
                ? ROLE_LABEL.CREATE_TITLE
                : readOnly
                  ? ROLE_LABEL.VIEW_TITLE
                  : ROLE_LABEL.EDIT_TITLE}
            </Title>
            <p className="page-toolbar-subtitle">
              {readOnly
                ? "System roles ship with fixed permissions and can't be renamed or re-permissioned."
                : "Configure the role name, description, and the permissions it grants."}
            </p>
          </div>
          <Space>
            <Tag color={!isEdit ? "success" : readOnly ? "blue" : "processing"}>
              {!isEdit ? "New Record" : readOnly ? "System" : "Editing"}
            </Tag>
            <Button onClick={() => navigate({ to: "/security/roles" })}>
              {NAVIGATION_BUTTON_LABEL.BACK}
            </Button>
          </Space>
        </div>
      </div>

      <div className="form-page-body">
        <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
          <div className="form-grid-2">
            <Form.Item
              label={ROLE_LABEL.ROLE_NAME}
              validateStatus={errors.name ? "error" : ""}
              help={errors.name?.message}
            >
              <Controller
                name="name"
                control={control}
                render={({ field }) => <Input {...field} disabled={readOnly} />}
              />
            </Form.Item>

            <Form.Item label={ROLE_LABEL.DESCRIPTION}>
              <Controller
                name="description"
                control={control}
                render={({ field }) => <Input {...field} disabled={readOnly} />}
              />
            </Form.Item>
          </div>

          {!readOnly && (
            <div className="form-action-footer">
              <Space className="form-action-footer-row">
                <Button onClick={() => navigate({ to: "/security/roles" })}>
                  {NAVIGATION_BUTTON_LABEL.BACK}
                </Button>
                <PermissionGate
                  permission={[
                    "Tenant Roles:Manage",
                    isEdit ? "Roles:Edit" : "Roles:Create",
                  ]}
                >
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={isUpdating || isCreating}
                  >
                    {NAVIGATION_BUTTON_LABEL.SAVE}
                  </Button>
                </PermissionGate>
              </Space>
            </div>
          )}
        </Form>

        {isEdit && (
          <>
            <Divider />
            <Title level={5}>{ROLE_LABEL.PERMISSIONS}</Title>
            {groups.size === 0 ? (
              <Empty description="No permissions in the catalog" />
            ) : (
              <Collapse
                items={[...groups.entries()].map(([module, byFeature]) => ({
                  key: module,
                  label: module,
                  children: (
                    <Space direction="vertical" style={{ width: "100%" }}>
                      {[...byFeature.entries()].map(
                        ([feature, featurePermissions]) => {
                          const ids = featurePermissions.map((p) => p.id);
                          const allChecked = ids.every((permId) =>
                            checkedIds.includes(permId),
                          );
                          const someChecked = ids.some((permId) =>
                            checkedIds.includes(permId),
                          );
                          return (
                            <div key={feature}>
                              <Checkbox
                                checked={allChecked}
                                indeterminate={someChecked && !allChecked}
                                disabled={readOnly}
                                onChange={(e) =>
                                  toggleFeature(
                                    featurePermissions,
                                    e.target.checked,
                                  )
                                }
                              >
                                <Text strong>{feature}</Text>
                              </Checkbox>
                              <div className="pl-6">
                                <Checkbox.Group
                                  value={checkedIds}
                                  disabled={readOnly}
                                  onChange={(values) => {
                                    const outsideThisFeature =
                                      checkedIds.filter(
                                        (permId) => !ids.includes(permId),
                                      );
                                    setCheckedIds([
                                      ...outsideThisFeature,
                                      ...(values as string[]),
                                    ]);
                                  }}
                                  options={featurePermissions.map((p) => ({
                                    label: p.action,
                                    value: p.id,
                                  }))}
                                />
                              </div>
                            </div>
                          );
                        },
                      )}
                    </Space>
                  ),
                }))}
              />
            )}

            {!readOnly && (
              <div className="form-action-footer">
                <PermissionGate
                  permission={["Tenant Roles:Manage", "Roles:Manage"]}
                >
                  <Button
                    type="primary"
                    loading={isSavingPermissions}
                    onClick={onSavePermissions}
                  >
                    Save Permissions
                  </Button>
                </PermissionGate>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
