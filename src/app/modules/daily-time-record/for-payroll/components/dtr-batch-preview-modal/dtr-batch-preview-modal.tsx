import { Modal } from "antd";
import { useDtrSummaryByBatch } from "@/app/modules/daily-time-record/summary/hooks/use-dtr-summary-queries";
import DtrSummaryTable from "@/app/modules/daily-time-record/summary/components/dtr-summary-table";

interface Props {
  open: boolean;
  onClose: () => void;
  batchCode: string | null;
}

export default function DtrBatchPreviewModal({
  open,
  onClose,
  batchCode,
}: Props) {
  const { data: records = [], isLoading } = useDtrSummaryByBatch(
    batchCode ?? "",
    { enabled: open && !!batchCode },
  );

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width="90vw"
      title={batchCode ? `DTR Batch — ${batchCode}` : "DTR Batch"}
      destroyOnClose
    >
      <DtrSummaryTable data={records} loading={isLoading} />
    </Modal>
  );
}
