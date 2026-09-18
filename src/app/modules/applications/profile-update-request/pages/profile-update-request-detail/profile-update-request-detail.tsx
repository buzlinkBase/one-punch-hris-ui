import { useState } from "react";
import {
  Alert,
  Button,
  Card,
  Descriptions,
  Space,
  Tag,
  Typography,
  message,
} from "antd";
import { useNavigate } from "@tanstack/react-router";
import dayjs from "dayjs";
import {
  useApproveProfileUpdateRequest,
  useDeclineProfileUpdateRequest,
  useProfileUpdateRequest,
} from "../../hooks/use-profile-update-request-queries";
import {
  APPROVAL_STATUS_COLOR,
  APPROVAL_STATUS_LABEL,
  PROFILE_FIELD_LABEL,
} from "../../constants/label.const";
import { NAVIGATION_BUTTON_LABEL } from "@/shared/constants/navigation.const";
import { useRouteParams } from "@/shared/hooks/use-route-params";
import { PermissionGate } from "@/shared/components/permission-gate/permission-gate";
import { ApprovalActionModal } from "@/shared/components/approval-action-modal/approval-action-modal";
import { ApprovalTimeline } from "@/shared/components/approval-timeline/approval-timeline";
import { useApprovalInstance } from "@/shared/hooks/use-approval-queries";
import { useEmployees } from "@/app/modules/setup/employee/hooks/use-employee-queries";

const { Title } = Typography;

function fmtValue(
  field: keyof typeof PROFILE_FIELD_LABEL,
  value?: string | null,
) {
  if (!value) return "—";
  return field === "newDOB" ? dayjs(value).format("MMMM D, YYYY") : value;
}

const FIELD_PAIRS: {
  newField: keyof typeof PROFILE_FIELD_LABEL;
  currentKey:
    | "currentContact"
    | "currentAddress1"
    | "currentAddress2"
    | "currentCivilStatus"
    | "currentDOB"
    | "currentBloodType";
}[] = [
  { newField: "newContact", currentKey: "currentContact" },
  { newField: "newAddress1", currentKey: "currentAddress1" },
  { newField: "newAddress2", currentKey: "currentAddress2" },
  { newField: "newCivilStatus", currentKey: "currentCivilStatus" },
  { newField: "newDOB", currentKey: "currentDOB" },
  { newField: "newBloodType", currentKey: "currentBloodType" },
];

export default function ProfileUpdateRequestDetail() {
  const { id } = useRouteParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: request, isLoading } = useProfileUpdateRequest(id);
  const { mutate: approve, isPending: isApproving } =
    useApproveProfileUpdateRequest();
  const { mutate: decline, isPending: isDeclining } =
    useDeclineProfileUpdateRequest();
  const { data: instance } = useApprovalInstance("ProfileUpdate", id);
  const { data: rawEmployees = [] } = useEmployees();
  const resolveEmployeeName = (employeeId: string) =>
    rawEmployees.find((e) => e.id === employeeId)?.fullName ?? undefined;

  const [action, setAction] = useState<"Approved" | "Declined" | null>(null);
  const [forceApply, setForceApply] = useState(false);

  const backTo = () => navigate({ to: "/applications/profile-update-request" });

  return (
    <div className="content-page">
      <div className="page-toolbar">
        <div className="page-toolbar-row">
          <div>
            <Title level={4} className="mb-0!">
              Profile Update Request
            </Title>
            <p className="page-toolbar-subtitle">
              Requested changes vs. what is currently on file.
            </p>
          </div>
          <Button onClick={backTo}>{NAVIGATION_BUTTON_LABEL.BACK}</Button>
        </div>
      </div>

      <div className="form-page-body">
        {!isLoading && request && (
          <>
            <div className="mb-3 flex items-center gap-2 flex-wrap">
              <Tag
                color={
                  APPROVAL_STATUS_COLOR[request.approvalStatus] ?? "default"
                }
              >
                {APPROVAL_STATUS_LABEL[request.approvalStatus] ??
                  request.approvalStatus}
              </Tag>
              <span>{request.employeeName}</span>
            </div>

            {request.hasConflict &&
              request.approvalStatus === "ForApproval" && (
                <Alert
                  type="warning"
                  showIcon
                  className="mb-3"
                  message="This employee's record has changed since this request was submitted."
                  description="Review the current values below before approving — approving now will overwrite the employee's more recent record with the values requested here."
                  action={
                    <PermissionGate permission="Profile Update:Approve">
                      <Button
                        danger
                        size="small"
                        onClick={() => {
                          setForceApply(true);
                          setAction("Approved");
                        }}
                      >
                        Approve Anyway
                      </Button>
                    </PermissionGate>
                  }
                />
              )}

            {request.remarks && (
              <Card size="small" title="Employee's Remarks" className="mb-3">
                {request.remarks}
              </Card>
            )}

            <Card size="small" title="Requested Changes">
              <Descriptions bordered column={1} size="small">
                {FIELD_PAIRS.map(({ newField, currentKey }) => (
                  <Descriptions.Item
                    key={newField}
                    label={PROFILE_FIELD_LABEL[newField]}
                  >
                    <div className="flex flex-col gap-1">
                      <span className="text-gray-400 line-through">
                        {fmtValue(newField, request[currentKey])}
                      </span>
                      <span className="font-medium">
                        {fmtValue(newField, request[newField])}
                      </span>
                    </div>
                  </Descriptions.Item>
                ))}
              </Descriptions>
            </Card>

            {request.approvalStatus === "ForApproval" &&
              !request.hasConflict && (
                <div className="form-action-footer">
                  <Space className="form-action-footer-row">
                    <PermissionGate permission="Profile Update:Approve">
                      <Button
                        onClick={() => {
                          setForceApply(false);
                          setAction("Declined");
                        }}
                        danger
                      >
                        Decline
                      </Button>
                      <Button
                        type="primary"
                        onClick={() => {
                          setForceApply(false);
                          setAction("Approved");
                        }}
                      >
                        Approve
                      </Button>
                    </PermissionGate>
                  </Space>
                </div>
              )}

            <Card size="small" title="Approval Progress" className="mt-4">
              <ApprovalTimeline
                applicationType="ProfileUpdate"
                applicationId={request.id}
                resolveEmployeeName={resolveEmployeeName}
              />
            </Card>
          </>
        )}
      </div>

      <ApprovalActionModal
        open={!!action}
        action={action ?? "Approved"}
        noteRequirement={instance?.currentStepNoteRequirement}
        loading={isApproving || isDeclining}
        onCancel={() => setAction(null)}
        onConfirm={(note) => {
          if (!request) return;
          if (action === "Approved") {
            approve(
              { id: request.id, note, forceApply },
              {
                onSuccess: () => message.success("Profile update approved."),
                onError: (err) => {
                  const status = (err as { response?: { status?: number } })
                    .response?.status;
                  message.error(
                    status === 409
                      ? "This record changed again just now. Refresh and try Approve Anyway."
                      : "Failed to approve.",
                  );
                },
              },
            );
          } else {
            decline(
              { id: request.id, note },
              {
                onSuccess: () => message.success("Profile update declined."),
                onError: () => message.error("Failed to decline."),
              },
            );
          }
          setAction(null);
        }}
      />
    </div>
  );
}
