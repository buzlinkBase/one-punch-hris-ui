import type { ReactElement } from "react";
import { Form } from "antd";
import {
  Controller,
  type Control,
  type ControllerRenderProps,
  type FieldValues,
  type Path,
} from "react-hook-form";

interface FormFieldProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  label: string;
  extra?: string;
  className?: string;
  render: (field: ControllerRenderProps<T, Path<T>>) => ReactElement;
}

/** An antd form row bound to a React Hook Form field, showing the field's validation message. */
export function FormField<T extends FieldValues>({
  control,
  name,
  label,
  extra,
  className,
  render,
}: FormFieldProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <Form.Item
          label={label}
          extra={extra}
          className={className}
          validateStatus={fieldState.error ? "error" : ""}
          help={fieldState.error?.message}
        >
          {render(field)}
        </Form.Item>
      )}
    />
  );
}
