import { useEffect } from 'react';
import { Form, Input, Button, Select, Typography, Space, Tag } from 'antd';
import { useNavigate } from '@tanstack/react-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouteParams } from '@/shared/hooks/useRouteParams';
import {
  permissionFormSchema,
  type PermissionFormValues,
} from '../../models/forms/permission-form.schema';
import {
  usePermission,
  useCreatePermission,
  useUpdatePermission,
} from '../../hooks/usePermissionQueries';
import {
  PERMISSION_LABEL,
  PERMISSION_ACTION_OPTIONS,
  PERMISSION_MODULE_OPTIONS,
  PERMISSION_STATUS_OPTIONS,
} from '../../constants/label.const';
import { NAVIGATION_BUTTON_LABEL } from '@/shared/constants/navigation.const';

const { Title } = Typography;

export default function PermissionDetail() {
  const { id } = useRouteParams<{ id?: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { data: selected } = usePermission(isEdit ? id : undefined);
  const { mutateAsync: add, isPending: isCreating } = useCreatePermission();
  const { mutateAsync: update, isPending: isUpdating } = useUpdatePermission();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PermissionFormValues>({
    resolver: zodResolver(permissionFormSchema),
    defaultValues: {
      code: '',
      name: '',
      module: '',
      action: 'READ',
      description: '',
      status: 'ACTIVE',
    },
  });

  useEffect(() => {
    if (isEdit && selected) {
      reset({
        code: selected.code,
        name: selected.name,
        module: selected.module,
        action: selected.action,
        description: selected.description,
        status: selected.status,
      });
    }
  }, [selected, isEdit, reset]);

  const onSubmit = async (values: PermissionFormValues) => {
    if (isEdit && id) {
      await update({ id, ...values });
    } else {
      await add(values);
    }
    navigate({ to: '/security/permissions' });
  };

  return (
    <div className="content-page">
      <div className="page-toolbar">
        <div className="page-toolbar-row">
          <div>
            <Title level={4} className="mb-0!">
              {isEdit
                ? PERMISSION_LABEL.EDIT_TITLE
                : PERMISSION_LABEL.CREATE_TITLE}
            </Title>
            <p className="page-toolbar-subtitle">
              Configure a granular access right for a specific module and action.
            </p>
          </div>
          <Space>
            <Tag color={isEdit ? 'processing' : 'success'}>
              {isEdit ? 'Editing' : 'New Record'}
            </Tag>
            <Button onClick={() => navigate({ to: '/security/permissions' })}>
              {NAVIGATION_BUTTON_LABEL.BACK}
            </Button>
          </Space>
        </div>
      </div>

      <div className="form-page-body">
        <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
          <Form.Item
            label={PERMISSION_LABEL.CODE}
            validateStatus={errors.code ? 'error' : ''}
            help={errors.code?.message}
          >
            <Controller
              name="code"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  placeholder="e.g. DEPT_CREATE"
                  style={{ textTransform: 'uppercase' }}
                  onChange={(e) =>
                    field.onChange(e.target.value.toUpperCase())
                  }
                />
              )}
            />
          </Form.Item>

          <Form.Item
            label={PERMISSION_LABEL.NAME}
            validateStatus={errors.name ? 'error' : ''}
            help={errors.name?.message}
          >
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <Input {...field} placeholder="e.g. Create Department" />
              )}
            />
          </Form.Item>

          <Form.Item
            label={PERMISSION_LABEL.MODULE}
            validateStatus={errors.module ? 'error' : ''}
            help={errors.module?.message}
          >
            <Controller
              name="module"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  showSearch
                  placeholder="Select module"
                  optionFilterProp="label"
                  options={[...PERMISSION_MODULE_OPTIONS]}
                />
              )}
            />
          </Form.Item>

          <Form.Item
            label={PERMISSION_LABEL.ACTION}
            validateStatus={errors.action ? 'error' : ''}
            help={errors.action?.message}
          >
            <Controller
              name="action"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  placeholder="Select action"
                  options={[...PERMISSION_ACTION_OPTIONS]}
                />
              )}
            />
          </Form.Item>

          <Form.Item
            label={PERMISSION_LABEL.DESCRIPTION}
            validateStatus={errors.description ? 'error' : ''}
            help={errors.description?.message}
          >
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <Input.TextArea
                  {...field}
                  rows={3}
                  placeholder="Describe what this permission allows"
                />
              )}
            />
          </Form.Item>

          <Form.Item
            label={PERMISSION_LABEL.STATUS}
            validateStatus={errors.status ? 'error' : ''}
            help={errors.status?.message}
          >
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  options={PERMISSION_STATUS_OPTIONS}
                  placeholder="Select status"
                />
              )}
            />
          </Form.Item>

          <div className="form-action-footer">
            <Space className="form-action-footer-row">
              <Button
                onClick={() => navigate({ to: '/security/permissions' })}
              >
                {NAVIGATION_BUTTON_LABEL.BACK}
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={isCreating || isUpdating}
              >
                {NAVIGATION_BUTTON_LABEL.SAVE}
              </Button>
            </Space>
          </div>
        </Form>
      </div>
    </div>
  );
}
