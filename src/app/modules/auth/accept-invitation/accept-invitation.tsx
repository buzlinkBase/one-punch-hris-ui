import { useEffect, useRef, useState } from "react";
import { Button } from "antd";
import {
  CheckCircleOutlined,
  MailOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import { Link, useLocation } from "@tanstack/react-router";
import axios from "axios";
import { authApi } from "@/app/modules/auth/login/services/auth.api";
import { authStorage } from "@/core/auth/auth-storage";
import { guardCode, problemDetail } from "@/core/auth/guard-error";
import { PENDING_INVITE_KEY } from "@/core/auth/invitation-session";
import {
  useAcceptInvitationMutation,
  useInvitationPreviewQuery,
} from "./hooks/use-accept-invitation-queries";
import InvitationStatusCard from "./components/invitation-status-card";
import NewAccountForm from "./components/new-account-form";

// What the "account already exists" branch shows. There's no client-side guess about whether
// the stored session is good enough -- when one exists, acceptInvitation() is attempted and its
// actual response (success, 401, wrong account, anything else) picks the view.
type ExistingAccountView =
  | { phase: "attempting" }
  | { phase: "needsSignIn" }
  | { phase: "emailMismatch"; sessionEmail: string | null }
  | { phase: "error"; message: string };

function resolveExistingAccountView(
  hasSession: boolean,
  error: unknown,
): ExistingAccountView {
  // No stored token at all -- the accept call is certain to 401, so don't make it.
  if (!hasSession) return { phase: "needsSignIn" };
  if (!error) return { phase: "attempting" };
  // Not authenticated after all (token rejected, or the silent refresh also failed).
  if (axios.isAxiosError(error) && error.response?.status === 401) {
    return { phase: "needsSignIn" };
  }
  if (guardCode(error) === "INVITATION_EMAIL_MISMATCH") {
    return {
      phase: "emailMismatch",
      sessionEmail: authStorage.getUser()?.email ?? null,
    };
  }
  return {
    phase: "error",
    message: problemDetail(error, "Failed to accept invitation."),
  };
}

export default function AcceptInvitation() {
  const location = useLocation();
  const token = new URLSearchParams(location.search).get("token") ?? "";

  const previewQuery = useInvitationPreviewQuery(token);
  const preview = previewQuery.data;
  const acceptInvitation = useAcceptInvitationMutation();

  // Read once per mount -- the session this visit started with is what decides the flow.
  const [hasSession] = useState(() => !!authStorage.getToken());
  // StrictMode runs effects twice in dev; refs survive that, so this guarantees exactly one
  // /invitation/accept POST per visit (two concurrent ones could both see the invite as
  // Pending and double-publish the join events downstream).
  const autoAcceptStarted = useRef(false);

  useEffect(() => {
    if (!preview?.valid || !preview.accountExists) return;
    if (autoAcceptStarted.current) return;
    autoAcceptStarted.current = true;

    const parkForSignIn = () =>
      sessionStorage.setItem(PENDING_INVITE_KEY, token);

    if (!hasSession) {
      // login.tsx picks the invitation back up right after sign-in.
      parkForSignIn();
      return;
    }
    acceptInvitation.mutate(token, {
      onError: (err) => {
        if (axios.isAxiosError(err) && err.response?.status === 401) {
          parkForSignIn();
        }
      },
    });
  }, [preview, hasSession, token, acceptInvitation]);

  const handleSwitchAccount = async () => {
    await authApi.logout().catch(() => {});
    authStorage.clear();
    sessionStorage.setItem(PENDING_INVITE_KEY, token);
    window.location.assign("/login");
  };

  if (token && previewQuery.isPending) {
    return <InvitationStatusCard title="Checking your invitation…" />;
  }

  if (!preview?.valid) {
    return (
      <InvitationStatusCard
        icon={<WarningOutlined />}
        title="Invitation expired or invalid"
        subtitle="This invite link is no longer valid. Ask whoever invited you to send a new one."
      >
        <div className="text-center">
          <Link to="/login">Back to sign in</Link>
        </div>
      </InvitationStatusCard>
    );
  }

  if (!preview.accountExists) {
    return <NewAccountForm token={token} preview={preview} />;
  }

  const view = resolveExistingAccountView(hasSession, acceptInvitation.error);

  switch (view.phase) {
    case "needsSignIn":
      return (
        <InvitationStatusCard
          icon={<MailOutlined />}
          title={`You're invited to ${preview.tenantName}`}
          subtitle={`An account already exists for ${preview.email}. Sign in and your invitation will be accepted automatically.`}
        >
          <Link to="/login">
            <Button type="primary" block size="large">
              Sign in to accept
            </Button>
          </Link>
        </InvitationStatusCard>
      );

    case "emailMismatch":
      return (
        <InvitationStatusCard
          icon={<WarningOutlined />}
          title="Wrong account"
          subtitle={`This invite was sent to ${preview.email}, but you're signed in as ${view.sessionEmail ?? "a different account"}.`}
        >
          <Button
            type="primary"
            block
            size="large"
            onClick={handleSwitchAccount}
          >
            Sign out and switch accounts
          </Button>
          <div className="text-center mt-3">
            <Link to="/dashboard">Go to dashboard instead</Link>
          </div>
        </InvitationStatusCard>
      );

    case "error":
      // Expired, already used, invalid token, network error, etc. -- the backend's own
      // message is fine to show as-is.
      return (
        <InvitationStatusCard
          icon={<WarningOutlined />}
          title="Couldn't accept invitation"
          subtitle={view.message}
          danger
        >
          <div className="text-center mt-3">
            <Link to="/dashboard">Go to dashboard</Link>
          </div>
        </InvitationStatusCard>
      );

    case "attempting":
      return (
        <InvitationStatusCard
          icon={<CheckCircleOutlined />}
          title={`Joining ${preview.tenantName}…`}
          subtitle="Accepting your invitation — this only takes a moment."
          loading
        />
      );
  }
}
