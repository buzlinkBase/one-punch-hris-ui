import { Outlet } from "@tanstack/react-router";
import { PlanRestrictionModal } from "@/app/modules/billing/components/plan-restriction-modal";
import { TermsLink } from "@/app/modules/legal/components/terms-link";

export default function AuthLayout() {
  return (
    <div className="auth-bg min-h-screen flex flex-col items-center justify-center gap-4 p-4">
      <div className="w-full max-w-md">
        <Outlet />
      </div>
      {/* The Terms page is its own public route; hidden while the Terms aren't live. */}
      <TermsLink className="text-xs opacity-80">Terms of Service</TermsLink>
      {/* e.g. creating a company past the plan's limit (/create-tenant) */}
      <PlanRestrictionModal />
    </div>
  );
}
