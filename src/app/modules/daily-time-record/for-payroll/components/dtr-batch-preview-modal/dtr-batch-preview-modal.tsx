import { Modal, Typography } from "antd";
import { useDtrSummaryByBatch } from "@/app/modules/daily-time-record/summary/hooks/use-dtr-summary-queries";
import DtrSummaryTable from "@/app/modules/daily-time-record/summary/components/dtr-summary-table";

const { Text } = Typography;

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
      className="modal-fullscreen"
      title={
        batchCode ? (
          <Text
            ellipsis={{ tooltip: batchCode }}
            className="block max-w-[calc(100%-32px)] text-sm sm:text-base"
          >
            {batchCode}
          </Text>
        ) : (
          "DTR Batch"
        )
      }
      destroyOnClose
    >
      <DtrSummaryTable data={records} loading={isLoading} />
    </Modal>
  );
}
