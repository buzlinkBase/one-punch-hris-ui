import {
  Alert,
  Button,
  Card,
  Descriptions,
  Empty,
  Skeleton,
  Space,
  Tabs,
  Typography,
} from "antd";
import { EditOutlined } from "@ant-design/icons";
import { useNavigate } from "@tanstack/react-router";
import dayjs from "dayjs";
import {
  useMyEmployee,
  useMyProfileUpdateRequests,
} from "../../../shared/hooks/use-my-employee-queries";
import { formatFullName } from "@/app/modules/setup/employee/utils/format-full-name";
import { EMPLOYEE_LABEL } from "@/app/modules/setup/employee/constants/label.const";

const { Title } = Typography;

function formatDate(value?: string | null) {
  return value ? dayjs(value).format("MMMM D, YYYY") : "—";
}

export default function PortalProfile() {
  const navigate = useNavigate();
  const { data: employee, isLoading } = useMyEmployee();
  const { data: requests = [] } = useMyProfileUpdateRequests();
  const pendingRequest = requests.find(
    (r) => r.approvalStatus === "ForApproval",
  );

  return (
    <div className="content-page">
      <div className="page-toolbar">
        <div className="page-toolbar-row">
          <div>
            <Title level={4} className="mb-0!">
              My Profile
            </Title>
            <p className="page-toolbar-subtitle">
              Your personal, employment, and compensation details on file.
            </p>
          </div>
          {employee && (
            <Space>
              <Button
                icon={<EditOutlined />}
                disabled={!!pendingRequest}
                onClick={() => navigate({ to: "/portal/profile/edit" })}
              >
                Edit Profile
              </Button>
            </Space>
          )}
        </div>
      </div>

      <div className="form-page-body">
        {pendingRequest && (
          <Alert
            type="info"
            showIcon
            className="mb-3"
            message="A profile update request is pending approval."
            description="Your requested changes will take effect once an approver reviews them."
          />
        )}
        {isLoading ? (
          <Skeleton active paragraph={{ rows: 8 }} />
        ) : !employee ? (
          <Empty description="No employee profile is linked to your account yet. Contact HR if you believe this is a mistake." />
        ) : (
          <Card>
            <Tabs
              type="card"
              items={[
                {
                  key: "personal",
                  label: "Personal Information",
                  children: (
                    <Descriptions
                      bordered
                      column={{ xs: 1, sm: 1, md: 2 }}
                      size="small"
                    >
                      <Descriptions.Item label="Full Name" span={2}>
                        {formatFullName(employee)}
                      </Descriptions.Item>
                      <Descriptions.Item label={EMPLOYEE_LABEL.EMPLOYEE_NO}>
                        {employee.employeeNo}
                      </Descriptions.Item>
                      <Descriptions.Item label={EMPLOYEE_LABEL.GENDER}>
                        {employee.gender || "—"}
                      </Descriptions.Item>
                      <Descriptions.Item label={EMPLOYEE_LABEL.CIVIL_STATUS}>
                        {employee.civilStatus || "—"}
                      </Descriptions.Item>
                      <Descriptions.Item label={EMPLOYEE_LABEL.DOB}>
                        {formatDate(employee.dob)}
                      </Descriptions.Item>
                      <Descriptions.Item label={EMPLOYEE_LABEL.BLOOD_TYPE}>
                        {employee.bloodType || "—"}
                      </Descriptions.Item>
                      <Descriptions.Item label={EMPLOYEE_LABEL.EMAIL}>
                        {employee.email || "—"}
                      </Descriptions.Item>
                      <Descriptions.Item label={EMPLOYEE_LABEL.CONTACT}>
                        {employee.contact || "—"}
                      </Descriptions.Item>
                      <Descriptions.Item
                        label={EMPLOYEE_LABEL.ADDRESS1}
                        span={2}
                      >
                        {employee.address1 || "—"}
                      </Descriptions.Item>
                      <Descriptions.Item
                        label={EMPLOYEE_LABEL.ADDRESS2}
                        span={2}
                      >
                        {employee.address2 || "—"}
                      </Descriptions.Item>
                    </Descriptions>
                  ),
                },
                {
                  key: "employment",
                  label: "Employment Details",
                  children: (
                    <Descriptions
                      bordered
                      column={{ xs: 1, sm: 1, md: 2 }}
                      size="small"
                    >
                      <Descriptions.Item label={EMPLOYEE_LABEL.DEPARTMENT}>
                        {employee.departmentName || "—"}
                      </Descriptions.Item>
                      <Descriptions.Item label={EMPLOYEE_LABEL.POSITION}>
                        {employee.positionName || "—"}
                      </Descriptions.Item>
                      <Descriptions.Item label={EMPLOYEE_LABEL.BRANCH}>
                        {employee.branchName || "—"}
                      </Descriptions.Item>
                      <Descriptions.Item label={EMPLOYEE_LABEL.AREA}>
                        {employee.areaName || "—"}
                      </Descriptions.Item>
                      <Descriptions.Item label={EMPLOYEE_LABEL.CLIENT}>
                        {employee.clientName || "—"}
                      </Descriptions.Item>
                      <Descriptions.Item label={EMPLOYEE_LABEL.TIME_SHIFT}>
                        {employee.timeShiftName || "—"}
                      </Descriptions.Item>
                      <Descriptions.Item label={EMPLOYEE_LABEL.JOB_LEVEL}>
                        {employee.jobLevel}
                      </Descriptions.Item>
                      <Descriptions.Item
                        label={EMPLOYEE_LABEL.EMPLOYMENT_STATUS}
                      >
                        {employee.employmentStatus}
                      </Descriptions.Item>
                      <Descriptions.Item label={EMPLOYEE_LABEL.HIRE_DATE}>
                        {formatDate(employee.hireDate)}
                      </Descriptions.Item>
                      <Descriptions.Item label={EMPLOYEE_LABEL.DATE_REGISTERED}>
                        {formatDate(employee.dateRegistered)}
                      </Descriptions.Item>
                    </Descriptions>
                  ),
                },
                {
                  key: "compensation",
                  label: "Compensation",
                  children: (
                    <Descriptions
                      bordered
                      column={{ xs: 1, sm: 1, md: 2 }}
                      size="small"
                    >
                      <Descriptions.Item label={EMPLOYEE_LABEL.SALARY_TYPE}>
                        {employee.salaryType}
                      </Descriptions.Item>
                      <Descriptions.Item label={EMPLOYEE_LABEL.MODE_OF_PAYMENT}>
                        {employee.modeOfPayment}
                      </Descriptions.Item>
                      <Descriptions.Item label={EMPLOYEE_LABEL.BANK_NAME}>
                        {employee.bankName || "—"}
                      </Descriptions.Item>
                      <Descriptions.Item label={EMPLOYEE_LABEL.BANK_NO}>
                        {employee.bankNo || "—"}
                      </Descriptions.Item>
                    </Descriptions>
                  ),
                },
                {
                  key: "government-ids",
                  label: "Government IDs",
                  children: (
                    <Descriptions
                      bordered
                      column={{ xs: 1, sm: 1, md: 2 }}
                      size="small"
                    >
                      <Descriptions.Item label={EMPLOYEE_LABEL.SSS_NO}>
                        {employee.sssNo || "—"}
                      </Descriptions.Item>
                      <Descriptions.Item label={EMPLOYEE_LABEL.PHIC_NO}>
                        {employee.phicNo || "—"}
                      </Descriptions.Item>
                      <Descriptions.Item label={EMPLOYEE_LABEL.HDMF_NO}>
                        {employee.hdmfNo || "—"}
                      </Descriptions.Item>
                      <Descriptions.Item label={EMPLOYEE_LABEL.TIN}>
                        {employee.tin || "—"}
                      </Descriptions.Item>
                      <Descriptions.Item label={EMPLOYEE_LABEL.RDO_CODE}>
                        {employee.rdoCode || "—"}
                      </Descriptions.Item>
                    </Descriptions>
                  ),
                },
              ]}
            />
          </Card>
        )}
      </div>
    </div>
  );
}
