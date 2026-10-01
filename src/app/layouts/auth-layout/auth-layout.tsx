import { Outlet } from "@tanstack/react-router";
import { PlanRestrictionModal } from "@/app/modules/billing/components/plan-restriction-modal";

export default function AuthLayout() {
  return (
    <div className="auth-bg min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Outlet />
      </div>
      {/* e.g. creating a company past the plan's limit (/create-tenant) */}
      <PlanRestrictionModal />
    </div>
  );
}
