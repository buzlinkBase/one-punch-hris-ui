import { useEffect, useState } from "react";
import {
  Form,
  Input,
  Button,
  Select,
  Typography,
  Space,
  Tag,
  Upload,
  message,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import type { UploadFile, UploadProps } from "antd";
import { useNavigate } from "@tanstack/react-router";
import { useRouteParams } from "@/shared/hooks/useRouteParams";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  employeeDocRecordFormSchema,
  type EmployeeDocRecordFormValues,
} from "../../models/forms/employee-doc-record-form.schema";
import {
  useEmployeeDocRecord,
  useCreateEmployeeDocRecord,
  useUpdateEmployeeDocRecord,
} from "../../hooks/useEmployeeDocRecordQueries";
import { useEmployees } from "@/app/modules/setup/employee/hooks/useEmployeeQueries";
import { EMPLOYEE_DOC_RECORD_LABEL, DOC_RECORD_TYPE_OPTIONS } from "../../constants/label.const";
import { NAVIGATION_BUTTON_LABEL } from "@/shared/constants/navigation.const";

const { Title } = Typography;

export default function EmployeeDocRecordDetail() {
  const { id } = useRouteParams<{ id?: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { data: selected } = useEmployeeDocRecord(isEdit ? id : undefined);
  const { data: employees = [] } = useEmployees();
  const { mutateAsync: add, isPending: isCreating } = useCreateEmployeeDocRecord();
  const { mutateAsync: update, isPending: isUpdating } = useUpdateEmployeeDocRecord();

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
  } = useForm<EmployeeDocRecordFormValues>({
    resolver: zodResolver(employeeDocRecordFormSchema),
    defaultValues: {
      employeeId: "",
      recordType: "",
      description: "",
      file: "",
    },
  });

  useEffect(() => {
    if (isEdit && selected) {
      reset({
        employeeId: selected.employeeId,
        recordType: selected.recordType,
        description: selected.description,
        file: selected.file,
      });
      if (selected.file) {
        setFileList([
          {
            uid: "-1",
            name: selected.file.split("/").pop() ?? "document",
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
        file.type.startsWith("image/") ||
        file.type === "application/msword" ||
        file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
      if (!isAllowed) {
        message.error("Only PDF, Word documents, or image files are allowed.");
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

  const onSubmit = async (values: EmployeeDocRecordFormValues) => {
    const payload = { ...values, file: values.file ?? "" };
    if (isEdit && id) {
      await update({ id, ...payload });
    } else {
      await add(payload);
    }
    navigate({ to: "/employee-management/doc-records" });
  };

  return (
    <div className="content-page">
      <div className="page-toolbar">
        <div className="page-toolbar-row">
          <div>
            <Title level={4} className="mb-0!">
              {isEdit
                ? EMPLOYEE_DOC_RECORD_LABEL.EDIT_TITLE
                : EMPLOYEE_DOC_RECORD_LABEL.CREATE_TITLE}
            </Title>
            <p className="page-toolbar-subtitle">
              Attach and track documents for an employee record.
            </p>
          </div>
          <Space>
            <Tag color={isEdit ? "processing" : "success"}>
              {isEdit ? "Editing" : "New Record"}
            </Tag>
            <Button onClick={() => navigate({ to: "/employee-management/doc-records" })}>
              {NAVIGATION_BUTTON_LABEL.BACK}
            </Button>
          </Space>
        </div>
      </div>

      <div className="form-page-body">
        <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
          {/* Employee */}
          <Form.Item
            label={EMPLOYEE_DOC_RECORD_LABEL.EMPLOYEE}
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

          {/* Record Type */}
          <Form.Item
            label={EMPLOYEE_DOC_RECORD_LABEL.RECORD_TYPE}
            validateStatus={errors.recordType ? "error" : ""}
            help={errors.recordType?.message}
          >
            <Controller
              name="recordType"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  options={DOC_RECORD_TYPE_OPTIONS}
                  placeholder="Select record type"
                />
              )}
            />
          </Form.Item>

          {/* Description */}
          <Form.Item
            label={EMPLOYEE_DOC_RECORD_LABEL.DESCRIPTION}
            validateStatus={errors.description ? "error" : ""}
            help={errors.description?.message}
          >
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <Input.TextArea {...field} rows={3} placeholder="Enter document description" />
              )}
            />
          </Form.Item>

          {/* File */}
          <Form.Item label={EMPLOYEE_DOC_RECORD_LABEL.FILE}>
            <Upload {...uploadProps}>
              <Button icon={<UploadOutlined />}>Upload Document</Button>
            </Upload>
            <p className="text-xs text-gray-400 mt-1">
              Accepted: PDF, Word (.doc, .docx), JPG, PNG (max 1 file)
            </p>
          </Form.Item>

          <div className="form-action-footer">
            <Space className="form-action-footer-row">
              <Button onClick={() => navigate({ to: "/employee-management/doc-records" })}>
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
