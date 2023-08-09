import React, { useRef } from 'react';
import { ActionType, PageContainer, ProList } from '@ant-design/pro-components';
import { getImageInfo, removeImage } from '@/services/images';
import { Image, Space, Tag } from 'antd';

const Images: React.FC = () => {
  const imageRef = useRef<ActionType>();

  return (
    <PageContainer>
      <ProList<API.Image, API.PageParams>
        actionRef={imageRef}
        request={getImageInfo}
        itemCardProps={{}}
        pagination={{
          defaultPageSize: 8,
        }}
        rowKey={'id'}
        showActions="hover"
        rowSelection={{}}
        grid={{ gutter: 16, column: 2 }}
        metas={{
          title: {
            dataIndex: 'id',
          },
          subTitle: {
            dataIndex: 'type',
            render: (_, row) => {
              return (
                <Space size={0}>
                  <Tag color="blue">{row.type}</Tag>
                  {row.post_id ? <Tag color="red">占用</Tag> : <Tag color="blue">未占用</Tag>}
                </Space>
              );
            },
          },
          type: {
            dataIndex: 'type',
          },
          avatar: {},
          content: {
            render: (_, row) => {
              return <Image src={row.url}>{row.type}</Image>;
            },
          },
          actions: {
            cardActionProps: 'extra',
            render: (_, row) => {
              return [
                <a
                  key="delete"
                  onClick={async () => {
                    await removeImage({
                      data: {
                        ids: [row.id],
                      },
                    });
                    imageRef.current?.reload();
                  }}
                >
                  删除
                </a>,
              ];
            },
          },
        }}
        headerTitle="所有图片"
      />
    </PageContainer>
  );
};

export default Images;
