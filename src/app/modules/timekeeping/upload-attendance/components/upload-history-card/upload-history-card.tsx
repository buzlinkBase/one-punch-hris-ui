import { useState } from "react";
import { Card, Typography } from "antd";
import dayjs from "dayjs";
import { MobileRangePicker } from "@/shared/components/mobile-range-picker";
import { useHasPermission } from "@/shared/hooks/use-has-permission";
import { getNotify } from "@/shared/utils/notify";
import { DELETE_UPLOAD_BATCH_PERMISSION } from "@/app/modules/timekeeping/attendance-entry/constants/attendance-log-permissions.const";
import UploadBatchTable from "../upload-batch-table";
import {
  useDeleteUploadBatch,
  useUploadBatches,
} from "../../hooks/use-upload-attendance-queries";

const { Text } = Typography;

const DATE_FORMAT = "YYYY-MM-DD";

/**
 * Past attendance file uploads with a log in the chosen dates. Deleting one removes all of its
 * logs and the saved originals of any that were edited or removed, so the file can be
 * re-imported from scratch. An upload whose logs a saved DTR already covers can't be deleted
 * until that DTR is.
 */
export default function UploadHistoryCard() {
  const [range, setRange] = useState({
    fromDate: dayjs().subtract(30, "day").format(DATE_FORMAT),
    toDate: dayjs().format(DATE_FORMAT),
  });
  const [deletingBatch, setDeletingBatch] = useState<string | null>(null);
  const canDelete = useHasPermission(DELETE_UPLOAD_BATCH_PERMISSION);

  const { data: batches = [], isFetching } = useUploadBatches(range);
  const { mutateAsync: deleteBatch } = useDeleteUploadBatch();

  const handleDelete = async (batchCode: string) => {
    setDeletingBatch(batchCode);
    try {
      await deleteBatch(batchCode);
      getNotify().success({
        message: "Upload deleted.",
        description: "Regenerate the DTR for the affected days to apply it.",
      });
    } catch {
      // The error interceptor already shows the server's reason (e.g. a saved DTR covers it).
    } finally {
      setDeletingBatch(null);
    }
  };

  return (
    <Card
      className="mt-4"
      title="Upload History"
      extra={
        <MobileRangePicker
          allowClear={false}
          value={[dayjs(range.fromDate), dayjs(range.toDate)]}
          onChange={(dates) => {
            if (!dates?.[0] || !dates?.[1]) return;
            setRange({
              fromDate: dates[0].format(DATE_FORMAT),
              toDate: dates[1].format(DATE_FORMAT),
            });
          }}
        />
      }
    >
      <Text type="secondary" className="mb-3 block">
        Uploads with logs in the selected dates.
      </Text>
      <UploadBatchTable
        data={batches}
        loading={isFetching}
        canDelete={canDelete}
        deletingBatch={deletingBatch}
        onDelete={handleDelete}
      />
    </Card>
  );
}
