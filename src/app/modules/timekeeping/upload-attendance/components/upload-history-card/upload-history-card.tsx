import { useMemo, useState } from "react";
import { Button, Card, Input, Modal, Typography } from "antd";
import { HistoryOutlined, ReloadOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { MobileRangePicker } from "@/shared/components/mobile-range-picker";
import { useHasPermission } from "@/shared/hooks/use-has-permission";
import { getNotify } from "@/shared/utils/notify";
import {
  DELETE_UPLOAD_BATCH_PERMISSION,
  VIEW_UPLOAD_BATCH_PERMISSION,
} from "@/app/modules/timekeeping/attendance-entry/constants/attendance-log-permissions.const";
import UploadBatchTable from "../upload-batch-table";
import UploadBatchChangesModal from "../upload-batch-changes-modal";
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
  const [changesBatch, setChangesBatch] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const canDelete = useHasPermission(DELETE_UPLOAD_BATCH_PERMISSION);
  const canViewChanges = useHasPermission(VIEW_UPLOAD_BATCH_PERMISSION);

  const {
    data: batches = [],
    isFetching,
    refetch,
  } = useUploadBatches(range, { enabled: open });

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return batches;
    return batches.filter((b) =>
      [b.remarks, b.deviceName, b.batchCode].some((v) =>
        (v ?? "").toLowerCase().includes(q),
      ),
    );
  }, [batches, search]);

  const totals = useMemo(
    () => ({
      uploads: filtered.length,
      logs: filtered.reduce((sum, b) => sum + b.logCount, 0),
      changed: filtered.reduce((sum, b) => sum + b.changedCount, 0),
    }),
    [filtered],
  );
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
    <Card className="mt-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Text strong className="block">
            Upload History
          </Text>
          <Text type="secondary">
            Review, inspect and delete past attendance file uploads.
          </Text>
        </div>
        <Button
          type="primary"
          icon={<HistoryOutlined />}
          onClick={() => setOpen(true)}
        >
          View upload history
        </Button>
      </div>

      <Modal
        title="Upload History"
        open={open}
        onCancel={() => setOpen(false)}
        footer={null}
        className="modal-fullscreen"
        destroyOnHidden
      >
        <div className="mb-3 flex flex-wrap items-center gap-2">
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
          <Input.Search
            allowClear
            placeholder="Search remarks, device or batch"
            className="w-full sm:w-72"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Button
            icon={<ReloadOutlined />}
            loading={isFetching}
            onClick={() => refetch()}
          >
            Refresh
          </Button>
        </div>
        <div className="mb-3 flex flex-wrap gap-2">
          {[
            ["Uploads", totals.uploads],
            ["Logs", totals.logs],
            ["Changed logs", totals.changed],
          ].map(([label, value]) => (
            <div
              key={label}
              className="rounded-lg border border-gray-200 px-4 py-2"
            >
              <Text type="secondary" className="block text-xs">
                {label}
              </Text>
              <Text strong className="text-lg">
                {Number(value).toLocaleString()}
              </Text>
            </div>
          ))}
        </div>
        <Text type="secondary" className="mb-3 block">
          Uploads with logs in the selected dates.
        </Text>
        <UploadBatchTable
          data={filtered}
          loading={isFetching}
          canDelete={canDelete}
          canViewChanges={canViewChanges}
          onViewChanges={setChangesBatch}
          deletingBatch={deletingBatch}
          onDelete={handleDelete}
        />
      </Modal>
      <UploadBatchChangesModal
        batchCode={changesBatch}
        onClose={() => setChangesBatch(null)}
      />
    </Card>
  );
}
