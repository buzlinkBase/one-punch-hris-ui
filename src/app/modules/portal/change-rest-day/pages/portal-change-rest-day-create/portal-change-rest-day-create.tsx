import {
  Button,
  Card,
  DatePicker,
  Empty,
  Form,
  Skeleton,
  Space,
  Typography,
  message,
} from "antd";
import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "@tanstack/react-router";
import dayjs from "dayjs";
import {
  useMyEmployee,
  useCreateMyChangeRestDayRequest,
} from "../../../shared/hooks/use-my-employee-queries";
import {
  portalChangeRestDayFormSchema,
  type PortalChangeRestDayFormValues,
} from "../../models/forms/portal-change-rest-day-form.schema";

const { Title } = Typography;

export default function PortalChangeRestDayCreate() {
  const navigate = useNavigate();
  const { data: employee, isLoading: employeeLoading } = useMyEmployee();
  const { mutateAsync: create, isPending } = useCreateMyChangeRestDayRequest();

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<PortalChangeRestDayFormValues>({
    resolver: zodResolver(portalChangeRestDayFormSchema),
    defaultValues: {
      employeeId: employee?.id ?? "",
      fromDate: "",
      newDate: "",
    },
  });

  // employeeId isn't a visible field here -- useMyEmployee() resolves after this form's
  // defaultValues are already fixed at first render, so without this it stays "" forever and
  // blocks submission with no visible error.
  useEffect(() => {
    if (employee) setValue("employeeId", employee.id);
  }, [employee, setValue]);

  const onSubmit = async (values: PortalChangeRestDayFormValues) => {
    if (dayjs(values.newDate).isSame(dayjs(values.fromDate), "day")) {
      message.error(
        "Your new rest day cannot be the same as your current rest day.",
      );
      return;
    }

    await create({
      fromDay: dayjs(values.fromDate).day(),
      toDay: dayjs(values.newDate).day(),
      payrollDateFrom: values.fromDate,
      payrollDateTo: values.newDate,
    });
    navigate({ to: "/portal/change-rest-day" });
  };

  return (
    <div className="content-page">
      <div className="page-toolbar">
        <div className="page-toolbar-row">
          <div>
            <Title level={4} className="mb-0!">
              Request Change Rest Day
            </Title>
            <p className="page-toolbar-subtitle">
              Submit a rest day change request for approval.
            </p>
          </div>
        </div>
      </div>

      <div className="form-page-body">
        {employeeLoading ? (
          <Skeleton active paragraph={{ rows: 6 }} />
        ) : !employee ? (
          <Empty description="No employee profile is linked to your account yet. Contact HR if you believe this is a mistake." />
        ) : (
          <Card>
            <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
              <Form.Item
                label="Current Rest Day"
                validateStatus={errors.fromDate ? "error" : ""}
                help={errors.fromDate?.message}
              >
                <Controller
                  name="fromDate"
                  control={control}
                  render={({ field }) => (
                    <DatePicker
                      value={field.value ? dayjs(field.value) : null}
                      onChange={(d) =>
                        field.onChange(d ? d.format("YYYY-MM-DD") : "")
                      }
                    />
                  )}
                />
              </Form.Item>

              <Form.Item
                label="New Rest Day"
                validateStatus={errors.newDate ? "error" : ""}
                help={errors.newDate?.message}
              >
                <Controller
                  name="newDate"
                  control={control}
                  render={({ field }) => (
                    <DatePicker
                      value={field.value ? dayjs(field.value) : null}
                      onChange={(d) =>
                        field.onChange(d ? d.format("YYYY-MM-DD") : "")
                      }
                    />
                  )}
                />
              </Form.Item>

              <Space>
                <Button type="primary" htmlType="submit" loading={isPending}>
                  Submit Request
                </Button>
                <Button
                  onClick={() => navigate({ to: "/portal/change-rest-day" })}
                >
                  Cancel
                </Button>
              </Space>
            </Form>
          </Card>
        )}
      </div>
    </div>
  );
}
