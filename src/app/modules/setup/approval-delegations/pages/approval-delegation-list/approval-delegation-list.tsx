import { useState } from "react";
import { Button, Typography, message } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import {
  useAllDelegations,
  useCreateDelegation,
  useDeactivateDelegation,
} from "../../hooks/use-approval-delegation-queries";
import { DelegationFormModal } from "../../components/delegation-form-modal/delegation-form-modal";
import { DelegationTable } from "../../components/delegation-table/delegation-table";
import { PermissionGate } from "@/shared/components/permission-gate/permission-gate";

const { Title } = Typography;

// Setup > Approval Delegations: every "while I'm away" arrangement in the company, and a way to set
// one up for someone who can't do it themselves. People manage their own from their profile.
export default function ApprovalDelegationList() {
  const [modalOpen, setModalOpen] = useState(false);
  const { data: rows = [], isLoading } = useAllDelegations();
  const { mutateAsync: create, isPending: isCreating } = useCreateDelegation();
  const { mutate: deactivate, variables: deactivatingId } =
    useDeactivateDelegation();

  return (
    <div className="content-page">
      <div className="page-toolbar">
        <div className="page-toolbar-row">
          <div>
            <Title level={4} className="mb-0!">
              Approval Delegations
            </Title>
            <p className="page-toolbar-subtitle">
              Who is covering for an approver who is away. People can set their
              own from their profile; you can set one up for anyone here.
            </p>
          </div>
          <PermissionGate permission="Approval Workflows:Edit">
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setModalOpen(true)}
            >
              Add Delegation
            </Button>
          </PermissionGate>
        </div>
      </div>

      <DelegationTable
        rows={rows}
        loading={isLoading}
        showDelegator
        deactivatingId={deactivatingId ?? null}
        onDeactivate={(id) =>
          deactivate(id, {
            onSuccess: () => message.success("Delegation switched off."),
          })
        }
      />

      <DelegationFormModal
        open={modalOpen}
        mode="admin"
        submitting={isCreating}
        onCancel={() => setModalOpen(false)}
        onSubmit={async (data) => {
          await create(data);
          message.success("Delegation saved.");
        }}
      />
    </div>
  );
}
