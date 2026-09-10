import {
  Button,
  Card,
  DatePicker,
  Empty,
  Form,
  Input,
  Skeleton,
  Space,
  TimePicker,
  Typography,
} from "antd";
import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "@tanstack/react-router";
import dayjs from "dayjs";
import {
  useMyEmployee,
  useCreateMyPassSlipApplication,
} from "../../../shared/hooks/use-my-employee-queries";
import {
  portalPassSlipFormSchema,
  type PortalPassSlipFormValues,
} from "../../models/forms/portal-pass-slip-form.schema";
import { buildStartDateTime } from "@/shared/utils/duration.util";

const { Title } = Typography;
const { TextArea } = Input;

export default function PortalPassSlipCreate() {
  const navigate = useNavigate();
  const { data: employee, isLoading: employeeLoading } = useMyEmployee();
  const { mutateAsync: create, isPending } = useCreateMyPassSlipApplication();

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<PortalPassSlipFormValues>({
    resolver: zodResolver(portalPassSlipFormSchema),
    defaultValues: {
      employeeId: employee?.id ?? "",
      applicationDate: "",
      departureTime: "",
      returnTime: "",
      destination: "",
      purpose: "",
      remarks: "",
    },
  });

  // employeeId isn't a visible field here -- useMyEmployee() resolves after this form's
  // defaultValues are already fixed at first render, so without this it stays "" forever and
  // blocks submission with no visible error.
  useEffect(() => {
    if (employee) setValue("employeeId", employee.id);
  }, [employee, setValue]);

  const onSubmit = async (values: PortalPassSlipFormValues) => {
    await create({
      employeeId: employee!.id,
      applicationDate: values.applicationDate,
      departureTime: buildStartDateTime(
        values.applicationDate,
        values.departureTime,
      ),
      returnTime: values.returnTime
        ? buildStartDateTime(values.applicationDate, values.returnTime)
        : null,
      destination: values.destination,
      purpose: values.purpose,
      remarks: values.remarks,
    });
    navigate({ to: "/portal/pass-slip" });
  };

  return (
    <div className="content-page">
      <div className="page-toolbar">
        <div className="page-toolbar-row">
          <div>
            <Title level={4} className="mb-0!">
              File Pass Slip
            </Title>
            <p className="page-toolbar-subtitle">
              Submit a pass slip request for approval.
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
                label="Date"
                validateStatus={errors.applicationDate ? "error" : ""}
                help={errors.applicationDate?.message}
              >
                <Controller
                  name="applicationDate"
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

              <Space size="large" wrap align="start">
                <Form.Item
                  label="Departure Time"
                  validateStatus={errors.departureTime ? "error" : ""}
                  help={errors.departureTime?.message}
                >
                  <Controller
                    name="departureTime"
                    control={control}
                    render={({ field }) => (
                      <TimePicker
                        value={field.value ? dayjs(field.value, "HH:mm") : null}
                        format="HH:mm"
                        onChange={(t) =>
                          field.onChange(t ? t.format("HH:mm") : "")
                        }
                      />
                    )}
                  />
                </Form.Item>
                <Form.Item label="Return Time (optional)">
                  <Controller
                    name="returnTime"
                    control={control}
                    render={({ field }) => (
                      <TimePicker
                        value={field.value ? dayjs(field.value, "HH:mm") : null}
                        format="HH:mm"
                        onChange={(t) =>
                          field.onChange(t ? t.format("HH:mm") : "")
                        }
                      />
                    )}
                  />
                </Form.Item>
              </Space>

              <Form.Item
                label="Destination"
                validateStatus={errors.destination ? "error" : ""}
                help={errors.destination?.message}
              >
                <Controller
                  name="destination"
                  control={control}
                  render={({ field }) => (
                    <Input {...field} placeholder="Where are you going?" />
                  )}
                />
              </Form.Item>

              <Form.Item
                label="Purpose"
                validateStatus={errors.purpose ? "error" : ""}
                help={errors.purpose?.message}
              >
                <Controller
                  name="purpose"
                  control={control}
                  render={({ field }) => (
                    <Input {...field} placeholder="What's this for?" />
                  )}
                />
              </Form.Item>

              <Form.Item
                label="Remarks"
                validateStatus={errors.remarks ? "error" : ""}
                help={errors.remarks?.message}
              >
                <Controller
                  name="remarks"
                  control={control}
                  render={({ field }) => (
                    <TextArea
                      {...field}
                      rows={2}
                      placeholder="Additional details"
                    />
                  )}
                />
              </Form.Item>

              <Space>
                <Button type="primary" htmlType="submit" loading={isPending}>
                  Submit Application
                </Button>
                <Button onClick={() => navigate({ to: "/portal/pass-slip" })}>
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
