import { DrawerForm, ProForm, ProFormText } from '@ant-design/pro-components';
import React from 'react';

export interface ConfirmCategoryProps {
  showOpen: boolean;
  title: string;
  onClose: () => void;
  onFinish: (formData: { name: string }) => Promise<any>;
}

export const ConfirmCate = ({ showOpen, onClose, onFinish, title }: ConfirmCategoryProps) => {
  return (
    <DrawerForm<{
      name: string;
    }>
      title={title}
      open={showOpen}
      autoFocusFirstInput
      drawerProps={{
        destroyOnClose: true,
        onClose,
      }}
      submitTimeout={2000}
      onFinish={onFinish}
    >
      <ProForm.Group>
        <ProFormText
          width="xl"
          name="name"
          label="名称"
          tooltip="最长为 24 位"
          placeholder="请输入名称"
        />
      </ProForm.Group>
    </DrawerForm>
  );
};
