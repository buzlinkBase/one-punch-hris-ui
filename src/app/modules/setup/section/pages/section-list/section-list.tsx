import { Button, Space, Typography } from "antd";
import { PlusOutlined, ReloadOutlined } from "@ant-design/icons";
import { useNavigate } from "@tanstack/react-router";
import { useSections, useDeleteSection } from "../../hooks/use-section-queries";
import SectionTable from "../../components/section-table";
import { SECTION_LABEL } from "../../constants/label.const";
import { PermissionGate } from "@/shared/components/permission-gate/permission-gate";

const { Title } = Typography;

export default function SectionList() {
  const navigate = useNavigate();
  const { data: sections = [], isLoading, refetch, isFetching } = useSections();
  const { mutate: remove } = useDeleteSection();

  return (
    <div className="content-page">
      <div className="page-toolbar">
        <div className="page-toolbar-row">
          <div>
            <Title level={4} className="mb-0!">
              {SECTION_LABEL.TITLE}
            </Title>
            <p className="page-toolbar-subtitle">
              Manage organizational sections within departments.
            </p>
          </div>
          <Space>
            <Button
              icon={<ReloadOutlined spin={isFetching} />}
              onClick={() => refetch()}
              loading={isFetching && !isLoading}
            />
            <PermissionGate permission="Organization Setup:Create">
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => navigate({ to: "/setup/section/create" })}
              >
                Add Section
              </Button>
            </PermissionGate>
          </Space>
        </div>
      </div>
      <SectionTable data={sections} loading={isLoading} onDelete={remove} />
    </div>
  );
}
