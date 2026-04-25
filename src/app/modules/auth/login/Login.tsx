import { Card, Form, Input, Button, Typography } from "antd";
import { SafetyCertificateOutlined } from "@ant-design/icons";
import { useNavigate } from "@tanstack/react-router";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginFormSchema, type LoginFormValues } from "./login-form.schema";

const { Title, Text } = Typography;

export default function Login() {
  const navigate = useNavigate();
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: { username: "", password: "" },
  });

  const onSubmit = async (values: LoginFormValues) => {
    // TODO: call auth API, store token, redirect
    console.log("Login:", values);
    navigate({ to: "/setup/department" });
  };

  return (
    <Card className="auth-card login-card border-0">
      <div className="login-header">
        <div
          className="login-icon-placeholder"
          aria-label="App icon placeholder"
        >
          <SafetyCertificateOutlined />
        </div>
        <Text className="login-kicker">One Punch HRIS</Text>
        <Title level={3} className="login-title">
          Welcome Back
        </Title>
        <Text className="login-subtitle">
          Sign in to continue managing your HR operations.
        </Text>
      </div>

      <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
        <Form.Item
          label="Username"
          validateStatus={errors.username ? "error" : ""}
          help={errors.username?.message}
          className="login-form-item"
        >
          <Controller
            name="username"
            control={control}
            render={({ field }) => (
              <Input {...field} placeholder="Enter username" size="large" />
            )}
          />
        </Form.Item>

        <Form.Item
          label="Password"
          validateStatus={errors.password ? "error" : ""}
          help={errors.password?.message}
          className="login-form-item"
        >
          <Controller
            name="password"
            control={control}
            render={({ field }) => (
              <Input.Password
                {...field}
                placeholder="Enter password"
                size="large"
              />
            )}
          />
        </Form.Item>

        <Form.Item className="!mb-0">
          <Button
            type="primary"
            htmlType="submit"
            loading={isSubmitting}
            block
            size="large"
          >
            Sign In
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
}
