import { useEffect } from "react";
import { Form, Button, DatePicker, Typography, Card, Space, Tag } from "antd";
import { useNavigate } from "@tanstack/react-router";
import { useRouteParams } from "@/shared/hooks/use-route-params";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import dayjs from "dayjs";
import {
  changeRestDayFormSchema,
  type ChangeRestDayFormValues,
} from "../../models/forms/change-rest-day-form.schema";
import {
  useChangeRestDay,
  useCreateChangeRestDay,
  useUpdateChangeRestDay,
} from "../../hooks/use-change-rest-day-queries";
import { changeRestDayMapper } from "../../services/change-rest-day.mapper";
import { CHANGE_REST_DAY_LABEL } from "../../constants/label.const";
import { NAVIGATION_BUTTON_LABEL } from "@/shared/constants/navigation.const";

const { Title } = Typography;

export default function ChangeRestDayDetail() {
  const { id } = useRouteParams<{ id?: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const { data: selected } = useChangeRestDay(isEdit ? id : undefined);
  const { mutateAsync: add, isPending: isCreating } = useCreateChangeRestDay();
  const { mutateAsync: update, isPending: isUpdating } =
    useUpdateChangeRestDay();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChangeRestDayFormValues>({
    resolver: zodResolver(changeRestDayFormSchema),
  });

  useEffect(() => {
    if (isEdit && selected) {
      reset(changeRestDayMapper.toFormValues(selected));
    }
  }, [selected, isEdit, reset]);

  const onSubmit = async (values: ChangeRestDayFormValues) => {
    if (isEdit && id) {
      await update({ id, ...values });
    } else {
      await add(values);
    }
    navigate({ to: "/change-schedule/change-rest-day" });
  };

  const isSubmitting = isCreating || isUpdating;

  return (
    <div className="content-page">
      <div className="page-toolbar">
        <div className="page-toolbar-row">
          <div>
            <Title level={4} className="mb-0!">
              {isEdit
                ? CHANGE_REST_DAY_LABEL.EDIT_TITLE
                : CHANGE_REST_DAY_LABEL.CREATE_TITLE}
            </Title>
            <p className="page-toolbar-subtitle">
              Set the rest day date range for the selected record.
            </p>
          </div>
          <Space>
            <Tag color={isEdit ? "processing" : "success"}>
              {isEdit ? "Editing" : "New Record"}
            </Tag>
            <Button
              onClick={() =>
                navigate({ to: "/change-schedule/change-rest-day" })
              }
            >
              {NAVIGATION_BUTTON_LABEL.BACK}
            </Button>
          </Space>
        </div>
      </div>

      <div className="form-page-body">
        <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
          <Card className="form-section-card" title="Rest Day Details">
            <div className="form-grid-2">
              <Form.Item
                label={CHANGE_REST_DAY_LABEL.FROM_DATE}
                validateStatus={errors.fromDate ? "error" : ""}
                help={errors.fromDate?.message}
              >
                <Controller
                  name="fromDate"
                  control={control}
                  render={({ field }) => (
                    <DatePicker
                      style={{ width: "100%" }}
                      value={field.value ? dayjs(field.value) : null}
                      onChange={(date) =>
                        field.onChange(date?.format("YYYY-MM-DD") ?? "")
                      }
                    />
                  )}
                />
              </Form.Item>
              <Form.Item
                label={CHANGE_REST_DAY_LABEL.TO_DATE}
                validateStatus={errors.toDate ? "error" : ""}
                help={errors.toDate?.message}
              >
                <Controller
                  name="toDate"
                  control={control}
                  render={({ field }) => (
                    <DatePicker
                      style={{ width: "100%" }}
                      value={field.value ? dayjs(field.value) : null}
                      onChange={(date) =>
                        field.onChange(date?.format("YYYY-MM-DD") ?? "")
                      }
                    />
                  )}
                />
              </Form.Item>
            </div>
          </Card>

          <div className="form-actions">
            <Button
              type="primary"
              htmlType="submit"
              loading={isSubmitting}
              disabled={isSubmitting}
            >
              {isEdit ? "Update" : "Create"}
            </Button>
            <Button
              onClick={() =>
                navigate({ to: "/change-schedule/change-rest-day" })
              }
            >
              {NAVIGATION_BUTTON_LABEL.CANCEL}
            </Button>
          </div>
        </Form>
      </div>
    </div>
  );
}
