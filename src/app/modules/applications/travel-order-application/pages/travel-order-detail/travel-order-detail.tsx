import { useEffect } from "react";
import {
  Form,
  Input,
  InputNumber,
  Button,
  Select,
  DatePicker,
  Typography,
  Space,
  Tag,
  Card,
  Descriptions,
} from "antd";
import { useNavigate } from "@tanstack/react-router";
import { useRouteParams } from "@/shared/hooks/use-route-params";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import dayjs from "dayjs";
import {
  travelOrderFormSchema,
  type TravelOrderFormValues,
} from "../../models/forms/travel-order-application-form.schema";
import {
  useTravelOrder,
  useCreateTravelOrder,
  useUpdateTravelOrder,
} from "../../hooks/use-travel-order-queries";
import { useEmployeeFilter } from "@/app/modules/timekeeping/attendance-entry/hooks/use-attendance-entry-queries";
import {
  TRAVEL_ORDER_LABEL,
  TRAVEL_CLASSIFICATION_OPTIONS,
} from "../../constants/label.const";
import { NAVIGATION_BUTTON_LABEL } from "@/shared/constants/navigation.const";

const { Title } = Typography;
const { TextArea } = Input;

const DAY_TYPE_OPTIONS = [
  { value: "WholeDay", label: "Whole Day" },
  { value: "HalfDay", label: "Half Day" },
];

const APPROVAL_STATUS_OPTIONS = [
  { value: "ForApproval", label: "For Approval" },
  { value: "Approved", label: "Approved" },
  { value: "Declined", label: "Declined" },
  { value: "Cancelled", label: "Cancelled" },
];

const STATUS_COLOR: Record<string, string> = {
  ForApproval: "warning",
  Approved: "success",
  Declined: "error",
  Cancelled: "default",
};

const filterOption = (
  input: string,
  option?: { label?: string | number | boolean },
) =>
  String(option?.label ?? "")
    .toLowerCase()
    .includes(input.toLowerCase());

export default function TravelOrderDetail() {
  const { id } = useRouteParams<{ id?: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const { data: selected } = useTravelOrder(isEdit ? id : undefined);
  const { mutateAsync: add, isPending: isCreating } = useCreateTravelOrder();
  const { mutateAsync: update, isPending: isUpdating } = useUpdateTravelOrder();
  const { data: employees = [] } = useEmployeeFilter();

  const employeeOptions = employees.map((e) => ({
    value: e.id,
    label: e.name ?? e.id,
  }));

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<TravelOrderFormValues>({
    resolver: zodResolver(travelOrderFormSchema),
    defaultValues: {
      employeeId: "",
      startDate: "",
      endDate: "",
      travelDayType: "WholeDay",
      destination: "",
      classification: "",
      purpose: "",
      cost: 0,
      applicationRemarks: "",
    },
  });

  // eslint-disable-next-line react-hooks/incompatible-library
  const startDate = watch("startDate");
  const endDate = watch("endDate");

  useEffect(() => {
    if (isEdit && selected) {
      reset({
        employeeId: selected.employeeId,
        startDate: selected.startDate,
        endDate: selected.endDate,
        travelDayType: selected.travelDayType,
        destination: selected.destination,
        classification: selected.classification,
        purpose: selected.purpose,
        cost: selected.cost,
        applicationRemarks: selected.applicationRemarks ?? "",
      });
    }
  }, [selected, isEdit, reset]);

  const onSubmit = async (values: TravelOrderFormValues) => {
    if (isEdit && id) {
      await update({
        id,
        approvalStatus: selected?.approvalStatus ?? "ForApproval",
        ...values,
      });
    } else {
      await add(values);
    }
    navigate({ to: "/applications/official-business" });
  };

  return (
    <div className="content-page">
      <div className="page-toolbar">
        <div className="page-toolbar-row">
          <div>
            <Title level={4} className="mb-0!">
              {isEdit
                ? TRAVEL_ORDER_LABEL.EDIT_TITLE
                : TRAVEL_ORDER_LABEL.CREATE_TITLE}
            </Title>
            <p className="page-toolbar-subtitle">
              File an official business or travel order request for approval.
            </p>
          </div>
          <Space>
            {isEdit && selected ? (
              <Tag color={STATUS_COLOR[selected.approvalStatus] ?? "default"}>
                {selected.approvalStatus === "ForApproval"
                  ? "For Approval"
                  : selected.approvalStatus}
              </Tag>
            ) : (
              <Tag color="success">New Record</Tag>
            )}
            <Button
              onClick={() =>
                navigate({ to: "/applications/official-business" })
              }
            >
              {NAVIGATION_BUTTON_LABEL.BACK}
            </Button>
          </Space>
        </div>
      </div>

      <div className="form-page-body">
        {isEdit && selected && (
          <Card size="small" className="mb-4">
            <Descriptions size="small" column={3}>
              <Descriptions.Item label={TRAVEL_ORDER_LABEL.STATUS}>
                <Tag color={STATUS_COLOR[selected.approvalStatus] ?? "default"}>
                  {selected.approvalStatus === "ForApproval"
                    ? "For Approval"
                    : selected.approvalStatus}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label={TRAVEL_ORDER_LABEL.DAYS}>
                {selected.days != null
                  ? `${selected.days} day${selected.days !== 1 ? "s" : ""}`
                  : "-"}
              </Descriptions.Item>
              {selected.reference && (
                <Descriptions.Item label={TRAVEL_ORDER_LABEL.REFERENCE}>
                  {selected.reference}
                </Descriptions.Item>
              )}
            </Descriptions>
          </Card>
        )}

        <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-2 gap-x-6">
            <Form.Item
              label={TRAVEL_ORDER_LABEL.EMPLOYEE}
              validateStatus={errors.employeeId ? "error" : ""}
              help={errors.employeeId?.message}
            >
              <Controller
                name="employeeId"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    showSearch
                    placeholder="Select employee"
                    options={employeeOptions}
                    filterOption={filterOption}
                    value={field.value || undefined}
                  />
                )}
              />
            </Form.Item>

            <Form.Item
              label={TRAVEL_ORDER_LABEL.TRAVEL_DAY_TYPE}
              validateStatus={errors.travelDayType ? "error" : ""}
              help={errors.travelDayType?.message}
            >
              <Controller
                name="travelDayType"
                control={control}
                render={({ field }) => (
                  <Select {...field} options={DAY_TYPE_OPTIONS} />
                )}
              />
            </Form.Item>
          </div>

          <div className="grid grid-cols-2 gap-x-6">
            <Form.Item
              label={TRAVEL_ORDER_LABEL.START_DATE}
              validateStatus={errors.startDate ? "error" : ""}
              help={errors.startDate?.message}
            >
              <DatePicker
                style={{ width: "100%" }}
                value={startDate ? dayjs(startDate) : null}
                onChange={(date) =>
                  setValue("startDate", date?.format("YYYY-MM-DD") ?? "")
                }
              />
            </Form.Item>

            <Form.Item
              label={TRAVEL_ORDER_LABEL.END_DATE}
              validateStatus={errors.endDate ? "error" : ""}
              help={errors.endDate?.message}
            >
              <DatePicker
                style={{ width: "100%" }}
                value={endDate ? dayjs(endDate) : null}
                disabledDate={(d) =>
                  startDate ? d.isBefore(dayjs(startDate)) : false
                }
                onChange={(date) =>
                  setValue("endDate", date?.format("YYYY-MM-DD") ?? "")
                }
              />
            </Form.Item>
          </div>

          <div className="grid grid-cols-2 gap-x-6">
            <Form.Item
              label={TRAVEL_ORDER_LABEL.DESTINATION}
              validateStatus={errors.destination ? "error" : ""}
              help={errors.destination?.message}
            >
              <Controller
                name="destination"
                control={control}
                render={({ field }) => (
                  <Input {...field} placeholder="City, Province or Address" />
                )}
              />
            </Form.Item>

            <Form.Item
              label={TRAVEL_ORDER_LABEL.CLASSIFICATION}
              validateStatus={errors.classification ? "error" : ""}
              help={errors.classification?.message}
            >
              <Controller
                name="classification"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    placeholder="Select classification"
                    options={TRAVEL_CLASSIFICATION_OPTIONS}
                    value={field.value || undefined}
                  />
                )}
              />
            </Form.Item>
          </div>

          <div className="grid grid-cols-3 gap-x-6">
            <Form.Item
              label={TRAVEL_ORDER_LABEL.PURPOSE}
              className="col-span-2"
              validateStatus={errors.purpose ? "error" : ""}
              help={errors.purpose?.message}
            >
              <Controller
                name="purpose"
                control={control}
                render={({ field }) => (
                  <TextArea
                    {...field}
                    rows={3}
                    placeholder="Describe the purpose of this official business"
                  />
                )}
              />
            </Form.Item>

            <Form.Item
              label={TRAVEL_ORDER_LABEL.COST}
              validateStatus={errors.cost ? "error" : ""}
              help={errors.cost?.message}
            >
              <Controller
                name="cost"
                control={control}
                render={({ field }) => (
                  <InputNumber
                    {...field}
                    style={{ width: "100%" }}
                    min={0}
                    precision={2}
                    prefix="₱"
                    placeholder="0.00"
                  />
                )}
              />
            </Form.Item>
          </div>

          {isEdit && selected && (
            <Form.Item label={TRAVEL_ORDER_LABEL.STATUS}>
              <Select
                disabled
                value={selected.approvalStatus}
                options={APPROVAL_STATUS_OPTIONS}
              />
            </Form.Item>
          )}

          <Form.Item
            label={TRAVEL_ORDER_LABEL.REMARKS}
            validateStatus={errors.applicationRemarks ? "error" : ""}
            help={errors.applicationRemarks?.message}
          >
            <Controller
              name="applicationRemarks"
              control={control}
              render={({ field }) => (
                <TextArea
                  {...field}
                  rows={2}
                  placeholder="Additional notes or instructions"
                />
              )}
            />
          </Form.Item>

          <div className="form-action-footer">
            <Space className="form-action-footer-row">
              <Button
                onClick={() =>
                  navigate({ to: "/applications/official-business" })
                }
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
