import { useState } from "react";
import { Button, Card, Typography, message } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import {
  useCreateMyDelegation,
  useDeactivateMyDelegation,
  useDelegationsToMe,
  useMyDelegations,
} from "@/app/modules/setup/approval-delegations/hooks/use-approval-delegation-queries";
import { DelegationFormModal } from "@/app/modules/setup/approval-delegations/components/delegation-form-modal/delegation-form-modal";
import { DelegationTable } from "@/app/modules/setup/approval-delegations/components/delegation-table/delegation-table";
import { WriteGate } from "@/shared/components/write-gate/write-gate";

const { Text } = Typography;

// "While I'm away": the person picks who approves for them, for which requests and when. Also lists
// what others have delegated to them, so they know whose requests they can act on (in My Approvals).
export function DelegationCard() {
  const [modalOpen, setModalOpen] = useState(false);
  const { data: mine = [], isLoading } = useMyDelegations();
  const { data: toMe = [] } = useDelegationsToMe();
  const { mutateAsync: create, isPending: isCreating } =
    useCreateMyDelegation();
  const { mutate: deactivate, variables: deactivatingId } =
    useDeactivateMyDelegation();

  return (
    <Card
      title="While I'm away"
      extra={
        <WriteGate>
          <Button
            size="small"
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setModalOpen(true)}
          >
            Delegate
          </Button>
        </WriteGate>
      }
    >
      <Text type="secondary">
        Choose someone to approve or decline in your place. They'll see your
        pending requests under My Approvals.
      </Text>

      <div className="mt-3">
        <DelegationTable
          rows={mine}
          loading={isLoading}
          deactivatingId={deactivatingId ?? null}
          onDeactivate={(id) =>
            deactivate(id, {
              onSuccess: () => message.success("Delegation switched off."),
            })
          }
        />
      </div>

      {toMe.length > 0 && (
        <div className="mt-4">
          <Text strong>Delegated to me</Text>
          <div className="mt-2">
            <DelegationTable rows={toMe} counterpart="delegator" />
          </div>
        </div>
      )}

      <DelegationFormModal
        open={modalOpen}
        mode="self"
        submitting={isCreating}
        onCancel={() => setModalOpen(false)}
        onSubmit={async (data) => {
          await create(data);
          message.success("Delegation saved.");
        }}
      />
    </Card>
  );
}
