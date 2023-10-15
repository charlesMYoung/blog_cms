import { Button, message, Form, UploadFile, Tag, Image } from 'antd';
import React, { useState, useRef } from 'react';
import {
  PageContainer,
  FooterToolbar,
  ProTable,
  ProFormSelect,
  DrawerForm,
  ProFormText,
  ProFormDigit,
  ProFormGroup,
} from '@ant-design/pro-components';
import type { ProColumns, ActionType } from '@ant-design/pro-components';
import { PlusOutlined } from '@ant-design/icons';
import { DeployDetail } from './detail';
import isEmpty from 'lodash/isEmpty';
import { addImage, removeImage } from '@/services/images';
import { addDevice, getDevice, removeDevice, updateDevice } from '@/services/device';

const handleAdd = async (fields: API.Device) => {
  const hide = message.loading('正在添加');
  try {
    await addDevice({
      data: {
        ...fields,
      },
    });
    hide();
    message.success('新增成功');
    return true;
  } catch (error) {
    hide();
    return false;
  }
};

const handleUpdate = async (fields: API.Post) => {
  const hide = message.loading('正在更新');
  try {
    await updateDevice({
      data: {
        ...fields,
      },
    });
    hide();
    message.success('更新成功');
    return true;
  } catch (error) {
    hide();
    return false;
  }
};

/**
 *  Delete node
 * @zh-CN 删除节点
 *
 * @param selectedRows
 */
const handleRemove = async (selectedRows: API.Post[]) => {
  const hide = message.loading('正在删除');
  if (!selectedRows) return true;
  try {
    await removeDevice({
      data: {
        ids: selectedRows.map((row) => row.id),
      },
    });
    hide();
    message.success('删除成功');
    return true;
  } catch (error) {
    hide();
    message.error('删除失败，请重试');
    return false;
  }
};

const onEditUploadHandle = async (_files: File[]) => {
  console.log(_files);
  const file = _files[0];
  const formData = new FormData();
  if (file.name) formData.append('file', file);
  const {
    data: { url, name, id },
  } = await addImage({
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    data: formData,
  });
  return [
    {
      url,
      alt: `Nico_${id}`,
      title: `Nico_${name}`,
    },
  ];
};

const PostList: React.FC = () => {
  const [showDetail, setShowDetail] = useState<boolean>(false);
  const actionRef = useRef<ActionType>();
  const [currentRow, setCurrentRow] = useState<API.Post>();
  const [selectedRowsState, setSelectedRows] = useState<API.Post[]>([]);
  const [editForm] = Form.useForm();
  const [createModalVisible, handleModalVisible] = useState<boolean>(false);
  const [form] = Form.useForm<{ name: string; company: string }>();
  const postImagesRef = useRef<API.Image[]>();
  const [imageList, setImageList] = useState<UploadFile[]>([]);

  const [postContent, setPostContent] = useState<string>('');

  const onRemoveHandle = async (imageId: string) => {
    // postImagesRef.current = [];
    await removeImage({
      data: {
        ids: [imageId],
      },
    });
    message.success('删除图片成功');
    postImagesRef.current = postImagesRef.current?.filter((item) => item.id !== imageId);
  };
  const onUploadHandle = (
    postCoverImage: API.Image,
    newFiles: UploadFile[],
    uploadStatus?: string,
  ) => {
    setImageList(newFiles);
    if (uploadStatus !== 'done') {
      return;
    }
    const hasExistPostImage = postImagesRef.current?.find((item) => item.id !== postCoverImage.id);
    if (!hasExistPostImage) {
      postImagesRef.current?.push(postCoverImage);
    }
    postImagesRef.current?.forEach((item) => {
      if (item.id === postCoverImage.id) {
        item.type = 'COVER';
      } else {
        item.type = 'POST';
      }
    });
  };

  const columns: ProColumns<API.Post>[] = [
    {
      title: 'id',
      dataIndex: 'id',
      hideInForm: true,
      hideInTable: true,
      hideInSearch: true,
    },

    {
      title: '博客标题',
      dataIndex: 'title',
      hideInForm: true,
      render: (dom, entity) => {
        return (
          <a
            onClick={() => {
              if (entity) {
                setCurrentRow(entity);
                setShowDetail(true);
              }
            }}
          >
            {dom}
          </a>
        );
      },
    },
    {
      title: '博客分类',
      dataIndex: 'category',
      hideInForm: true,
      hideInTable: true,
      hideInSearch: true,
      valueType: 'text',
      render(dom, entity) {
        return entity.category?.name;
      },
    },
    {
      title: '博客标签',
      dataIndex: 'tags',
      hideInForm: true,
      hideInTable: true,
      hideInSearch: true,
      valueType: 'text',
      render(dom, entity) {
        return entity.tags?.map((item) => {
          return (
            <Tag color="blue" key={item.tag.id}>
              {item.tag.name}
            </Tag>
          );
        });
      },
    },
    {
      title: '海报',
      dataIndex: 'images',
      hideInForm: true,
      hideInTable: true,
      hideInSearch: true,
      valueType: 'image',
      render(dom, entity) {
        const imageUrl = entity.images.find((item) => item.type === 'COVER')?.url;
        return imageUrl ? <Image src={imageUrl} width="400px"></Image> : '暂无图片';
      },
    },
    {
      title: '描述',
      dataIndex: 'description',
      hideInForm: true,
      ellipsis: true,
      hideInTable: true,
      hideInSearch: true,
      valueType: 'textarea',
    },
    {
      title: '是否发布',
      dataIndex: 'is_release',
      hideInForm: true,
      ellipsis: true,
      onFilter: true,
      filters: true,
      hideInSearch: true,
      render(_, entity) {
        return <>{entity.is_release ? '是' : '否'}</>;
      },
    },
    {
      title: '创建时间',
      hideInForm: true,
      valueType: 'dateTime',
      dataIndex: 'created_at',
      sorter: true,
    },
    {
      title: '更新时间',
      sorter: true,
      hideInForm: true,
      valueType: 'dateTime',
      dataIndex: 'modified_at',
    },
    {
      title: '操作',
      dataIndex: 'option',
      valueType: 'option',
      render: (_, record) => [
        <Button
          key="edit"
          type="link"
          onClick={async () => {
            postImagesRef.current = [];
            const coverImage =
              record.images?.find((item) => item.type === 'COVER') || ({} as API.Image);
            // 不为空的时候才push
            if (!isEmpty(coverImage)) {
              postImagesRef.current?.push(coverImage);
            }
            if (postImagesRef.current.length === 1) {
              setImageList([
                {
                  uid: coverImage.id,
                  name: coverImage.name,
                  status: 'done',
                  url: coverImage.url,
                },
              ]);
            } else {
              setImageList([]);
            }

            editForm.setFieldsValue({
              ...record,
              category_id: record?.category?.id || '',
              tag_ids: record?.tags?.map((item) => item.tag.id) || [],
            });

            setPostContent(record.content);
            handleModalVisible(true);
          }}
        >
          编辑
        </Button>,
        <Button
          danger
          type="link"
          key="delete"
          onClick={async () => {
            await handleRemove([record]);
            actionRef.current?.reloadAndRest?.();
          }}
        >
          删除
        </Button>,
      ],
    },
  ];
  return (
    <PageContainer>
      <ProTable<API.Device, API.PageParams>
        headerTitle="设备列表"
        actionRef={actionRef}
        rowKey="id"
        search={{
          labelWidth: 120,
        }}
        toolBarRender={() => [
          <Button
            type="primary"
            key="primary"
            onClick={() => {
              editForm.resetFields();
              form.resetFields();
              setPostContent('');
              postImagesRef.current = [];
              handleModalVisible(true);
              setImageList([]);
            }}
          >
            <PlusOutlined /> 新增设备
          </Button>,
        ]}
        request={getDevice}
        columns={columns}
        rowSelection={{
          onChange: (_, selectedRows) => {
            setSelectedRows(selectedRows);
          },
        }}
      />
      {selectedRowsState?.length > 0 && (
        <FooterToolbar
          extra={
            <div>
              选择 <a style={{ fontWeight: 600 }}>{selectedRowsState.length}</a> 项 &nbsp;&nbsp;
            </div>
          }
        >
          <Button
            danger
            onClick={async () => {
              await handleRemove(selectedRowsState);
              setSelectedRows([]);
              actionRef.current?.reloadAndRest?.();
            }}
          >
            批量删除
          </Button>
        </FooterToolbar>
      )}
      <DrawerForm
        width={'40%'}
        title="新增设备"
        form={editForm}
        open={createModalVisible}
        onOpenChange={handleModalVisible}
        onFinish={async (value) => {
          const formData = await editForm.validateFields();
          let success;
          console.log('value----', value);
          if (formData && formData.id) {
            success = await handleUpdate({
              ...formData,
            } as API.Post);
          } else {
            success = await handleAdd(value as API.Device);
          }
          if (success) {
            handleModalVisible(false);
            if (actionRef.current) {
              actionRef.current.reload();
            }
          }
        }}
      >
        <ProFormText name="id" hidden />
        <ProFormText name="name" label="设备名称"></ProFormText>
        <ProFormText name="web_server_redirect_uri" label="跳转地址"></ProFormText>
        <ProFormSelect
          mode="tags"
          label="授权类型"
          name="authorized_grant_types"
          options={[
            {
              label: '授权码模式',
              value: 'authorization_code',
            },
            {
              label: '密码模式',
              value: 'password',
            },
            {
              label: '客户端模式',
              value: 'client_credentials',
            },
            {
              label: '刷新token',
              value: 'refresh_token',
            },
          ]}
        ></ProFormSelect>
        <ProFormGroup title="令牌有效期">
          <ProFormDigit name="access_token_validity" label="访问令牌" min={1}></ProFormDigit>
          <ProFormDigit name="refresh_token_validity" label="刷新令牌" min={1}></ProFormDigit>
        </ProFormGroup>
      </DrawerForm>

      <DeployDetail
        open={showDetail}
        onClose={() => {
          setCurrentRow(undefined);
          setShowDetail(false);
        }}
        columns={columns}
        currentRow={currentRow}
      />
    </PageContainer>
  );
};

export default PostList;
