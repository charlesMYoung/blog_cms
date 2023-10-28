import { Button, message, Form, Tag, Popconfirm } from 'antd';
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
  ProFormSwitch,
} from '@ant-design/pro-components';
import type { ProColumns, ActionType } from '@ant-design/pro-components';
import { PlusOutlined } from '@ant-design/icons';
import { DeployDetail } from './detail';
import {
  addDevice,
  getDevice,
  removeDevice,
  updateDevice,
  addScope,
  getScope,
} from '@/services/device';
import { ConfirmCate } from '@/components/ConfirmCategory';

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
const handleRemove = async (selectedRows: API.Device[]) => {
  const hide = message.loading('正在删除');
  if (!selectedRows) return true;
  try {
    await removeDevice({
      data: {
        ids: selectedRows.map((row) => row.client_id),
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

const PostList: React.FC = () => {
  const [showDetail, setShowDetail] = useState<boolean>(false);
  const actionRef = useRef<ActionType>();
  const [currentRow, setCurrentRow] = useState<API.Device>();
  const [selectedRowsState, setSelectedRows] = useState<API.Device[]>([]);
  const [editForm] = Form.useForm();
  const [createModalVisible, handleModalVisible] = useState<boolean>(false);
  const [form] = Form.useForm<{ name: string; company: string }>();
  const postImagesRef = useRef<API.Image[]>();
  const [showScopeDialog, setShowScopeDialog] = useState<boolean>(false);
  const [commonOpts, setCommonOpts] = useState<API.Scope[]>([]);

  const columns: ProColumns<API.Device>[] = [
    {
      title: 'id',
      dataIndex: 'client_id',
      hideInForm: true,
      hideInTable: true,
      hideInSearch: true,
      copyable: true,
    },
    {
      title: '设备名称',
      dataIndex: 'client_name',
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
      title: '是否锁定',
      dataIndex: 'is_locked',
      hideInForm: true,
      hideInSearch: true,
      valueType: 'text',
      render(_, entity) {
        return entity.is_locked ? '是' : '否';
      },
    },
    {
      title: '授权类型',
      dataIndex: 'authorized_grant_types',
      hideInForm: true,
      ellipsis: true,
      hideInTable: true,
      hideInSearch: true,
      valueType: 'text',
      render(_, entity) {
        return entity.authorized_grant_types.split(',')?.map((item) => {
          return (
            <Tag color="blue" key={item}>
              {item}
            </Tag>
          );
        });
      },
    },
    {
      title: 'access token有效期',
      dataIndex: 'access_token_validity',
      // hideInForm: true,
      ellipsis: true,
      hideInTable: true,
      hideInSearch: true,
      valueType: 'text',
    },
    {
      title: 'refresh token有效期',
      dataIndex: 'refresh_token_validity',
      // hideInForm: true,
      ellipsis: true,
      hideInTable: true,
      hideInSearch: true,
      valueType: 'text',
    },
    {
      title: '地址跳转',
      dataIndex: 'web_server_redirect_uri',
      hideInForm: true,
      ellipsis: true,
      hideInTable: true,
      hideInSearch: true,
      valueType: 'text',
      copyable: true,
    },
    {
      title: '授权密钥',
      dataIndex: 'client_secret',
      hideInForm: true,
      ellipsis: true,
      hideInTable: true,
      copyable: true,
      hideInSearch: true,
      valueType: 'text',
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
            const { data } = await getScope({ client_id: record.client_id });
            editForm.setFieldsValue({
              ...record,
              scope_ids: data,
              authorized_grant_types: record.authorized_grant_types.split(','),
            });
            handleModalVisible(true);
          }}
        >
          编辑
        </Button>,
        <Popconfirm
          key={`popconfirm-${record.client_id}`}
          title={`删除${record.client_name}?`}
          onConfirm={async () => {
            await handleRemove([record]);
            actionRef.current?.reloadAndRest?.();
          }}
          okText="Yes"
          cancelText="No"
        >
          <Button danger type="link" key="delete">
            删除
          </Button>
        </Popconfirm>,
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
              postImagesRef.current = [];
              editForm.setFieldsValue({
                is_locked: false,
                access_token_validity: 1800,
                refresh_token_validity: 604800,
              });
              handleModalVisible(true);
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
          if (formData && formData.client_id) {
            success = await handleUpdate({
              ...formData,
              authorized_grant_types: formData.authorized_grant_types.join(','),
            } as API.Post);
          } else {
            success = await handleAdd({
              ...value,
              authorized_grant_types: value.authorized_grant_types.join(','),
            } as API.Device);
          }
          if (success) {
            handleModalVisible(false);
            if (actionRef.current) {
              actionRef.current.reload();
            }
          }
        }}
      >
        <ProFormText name="client_id" hidden />
        <ProFormText name="client_name" label="设备名称"></ProFormText>
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
        <ConfirmCate
          title={'添加授权范围'}
          showOpen={showScopeDialog}
          onClose={() => {
            setShowScopeDialog(false);
          }}
          onFinish={async ({ name }) => {
            await addScope({
              data: {
                name: name,
              },
            });
            setShowScopeDialog(false);
            message.success('提交成功');
          }}
        ></ConfirmCate>
        <ProFormSelect
          mode="tags"
          label={
            <>
              {'授权范围'}
              &nbsp;
              <Button
                type="dashed"
                size="small"
                icon={<PlusOutlined />}
                onClick={() => {
                  setShowScopeDialog(true);
                }}
              ></Button>
            </>
          }
          name="scope_ids"
          fieldProps={{
            searchOnFocus: true,
            async onDropdownVisibleChange(open) {
              if (open) {
                const { data } = await getScope();
                setCommonOpts(data);
              }
            },
          }}
          options={
            Array.isArray(commonOpts)
              ? commonOpts.map((item) => {
                  return {
                    label: item.scope,
                    value: item.id,
                  };
                })
              : []
          }
        ></ProFormSelect>
        <ProFormSwitch name="is_locked" label="是否锁定？"></ProFormSwitch>
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
