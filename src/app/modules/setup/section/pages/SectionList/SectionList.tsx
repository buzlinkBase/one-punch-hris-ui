import { Button, Typography } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { useNavigate } from "@tanstack/react-router";
import { useSections, useDeleteSection } from "../../hooks/useSectionQueries";
import SectionTable from "../../components/SectionTable";
import { SECTION_LABEL } from "../../constants/label.const";

const { Title } = Typography;

export default function SectionList() {
  const navigate = useNavigate();
  const { data: sections = [], isLoading } = useSections();
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
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate({ to: "/setup/section/create" })}
          >
            Add Section
          </Button>
        </div>
      </div>
      <SectionTable data={sections} loading={isLoading} onDelete={remove} />
    </div>
  );
}
