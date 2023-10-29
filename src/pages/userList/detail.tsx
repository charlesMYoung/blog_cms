import { getUserDetail } from '@/services/user';
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
  currentRow?: API.User;
  columns: ProColumns<API.User>[];
}) {
  const ref = useRef<ActionType>();

  return (
    <Drawer width="80%" open={open} onClose={onClose} closable={false}>
      {currentRow?.id && (
        <>
          <ProDescriptions<API.User>
            column={1}
            actionRef={ref}
            title={currentRow?.username}
            request={getUserDetail}
            params={{
              id: currentRow?.id,
            }}
            columns={columns as ProDescriptionsItemProps<API.User>[]}
          />
        </>
      )}
    </Drawer>
  );
}
