import { Button, Space, Typography } from "antd";
import { PlusOutlined, ReloadOutlined } from "@ant-design/icons";
import { useNavigate } from "@tanstack/react-router";
import { useDevices, useDeleteDevice } from "../../hooks/use-device-queries";
import DeviceTable from "../../components/device-table";
import { DEVICE_LABEL } from "../../constants/label.const";
import { PermissionGate } from "@/shared/components/permission-gate/permission-gate";

const { Title } = Typography;

export default function ManageDevicesList() {
  const navigate = useNavigate();
  const { data: devices = [], isLoading, refetch, isFetching } = useDevices();
  const { mutate: remove } = useDeleteDevice();

  return (
    <div className="content-page">
      <div className="page-toolbar">
        <div className="page-toolbar-row">
          <div>
            <Title level={4} className="mb-0!">
              {DEVICE_LABEL.TITLE}
            </Title>
            <p className="page-toolbar-subtitle">{DEVICE_LABEL.SUBTITLE}</p>
          </div>
          <Space>
            <Button
              icon={<ReloadOutlined spin={isFetching} />}
              onClick={() => refetch()}
              loading={isFetching && !isLoading}
            />
            <PermissionGate permission="Biometric Setup:Create">
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() =>
                  navigate({ to: "/biometric/manage-devices/create" })
                }
              >
                Add Device
              </Button>
            </PermissionGate>
          </Space>
        </div>
      </div>
      <DeviceTable data={devices} loading={isLoading} onDelete={remove} />
    </div>
  );
}
