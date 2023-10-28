import { getDeviceDetail } from '@/services/device';
import type { ActionType, ProColumns, ProDescriptionsItemProps } from '@ant-design/pro-components';
import { ProDescriptions } from '@ant-design/pro-components';
import { Drawer } from 'antd';
import { useRef } from 'react';

export function DeployDetail({
  open,
  onClose,
  currentRow,
  columns,
}: {
  open: boolean;
  onClose: () => void;
  currentRow?: API.Device;
  columns: ProColumns<API.Device>[];
}) {
  const ref = useRef<ActionType>();

  return (
    <Drawer width="80%" open={open} onClose={onClose} closable={false}>
      {currentRow?.client_id && (
        <>
          <ProDescriptions<API.Device>
            column={1}
            actionRef={ref}
            title={currentRow?.client_name}
            request={getDeviceDetail}
            params={{
              id: currentRow?.client_id,
            }}
            columns={columns as ProDescriptionsItemProps<API.Device>[]}
          />
        </>
      )}
    </Drawer>
  );
}
