import { Button, message, Form, Popconfirm } from 'antd';
import React, { useState, useRef } from 'react';
import {
  PageContainer,
  FooterToolbar,
  ProTable,
  DrawerForm,
  ProFormText,
  ProFormSwitch,
} from '@ant-design/pro-components';
import type { ProColumns, ActionType } from '@ant-design/pro-components';
import { PlusOutlined } from '@ant-design/icons';
import { DeployDetail } from './detail';
import { addUser, removeUser, updateUser, userList } from '@/services/user';

const handleAdd = async (fields: API.User) => {
  const hide = message.loading('正在添加');
  try {
    await addUser({
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

const handleUpdate = async (fields: API.User) => {
  const hide = message.loading('正在更新');
  try {
    await updateUser({
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
const handleRemove = async (selectedRows: API.User[]) => {
  const hide = message.loading('正在删除');
  if (!selectedRows) return true;
  try {
    await removeUser({
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

const UserList: React.FC = () => {
  const [showDetail, setShowDetail] = useState<boolean>(false);
  const actionRef = useRef<ActionType>();
  const [currentRow, setCurrentRow] = useState<API.User>();
  const [selectedRowsState, setSelectedRows] = useState<API.User[]>([]);
  const [editForm] = Form.useForm();
  const [createModalVisible, handleModalVisible] = useState<boolean>(false);
  const [form] = Form.useForm<{ name: string; company: string }>();
  const postImagesRef = useRef<API.Image[]>();

  const columns: ProColumns<API.User>[] = [
    {
      title: '用户id',
      dataIndex: 'id',
      hideInForm: true,
      hideInTable: true,
      hideInSearch: true,
      copyable: true,
    },
    {
      title: '用户名',
      dataIndex: 'username',
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
      title: '是否可用',
      dataIndex: 'enable',
      hideInForm: true,
      ellipsis: true,
      hideInTable: true,
      hideInSearch: true,
      valueType: 'text',
      render(_, entity) {
        return entity.enable ? '是' : '否';
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
            editForm.setFieldsValue({
              ...record,
            });
            handleModalVisible(true);
          }}
        >
          编辑
        </Button>,
        <Popconfirm
          key={`popconfirm-${record.username}`}
          title={`删除${record.username}?`}
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
      <ProTable<API.User, API.PageParams>
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
        request={userList}
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
            } as API.User);
          } else {
            success = await handleAdd({
              ...value,
            } as API.User);
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
        <ProFormText name="username" label="用户名"></ProFormText>
        <ProFormText name="password" label="密码"></ProFormText>
        <ProFormSwitch name="enable" label="是否可用"></ProFormSwitch>
        <ProFormSwitch name="is_locked" label="是否锁定？"></ProFormSwitch>
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

export default UserList;
