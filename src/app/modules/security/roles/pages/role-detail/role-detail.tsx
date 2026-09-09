import { useEffect, useState } from "react";
import {
  Form,
  Input,
  Button,
  Typography,
  Space,
  Tag,
  Card,
  message,
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
import RolePermissionMatrix from "../../components/role-permission-matrix";
import { ROLE_LABEL } from "../../constants/label.const";
import { NAVIGATION_BUTTON_LABEL } from "@/shared/constants/navigation.const";

const { Title } = Typography;

export default function RoleDetail() {
  const { id } = useRouteParams<{ id?: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { data: selected } = useRole(isEdit ? id : undefined);
  const { data: permissions = [], isLoading: permissionsLoading } =
    usePermissions();
  const { mutateAsync: add, isPending: isCreating } = useCreateRole();
  const { mutateAsync: update, isPending: isUpdating } = useUpdateRole();
  const { mutateAsync: setPermissions, isPending: isSavingPermissions } =
    useSetRolePermissions();

  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set());
  const [permissionsInitialized, setPermissionsInitialized] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RoleFormValues>({
    resolver: zodResolver(roleFormSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  useEffect(() => {
    if (isEdit && selected) {
      reset({
        name: selected.name,
        description: selected.description,
      });
    }
  }, [selected, isEdit, reset]);

  if (isEdit && selected && !permissionsInitialized) {
    setCheckedIds(new Set(selected.permissions.map((p) => p.id)));
    setPermissionsInitialized(true);
  }

  const onSubmit = async (values: RoleFormValues) => {
    if (isEdit && id) {
      await update({
        id,
        name: values.name,
        description: values.description ?? "",
      });
      message.success("Role saved.");
    } else {
      const created = await add({
        name: values.name,
        description: values.description ?? "",
      });
      navigate({ to: `/security/roles/${created.id}` });
    }
  };

  const handleSavePermissions = async () => {
    if (!id) return;
    await setPermissions({ roleId: id, permissionIds: Array.from(checkedIds) });
    message.success("Permissions saved.");
  };

  return (
    <div className="content-page">
      <div className="page-toolbar">
        <div className="page-toolbar-row">
          <div>
            <Title level={4} className="mb-0!">
              {isEdit ? ROLE_LABEL.EDIT_TITLE : ROLE_LABEL.CREATE_TITLE}
            </Title>
            <p className="page-toolbar-subtitle">
              Configure role name and the permissions it grants.
            </p>
          </div>
          <Space>
            <Tag color={isEdit ? "processing" : "success"}>
              {isEdit ? "Editing" : "New Record"}
            </Tag>
            <Button onClick={() => navigate({ to: "/security/roles" })}>
              {NAVIGATION_BUTTON_LABEL.BACK}
            </Button>
          </Space>
        </div>
      </div>

      <div className="form-page-body">
        <Card className="mb-4">
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
                  render={({ field }) => <Input {...field} />}
                />
              </Form.Item>

              <Form.Item label={ROLE_LABEL.DESCRIPTION}>
                <Controller
                  name="description"
                  control={control}
                  render={({ field }) => <Input {...field} />}
                />
              </Form.Item>
            </div>

            <div className="form-action-footer">
              <Space className="form-action-footer-row">
                <Button onClick={() => navigate({ to: "/security/roles" })}>
                  {NAVIGATION_BUTTON_LABEL.BACK}
                </Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={isUpdating || isCreating}
                >
                  {NAVIGATION_BUTTON_LABEL.SAVE}
                </Button>
              </Space>
            </div>
          </Form>
        </Card>

        {isEdit && (
          <Card
            title={ROLE_LABEL.PERMISSIONS}
            extra={
              <Button
                type="primary"
                loading={isSavingPermissions}
                onClick={handleSavePermissions}
              >
                Save Permissions
              </Button>
            }
          >
            <RolePermissionMatrix
              permissions={permissions}
              loading={permissionsLoading}
              checkedIds={checkedIds}
              onChange={setCheckedIds}
            />
          </Card>
        )}
      </div>
    </div>
  );
}
