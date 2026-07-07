import { Outlet } from "@tanstack/react-router";

export default function AuthLayout() {
  return (
    <div className="auth-bg min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Outlet />
      </div>
    </div>
  );
}
