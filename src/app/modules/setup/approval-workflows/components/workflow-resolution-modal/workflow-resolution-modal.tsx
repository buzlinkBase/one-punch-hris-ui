import { useState } from "react";
import { Alert, Form, List, Modal, Select, Tag } from "antd";
import { useEmployeeFilter } from "@/app/modules/timekeeping/attendance-entry/hooks/use-attendance-entry-queries";
import type { ApprovalApplicationType } from "@/shared/types/approval.model";
import { useResolveApprovalWorkflow } from "../../hooks/use-approval-workflow-queries";
import {
  APPLICATION_TYPE_LABEL,
  APPLICATION_TYPE_OPTIONS,
} from "../../constants/label.const";

interface Props {
  open: boolean;
  /** The list's current type -- the check starts on it. */
  applicationType: ApprovalApplicationType;
  onClose: () => void;
}

const filterOption = (
  input: string,
  option?: { label?: string | number | boolean },
) =>
  String(option?.label ?? "")
    .toLowerCase()
    .includes(input.toLowerCase());

// "Which workflow applies?": pick an employee and a type, see the workflow their next application
// would run on, and every active workflow in the order they're tried -- the quickest way to
// check scopes and priorities do what was meant.
export function WorkflowResolutionModal({
  open,
  applicationType,
  onClose,
}: Props) {
  const [type, setType] = useState<ApprovalApplicationType>(applicationType);
  const [employeeId, setEmployeeId] = useState<string>();
  const { data: employees = [] } = useEmployeeFilter();
  const {
    mutate: resolve,
    data,
    isPending,
    reset,
  } = useResolveApprovalWorkflow();

  const run = (nextType: ApprovalApplicationType, nextEmployee?: string) => {
    if (nextEmployee)
      resolve({ applicationType: nextType, employeeId: nextEmployee });
    else reset();
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      title="Which workflow applies?"
      destroyOnHidden
    >
      <Form layout="vertical">
        <Form.Item label="Application type">
          <Select
            value={type}
            options={APPLICATION_TYPE_OPTIONS}
            onChange={(next) => {
              setType(next);
              run(next, employeeId);
            }}
          />
        </Form.Item>
        <Form.Item label="Employee">
          <Select
            showSearch
            allowClear
            placeholder="Select an employee"
            value={employeeId}
            options={employees.map((e) => ({
              value: e.id,
              label: e.name ?? e.id,
            }))}
            filterOption={filterOption}
            loading={isPending}
            onChange={(next) => {
              setEmployeeId(next);
              run(type, next);
            }}
          />
        </Form.Item>
      </Form>

      {data &&
        (data.isFallback ? (
          <Alert
            type="warning"
            showIcon
            message="No workflow matches"
            description={`${APPLICATION_TYPE_LABEL[type]} requests from this employee use the default single-step approval (anyone with the Approve permission).`}
          />
        ) : (
          <Alert
            type="success"
            showIcon
            message={`Runs on "${data.workflowName}"`}
          />
        ))}

      {data && data.candidates.length > 0 && (
        <List
          className="mt-3"
          size="small"
          header="Active workflows, in the order they are tried"
          dataSource={data.candidates}
          renderItem={(c) => (
            <List.Item
              extra={
                c.id === data.workflowId ? (
                  <Tag color="success">Applies</Tag>
                ) : c.matched ? (
                  <Tag>Matches, lower priority</Tag>
                ) : (
                  <Tag color="default">Doesn't match</Tag>
                )
              }
            >
              <List.Item.Meta
                title={c.name}
                description={`Priority ${c.priority}`}
              />
            </List.Item>
          )}
        />
      )}
    </Modal>
  );
}
