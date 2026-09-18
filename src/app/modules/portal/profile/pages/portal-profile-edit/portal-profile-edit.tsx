import { useEffect } from "react";
import {
  Button,
  Card,
  DatePicker,
  Empty,
  Form,
  Input,
  Select,
  Skeleton,
  Space,
  Typography,
  message,
} from "antd";
import { useNavigate } from "@tanstack/react-router";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import dayjs from "dayjs";
import {
  useCreateMyProfileUpdateRequest,
  useMyEmployee,
} from "../../../shared/hooks/use-my-employee-queries";
import {
  portalProfileEditFormSchema,
  type PortalProfileEditFormValues,
} from "../../models/forms/portal-profile-edit-form.schema";
import { NAVIGATION_BUTTON_LABEL } from "@/shared/constants/navigation.const";
import {
  BLOOD_TYPE_OPTIONS,
  CIVIL_STATUS_OPTIONS,
} from "@/app/modules/setup/employee/constants/label.const";

const { Title } = Typography;
const { TextArea } = Input;

export default function PortalProfileEdit() {
  const navigate = useNavigate();
  const { data: employee, isLoading } = useMyEmployee();
  const { mutateAsync: create, isPending } = useCreateMyProfileUpdateRequest();

  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<PortalProfileEditFormValues>({
    resolver: zodResolver(portalProfileEditFormSchema),
    defaultValues: {
      contact: "",
      address1: "",
      address2: "",
      civilStatus: "",
      dob: "",
      bloodType: "",
      remarks: "",
    },
  });

  useEffect(() => {
    if (employee) {
      reset({
        contact: employee.contact ?? "",
        address1: employee.address1 ?? "",
        address2: employee.address2 ?? "",
        civilStatus: employee.civilStatus ?? "",
        dob: employee.dob ?? "",
        bloodType: employee.bloodType ?? "",
        remarks: "",
      });
    }
  }, [employee, reset]);

  // eslint-disable-next-line react-hooks/incompatible-library
  const dob = watch("dob");

  const backTo = () => navigate({ to: "/portal/profile" });

  const onSubmit = async (values: PortalProfileEditFormValues) => {
    try {
      await create({
        newContact: values.contact || undefined,
        newAddress1: values.address1 || undefined,
        newAddress2: values.address2 || undefined,
        newCivilStatus: values.civilStatus || undefined,
        newDOB: values.dob || undefined,
        newBloodType: values.bloodType || undefined,
        remarks: values.remarks || undefined,
      });
      message.success(
        "Your changes were submitted for approval and will take effect once approved.",
      );
      backTo();
    } catch {
      message.error("Failed to submit your request. Please try again.");
    }
  };

  return (
    <div className="content-page">
      <div className="page-toolbar">
        <div className="page-toolbar-row">
          <div>
            <Title level={4} className="mb-0!">
              Edit My Profile
            </Title>
            <p className="page-toolbar-subtitle">
              Changes here go to your HR/admin for approval before they take
              effect on your record.
            </p>
          </div>
          <Button onClick={backTo}>{NAVIGATION_BUTTON_LABEL.BACK}</Button>
        </div>
      </div>

      <div className="form-page-body">
        {isLoading ? (
          <Skeleton active paragraph={{ rows: 6 }} />
        ) : !employee ? (
          <Empty description="No employee profile is linked to your account yet. Contact HR if you believe this is a mistake." />
        ) : (
          <Card>
            <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
              <div className="form-grid-2">
                <Form.Item label="Contact No.">
                  <Controller
                    name="contact"
                    control={control}
                    render={({ field }) => <Input {...field} />}
                  />
                </Form.Item>

                <Form.Item label="Civil Status">
                  <Controller
                    name="civilStatus"
                    control={control}
                    render={({ field }) => (
                      <Select
                        {...field}
                        allowClear
                        options={CIVIL_STATUS_OPTIONS}
                        value={field.value || undefined}
                      />
                    )}
                  />
                </Form.Item>

                <Form.Item label="Date of Birth">
                  <DatePicker
                    className="w-full"
                    value={dob ? dayjs(dob) : null}
                    onChange={(date) =>
                      setValue("dob", date?.format("YYYY-MM-DD") ?? "")
                    }
                  />
                </Form.Item>

                <Form.Item label="Blood Type">
                  <Controller
                    name="bloodType"
                    control={control}
                    render={({ field }) => (
                      <Select
                        {...field}
                        allowClear
                        options={BLOOD_TYPE_OPTIONS}
                        value={field.value || undefined}
                      />
                    )}
                  />
                </Form.Item>
              </div>

              <Form.Item label="Address Line 1">
                <Controller
                  name="address1"
                  control={control}
                  render={({ field }) => <Input {...field} />}
                />
              </Form.Item>

              <Form.Item label="Address Line 2">
                <Controller
                  name="address2"
                  control={control}
                  render={({ field }) => <Input {...field} />}
                />
              </Form.Item>

              <Form.Item
                label="Remarks (optional)"
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
                      placeholder="Why are you requesting this change?"
                    />
                  )}
                />
              </Form.Item>

              <div className="form-action-footer">
                <Space className="form-action-footer-row">
                  <Button onClick={backTo}>
                    {NAVIGATION_BUTTON_LABEL.CANCEL}
                  </Button>
                  <Button type="primary" htmlType="submit" loading={isPending}>
                    Submit for Approval
                  </Button>
                </Space>
              </div>
            </Form>
          </Card>
        )}
      </div>
    </div>
  );
}
