import { Button, Result } from "antd";
import { Navigate, useNavigate } from "@tanstack/react-router";
import { authStorage } from "@/core/auth/auth-storage";

/**
 * Unknown URL. A signed-in user gets a real 404 with a way home; a visitor with no session is
 * sent to the login page as before.
 */
export function NotFoundPage() {
  const navigate = useNavigate();

  if (!authStorage.getToken()) return <Navigate to="/login" replace />;

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Result
        status="404"
        title="Page not found"
        subTitle="The page you're looking for doesn't exist or has moved."
        extra={
          <Button type="primary" onClick={() => navigate({ to: "/" })}>
            Back to home
          </Button>
        }
      />
    </div>
  );
}
