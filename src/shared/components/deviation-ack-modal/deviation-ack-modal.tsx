import { useState } from "react";
import { Alert, Button, Checkbox, Modal, Table, Typography } from "antd";
import { WarningOutlined } from "@ant-design/icons";
import {
  useDeviationAckStore,
  type StatutoryDeviation,
} from "@/core/stores/deviation-ack.store";
import { TermsLink } from "@/app/modules/legal/components/terms-link";
import { DEVIATION_ACK_LABEL } from "./label.const";

const { Paragraph, Text } = Typography;

const COLUMNS = [
  {
    title: DEVIATION_ACK_LABEL.COL_SETTING,
    dataIndex: "label",
    key: "label",
    render: (label: string, row: StatutoryDeviation) => (
      <div>
        <Text strong>{label}</Text>
        <div className="text-xs text-gray-500">{row.note}</div>
      </div>
    ),
  },
  {
    title: DEVIATION_ACK_LABEL.COL_STATUTORY,
    dataIndex: "statutoryValue",
    key: "statutoryValue",
  },
  {
    title: DEVIATION_ACK_LABEL.COL_CONFIGURED,
    dataIndex: "configuredValue",
    key: "configuredValue",
    render: (value: string) => <Text type="danger">{value}</Text>,
  },
];

/**
 * Asks an admin to acknowledge settings that differ from the Philippine statutory (DOLE) defaults
 * before they are saved (see withDeviationAck). The confirmation is recorded by hrms-api with who,
 * when and the values. Mounted once in the main layout.
 */
export function DeviationAckModal() {
  const pending = useDeviationAckStore((s) => s.pending);
  const answer = useDeviationAckStore((s) => s.answer);
  const [checked, setChecked] = useState(false);

  const close = (acknowledged: boolean) => {
    setChecked(false);
    answer(acknowledged);
  };

  return (
    <Modal
      open={!!pending}
      width={720}
      title={
        <span>
          <WarningOutlined className="mr-2 text-amber-500" />
          {DEVIATION_ACK_LABEL.TITLE}
        </span>
      }
      onCancel={() => close(false)}
      maskClosable={false}
      footer={[
        <Button key="cancel" onClick={() => close(false)}>
          {DEVIATION_ACK_LABEL.CANCEL}
        </Button>,
        <Button
          key="confirm"
          type="primary"
          danger
          disabled={!checked}
          onClick={() => close(true)}
        >
          {DEVIATION_ACK_LABEL.CONFIRM}
        </Button>,
      ]}
    >
      <Paragraph>{DEVIATION_ACK_LABEL.INTRO}</Paragraph>
      <Table
        size="small"
        rowKey="key"
        pagination={false}
        columns={COLUMNS}
        dataSource={pending?.deviations ?? []}
        scroll={{ x: true }}
      />
      <Alert
        className="mt-4"
        type="warning"
        showIcon
        message={DEVIATION_ACK_LABEL.RESPONSIBILITY}
        description={
          <span>
            {DEVIATION_ACK_LABEL.RESPONSIBILITY_DETAIL}{" "}
            <TermsLink section={4}>{DEVIATION_ACK_LABEL.TERMS_LINK}</TermsLink>
          </span>
        }
      />
      <Checkbox
        className="mt-4"
        checked={checked}
        onChange={(e) => setChecked(e.target.checked)}
      >
        {DEVIATION_ACK_LABEL.CHECKBOX}
      </Checkbox>
    </Modal>
  );
}
