import { Button, Space, Typography } from "antd";
import { PlusOutlined, ReloadOutlined } from "@ant-design/icons";
import { useNavigate } from "@tanstack/react-router";
import {
  useLeaveTypes,
  useDeleteLeaveType,
} from "../../hooks/use-leave-type-queries";
import LeaveTypeTable from "../../components/leave-type-table";
import { LEAVE_TYPE_LABEL } from "../../constants/label.const";

const { Title } = Typography;

export default function LeaveTypeList() {
  const navigate = useNavigate();
  const {
    data: leaveTypes = [],
    isLoading,
    refetch,
    isFetching,
  } = useLeaveTypes();
  const { mutate: remove } = useDeleteLeaveType();

  return (
    <div className="content-page">
      <div className="page-toolbar">
        <div className="page-toolbar-row">
          <div>
            <Title level={4} className="mb-0!">
              {LEAVE_TYPE_LABEL.TITLE}
            </Title>
            <p className="page-toolbar-subtitle">
              Configure leave types and their entitlement rules.
            </p>
          </div>
          <Space>
            <Button
              icon={<ReloadOutlined spin={isFetching} />}
              onClick={() => refetch()}
              loading={isFetching && !isLoading}
            />
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => navigate({ to: "/setup/leave-type/create" })}
            >
              Add Leave Type
            </Button>
          </Space>
        </div>
      </div>
      <LeaveTypeTable data={leaveTypes} loading={isLoading} onDelete={remove} />
    </div>
  );
}
