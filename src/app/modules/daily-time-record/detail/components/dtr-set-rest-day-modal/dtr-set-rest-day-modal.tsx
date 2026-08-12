import { useState } from "react";
import { Button, DatePicker, Empty, Form, List, Modal, Popconfirm } from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";
import {
  useCreateRestDayDate,
  useDeleteRestDayDate,
  useRestDayDatesByEmployee,
} from "@/app/modules/change-schedule/rest-day-date/hooks/use-rest-day-date-queries";
import { getNotify } from "@/shared/utils/notify";

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  employeeId: string;
  employeeName: string | null | undefined;
  workDate: string;
}

export default function DtrSetRestDayModal({
  open,
  onClose,
  onSuccess,
  employeeId,
  employeeName,
  workDate,
}: Props) {
  const { mutateAsync: createRestDayDate, isPending: isSubmitting } =
    useCreateRestDayDate();
  const { data: existingRestDays = [], isLoading: isLoadingExisting } =
    useRestDayDatesByEmployee(employeeId, { enabled: open });
  const { mutateAsync: deleteRestDayDate, isPending: isDeleting } =
    useDeleteRestDayDate();

  const handleSave = async (payrollDate: Dayjs) => {
    try {
      await createRestDayDate({
        employeeId,
        payrollDate: payrollDate.format("YYYY-MM-DD"),
      });
      onClose();
      onSuccess();
      getNotify().success({
        message: "Rest Day Set",
        description: `${employeeName ?? employeeId} — ${payrollDate.format("MMM DD, YYYY")} is now set as a rest day.`,
      });
    } catch {
      getNotify().error({
        message: "Save Failed",
        description: "Failed to set the rest day date. Please try again.",
      });
    }
  };

  const handleDelete = async (id: string, payrollDate: string) => {
    try {
      await deleteRestDayDate(id);
      onSuccess();
      getNotify().success({
        message: "Rest Day Removed",
        description: `${dayjs(payrollDate).format("MMM DD, YYYY")} is no longer set as a rest day.`,
      });
    } catch {
      getNotify().error({
        message: "Delete Failed",
        description: "Failed to remove the rest day date. Please try again.",
      });
    }
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      title={
        <div>
          <div>Set Restday Date</div>
          <div style={{ fontSize: 13, fontWeight: 400, color: "#8c8c8c" }}>
            {employeeName ?? employeeId}
          </div>
        </div>
      }
      destroyOnClose
    >
      {/* Remounted fresh on every open (destroyOnClose), so the date field
          always defaults back to this DTR row's date. */}
      <SetRestDayForm
        workDate={workDate}
        isSubmitting={isSubmitting}
        onCancel={onClose}
        onSave={handleSave}
      />

      <div className="mt-5">
        <div className="mb-2" style={{ fontSize: 13, color: "#8c8c8c" }}>
          Previously set rest days
        </div>
        <List
          size="small"
          loading={isLoadingExisting}
          bordered
          dataSource={existingRestDays}
          locale={{
            emptyText: (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="No rest days set yet"
              />
            ),
          }}
          renderItem={(item) => (
            <List.Item
              actions={[
                <Popconfirm
                  key="delete"
                  title="Remove rest day"
                  description={`Remove ${dayjs(item.payrollDate).format("MMM DD, YYYY")} as a rest day?`}
                  okText="Remove"
                  okButtonProps={{ danger: true }}
                  cancelText="Cancel"
                  onConfirm={() => handleDelete(item.id, item.payrollDate)}
                >
                  <Button
                    type="text"
                    danger
                    size="small"
                    icon={<DeleteOutlined />}
                    loading={isDeleting}
                  />
                </Popconfirm>,
              ]}
            >
              {dayjs(item.payrollDate).format("MMM DD, YYYY (ddd)")}
            </List.Item>
          )}
        />
      </div>
    </Modal>
  );
}

interface FormProps {
  workDate: string;
  isSubmitting: boolean;
  onCancel: () => void;
  onSave: (payrollDate: Dayjs) => void;
}

function SetRestDayForm({
  workDate,
  isSubmitting,
  onCancel,
  onSave,
}: FormProps) {
  const [payrollDate, setPayrollDate] = useState<Dayjs | null>(dayjs(workDate));

  const handleOk = () => {
    if (!payrollDate) {
      getNotify().warning({ message: "Select the rest day date." });
      return;
    }
    onSave(payrollDate);
  };

  return (
    <>
      <Form layout="vertical">
        <Form.Item label="Rest Day Date" required className="mb-0">
          <DatePicker
            style={{ width: "100%" }}
            value={payrollDate}
            onChange={(d) => setPayrollDate(d ?? null)}
          />
        </Form.Item>
      </Form>

      <div className="flex justify-end gap-2 mt-5">
        <Button onClick={onCancel}>Cancel</Button>
        <Button type="primary" loading={isSubmitting} onClick={handleOk}>
          Save
        </Button>
      </div>
    </>
  );
}
