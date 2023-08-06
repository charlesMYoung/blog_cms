import { getPostDetail } from '@/services/post';
import type { ActionType, ProColumns, ProDescriptionsItemProps } from '@ant-design/pro-components';
import { ProDescriptions } from '@ant-design/pro-components';
import { Viewer } from '@bytemd/react';
import breaks from '@bytemd/plugin-breaks';
import frontMatter from '@bytemd/plugin-frontmatter';
import gemoji from '@bytemd/plugin-gemoji';
import gfm from '@bytemd/plugin-gfm';
import highlight from '@bytemd/plugin-highlight';
import byteMath from '@bytemd/plugin-math';
import mermaid from '@bytemd/plugin-mermaid';
import { Drawer } from 'antd';
import { useRef } from 'react';

const plugins = [
  gfm(),
  breaks(),
  gemoji(),
  highlight({
    init(hljs) {
      console.log('hljs', hljs);
    },
  }),
  byteMath(),
  mermaid(),
  frontMatter(),
];

export function DeployDetail({
  open,
  onClose,
  currentRow,
  columns,
}: {
  open: boolean;
  onClose: () => void;
  currentRow?: API.Post;
  columns: ProColumns<API.Post>[];
}) {
  const ref = useRef<ActionType>();

  return (
    <Drawer width="50%" open={open} onClose={onClose} closable={false}>
      {currentRow?.id && (
        <>
          <ProDescriptions<API.Post>
            column={1}
            actionRef={ref}
            title={currentRow?.title}
            request={getPostDetail}
            params={{
              id: currentRow?.id,
            }}
            columns={columns as ProDescriptionsItemProps<API.Post>[]}
          />
          <Viewer value={currentRow.content} plugins={plugins}></Viewer>
        </>
      )}
    </Drawer>
  );
}
