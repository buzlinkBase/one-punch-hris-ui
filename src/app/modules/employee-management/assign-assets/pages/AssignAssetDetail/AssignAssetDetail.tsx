import { useEffect, useState } from "react";
import {
  Form,
  Input,
  Button,
  Select,
  Typography,
  Space,
  Tag,
  InputNumber,
  DatePicker,
  Upload,
  message,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import type { UploadFile, UploadProps } from "antd";
import dayjs from "dayjs";
import { useNavigate } from "@tanstack/react-router";
import { useRouteParams } from "@/shared/hooks/useRouteParams";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  assignAssetFormSchema,
  type AssignAssetFormValues,
} from "../../models/forms/assign-asset-form.schema";
import {
  useAssignAsset,
  useCreateAssignAsset,
  useUpdateAssignAsset,
} from "../../hooks/useAssignAssetQueries";
import { useEmployees } from "@/app/modules/setup/employee/hooks/useEmployeeQueries";
import {
  ASSIGN_ASSET_LABEL,
  ASSET_TYPE_OPTIONS,
} from "../../constants/label.const";
import { NAVIGATION_BUTTON_LABEL } from "@/shared/constants/navigation.const";

const { Title } = Typography;

export default function AssignAssetDetail() {
  const { id } = useRouteParams<{ id?: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { data: selected } = useAssignAsset(isEdit ? id : undefined);
  const { data: employees = [] } = useEmployees();
  const { mutateAsync: add, isPending: isCreating } = useCreateAssignAsset();
  const { mutateAsync: update, isPending: isUpdating } = useUpdateAssignAsset();

  const [fileList, setFileList] = useState<UploadFile[]>([]);

  const employeeOptions = employees.map((e) => ({
    value: e.id,
    label: `${e.firstName} ${e.lastName} (${e.employeeNo})`,
  }));

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<AssignAssetFormValues>({
    resolver: zodResolver(assignAssetFormSchema),
    defaultValues: {
      employeeId: "",
      assetType: "",
      assetDescription: "",
      model: "",
      brand: "",
      serialNo: "",
      qty: 1,
      issuanceDate: "",
      returnedDate: null,
      remarks: "",
      file: "",
    },
  });

  useEffect(() => {
    if (isEdit && selected) {
      reset({
        employeeId: selected.employeeId,
        assetType: selected.assetType,
        assetDescription: selected.assetDescription,
        model: selected.model,
        brand: selected.brand,
        serialNo: selected.serialNo,
        qty: selected.qty,
        issuanceDate: selected.issuanceDate,
        returnedDate: selected.returnedDate,
        remarks: selected.remarks,
        file: selected.file,
      });
      if (selected.file) {
        setFileList([
          {
            uid: "-1",
            name: selected.file.split("/").pop() ?? "attachment",
            status: "done",
            url: selected.file,
          },
        ]);
      }
    }
  }, [selected, isEdit, reset]);

  const uploadProps: UploadProps = {
    beforeUpload: (file) => {
      const isAllowed =
        file.type === "application/pdf" ||
        file.type.startsWith("image/");
      if (!isAllowed) {
        message.error("Only PDF or image files are allowed.");
        return Upload.LIST_IGNORE;
      }
      const url = URL.createObjectURL(file);
      setValue("file", url);
      setFileList([{ uid: file.uid, name: file.name, status: "done", url }]);
      return false;
    },
    fileList,
    onRemove: () => {
      setFileList([]);
      setValue("file", "");
    },
    maxCount: 1,
  };

  const onSubmit = async (values: AssignAssetFormValues) => {
    const payload = {
      ...values,
      returnedDate: values.returnedDate ?? null,
      remarks: values.remarks ?? "",
      file: values.file ?? "",
    };
    if (isEdit && id) {
      await update({ id, ...payload });
    } else {
      await add(payload);
    }
    navigate({ to: "/employee-management/assign-assets" });
  };

  return (
    <div className="content-page">
      <div className="page-toolbar">
        <div className="page-toolbar-row">
          <div>
            <Title level={4} className="mb-0!">
              {isEdit
                ? ASSIGN_ASSET_LABEL.EDIT_TITLE
                : ASSIGN_ASSET_LABEL.CREATE_TITLE}
            </Title>
            <p className="page-toolbar-subtitle">
              Record company assets issued to an employee.
            </p>
          </div>
          <Space>
            <Tag color={isEdit ? "processing" : "success"}>
              {isEdit ? "Editing" : "New Record"}
            </Tag>
            <Button
              onClick={() =>
                navigate({ to: "/employee-management/assign-assets" })
              }
            >
              {NAVIGATION_BUTTON_LABEL.BACK}
            </Button>
          </Space>
        </div>
      </div>

      <div className="form-page-body">
        <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
          {/* Employee */}
          <Form.Item
            label={ASSIGN_ASSET_LABEL.EMPLOYEE}
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
                  optionFilterProp="label"
                  options={employeeOptions}
                  placeholder="Select employee"
                />
              )}
            />
          </Form.Item>

          {/* Asset Type */}
          <Form.Item
            label={ASSIGN_ASSET_LABEL.ASSET_TYPE}
            validateStatus={errors.assetType ? "error" : ""}
            help={errors.assetType?.message}
          >
            <Controller
              name="assetType"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  options={ASSET_TYPE_OPTIONS}
                  placeholder="Select asset type"
                />
              )}
            />
          </Form.Item>

          {/* Asset Description */}
          <Form.Item
            label={ASSIGN_ASSET_LABEL.ASSET_DESCRIPTION}
            validateStatus={errors.assetDescription ? "error" : ""}
            help={errors.assetDescription?.message}
          >
            <Controller
              name="assetDescription"
              control={control}
              render={({ field }) => (
                <Input.TextArea {...field} rows={2} />
              )}
            />
          </Form.Item>

          {/* Brand & Model side by side */}
          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              label={ASSIGN_ASSET_LABEL.BRAND}
              validateStatus={errors.brand ? "error" : ""}
              help={errors.brand?.message}
            >
              <Controller
                name="brand"
                control={control}
                render={({ field }) => <Input {...field} />}
              />
            </Form.Item>

            <Form.Item
              label={ASSIGN_ASSET_LABEL.MODEL}
              validateStatus={errors.model ? "error" : ""}
              help={errors.model?.message}
            >
              <Controller
                name="model"
                control={control}
                render={({ field }) => <Input {...field} />}
              />
            </Form.Item>
          </div>

          {/* Serial No & Qty side by side */}
          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              label={ASSIGN_ASSET_LABEL.SERIAL_NO}
              validateStatus={errors.serialNo ? "error" : ""}
              help={errors.serialNo?.message}
            >
              <Controller
                name="serialNo"
                control={control}
                render={({ field }) => <Input {...field} />}
              />
            </Form.Item>

            <Form.Item
              label={ASSIGN_ASSET_LABEL.QTY}
              validateStatus={errors.qty ? "error" : ""}
              help={errors.qty?.message}
            >
              <Controller
                name="qty"
                control={control}
                render={({ field }) => (
                  <InputNumber
                    {...field}
                    min={1}
                    style={{ width: "100%" }}
                  />
                )}
              />
            </Form.Item>
          </div>

          {/* Issuance & Returned date side by side */}
          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              label={ASSIGN_ASSET_LABEL.ISSUANCE_DATE}
              validateStatus={errors.issuanceDate ? "error" : ""}
              help={errors.issuanceDate?.message}
            >
              <Controller
                name="issuanceDate"
                control={control}
                render={({ field }) => (
                  <DatePicker
                    style={{ width: "100%" }}
                    value={field.value ? dayjs(field.value) : null}
                    onChange={(date) =>
                      field.onChange(date ? date.format("YYYY-MM-DD") : "")
                    }
                  />
                )}
              />
            </Form.Item>

            <Form.Item
              label={ASSIGN_ASSET_LABEL.RETURNED_DATE}
              validateStatus={errors.returnedDate ? "error" : ""}
              help={errors.returnedDate?.message}
            >
              <Controller
                name="returnedDate"
                control={control}
                render={({ field }) => (
                  <DatePicker
                    style={{ width: "100%" }}
                    value={field.value ? dayjs(field.value) : null}
                    onChange={(date) =>
                      field.onChange(date ? date.format("YYYY-MM-DD") : null)
                    }
                  />
                )}
              />
            </Form.Item>
          </div>

          {/* Remarks */}
          <Form.Item label={ASSIGN_ASSET_LABEL.REMARKS}>
            <Controller
              name="remarks"
              control={control}
              render={({ field }) => (
                <Input.TextArea {...field} rows={3} />
              )}
            />
          </Form.Item>

          {/* File attachment */}
          <Form.Item label={ASSIGN_ASSET_LABEL.FILE}>
            <Upload {...uploadProps}>
              <Button icon={<UploadOutlined />}>Upload File</Button>
            </Upload>
            <p className="text-xs text-gray-400 mt-1">
              Accepted: PDF, JPG, PNG (max 1 file)
            </p>
          </Form.Item>

          <div className="form-action-footer">
            <Space className="form-action-footer-row">
              <Button
                onClick={() =>
                  navigate({ to: "/employee-management/assign-assets" })
                }
              >
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
      </div>
    </div>
  );
}
