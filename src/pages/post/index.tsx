import { Button, message, Form, UploadFile, Tag, Image } from 'antd';
import React, { useState, useRef, useEffect } from 'react';
import 'juejin-markdown-themes/dist/juejin.min.css';
import {
  PageContainer,
  FooterToolbar,
  ProTable,
  ProFormTextArea,
  ProFormSelect,
  ProFormSwitch,
  DrawerForm,
  ProFormText,
  ProFormGroup,
} from '@ant-design/pro-components';
import type { ProColumns, ActionType } from '@ant-design/pro-components';
import {
  addPost,
  removePost,
  getPostInfo,
  getCategory,
  addCategory,
  addTags,
  updatePost,
  getTags,
} from '@/services/post';
import { PlusOutlined } from '@ant-design/icons';
import { DeployDetail } from './detail';
import breaks from '@bytemd/plugin-breaks';
import frontMatter from '@bytemd/plugin-frontmatter';
import gemoji from '@bytemd/plugin-gemoji';
import gfm from '@bytemd/plugin-gfm';
import highlight from '@bytemd/plugin-highlight';
import byteMath from '@bytemd/plugin-math';
import zoom from '@bytemd/plugin-medium-zoom';
import mermaid from '@bytemd/plugin-mermaid';
import { UploadImage } from '@/components/UploadImage';
import { Editor } from '@bytemd/react';
import throttle from 'lodash/throttle';
import isEmpty from 'lodash/isEmpty';
import { addImage, removeImage } from '@/services/images';
import { ConfirmCate } from '@/components/ConfirmCategory';

const plugins = [
  gfm(),
  breaks(),
  gemoji(),
  highlight(),
  byteMath(),
  zoom(),
  mermaid(),
  frontMatter(),
];

const handleAdd = async (fields: API.Post) => {
  const hide = message.loading('正在添加');
  try {
    await addPost({
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

async function getAllCategory() {
  const { data } = await getCategory();
  return data.map((item: API.Category) => {
    return {
      value: item.id,
      label: item.name,
    };
  });
}

async function getAllTags() {
  const { data } = await getTags();
  return data.map((item: API.Tag) => {
    return {
      value: item.id,
      label: item.name,
    };
  });
}

const handleUpdate = async (fields: API.Post) => {
  const hide = message.loading('正在更新');
  try {
    await updatePost({
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
    await removePost({
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

const getImagesFromPostContent = (postContent: string) => {
  const images: { id: string; type: string }[] = [];
  const regex = /!\[(.*?)\]\((.*?)\)/g;
  let result;
  while ((result = regex.exec(postContent))) {
    const originId = result[1];
    if (originId && originId.startsWith('Nico_')) {
      const [, imageId] = originId.split('Nico_');
      const image = {
        type: 'POST',
        id: imageId,
      };
      images.push(image);
    }
  }
  return images;
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
  const [showCategoryModal, setShowCategoryModal] = useState<boolean>(false);
  const [showTagModal, setShowTagModal] = useState<boolean>(false);
  const postImagesRef = useRef<API.Image[]>();
  const [imageList, setImageList] = useState<UploadFile[]>([]);
  const [commonOpts, setCommonOpts] = useState<any>([]);
  const [tagOpts, setTagOpts] = useState<any>([]);

  const [postContent, setPostContent] = useState<string>('');

  const initTagAndCategory = async () => {
    const catas = await getAllCategory();
    const tags = await getAllTags();
    setCommonOpts(catas);
    setTagOpts(tags);
  };

  useEffect(() => {
    if (createModalVisible) initTagAndCategory();
  }, []);

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
      <ProTable<API.Post, API.PageParams>
        headerTitle="部署列表"
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
            <PlusOutlined /> 新增文章
          </Button>,
        ]}
        request={getPostInfo}
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
        width={'90%'}
        title="新增博客"
        form={editForm}
        open={createModalVisible}
        onOpenChange={handleModalVisible}
        onFinish={async (value) => {
          const formData = await editForm.validateFields();
          let success;
          value.images = [];
          value.content = postContent;
          const postImages = getImagesFromPostContent(postContent);
          if (postImagesRef.current) {
            value.images = [...postImagesRef.current] || [];
          }
          value.images = [...value.images, ...postImages];
          value.is_release = !!value.is_release;

          if (formData && formData.id) {
            success = await handleUpdate({
              ...formData,
              ...value,
            } as API.Post);
          } else {
            success = await handleAdd(value as API.Post);
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
        <div
          style={{
            position: 'relative',
            zIndex: 999,
          }}
        >
          <Editor
            value={postContent}
            plugins={plugins}
            uploadImages={onEditUploadHandle}
            onChange={throttle((markContent: string) => {
              setPostContent(markContent);
            }, 2000)}
          ></Editor>
        </div>
        <ProFormGroup title={'封面海报'}>
          <UploadImage
            onRemove={onRemoveHandle}
            onUpload={onUploadHandle}
            imageList={imageList}
          ></UploadImage>
        </ProFormGroup>
        <ProFormGroup title={'博客分类'}>
          <ProFormSelect
            width={'lg'}
            options={commonOpts}
            fieldProps={{
              searchOnFocus: true,
              async onDropdownVisibleChange(open) {
                if (open) {
                  const data = await getAllCategory();
                  setCommonOpts(data);
                }
              },
            }}
            name="category_id"
            label={
              <>
                {'博客分类 '}
                &nbsp;
                <Button
                  type="dashed"
                  size="small"
                  icon={<PlusOutlined />}
                  onClick={() => {
                    setShowCategoryModal(true);
                  }}
                ></Button>
              </>
            }
            placeholder="请输入博客分类"
            rules={[{ required: true, message: '请选择博客分类' }]}
          ></ProFormSelect>
          <ProFormSelect
            fieldProps={{
              mode: 'tags',
              async onDropdownVisibleChange(open) {
                if (open) {
                  const data = await getAllTags();
                  setTagOpts(data);
                }
              },
            }}
            width={'lg'}
            options={tagOpts}
            name="tag_ids"
            label={
              <>
                {'博客标签'}
                &nbsp;
                <Button
                  type="dashed"
                  size="small"
                  icon={<PlusOutlined />}
                  onClick={() => {
                    setShowTagModal(true);
                  }}
                ></Button>
              </>
            }
            placeholder="请输入博客标签"
            rules={[{ required: true, message: '请选择博客标签' }]}
          ></ProFormSelect>
        </ProFormGroup>
        <ProFormSwitch name="is_release" label="是否发布" />
        <ProFormTextArea
          label="博客描述"
          rules={[
            {
              type: 'string',
              required: true,
              message: '请输入博客描述',
            },
          ]}
          name="description"
        ></ProFormTextArea>
        <ProFormText
          label="博客名称"
          rules={[
            {
              type: 'string',
              required: true,
              message: '请输入博客名称',
            },
          ]}
          name="title"
        />
        <ConfirmCate
          title={'添加类别'}
          showOpen={showCategoryModal}
          onClose={() => {
            setShowCategoryModal(false);
          }}
          onFinish={async ({ name }) => {
            await addCategory({
              data: {
                name: name,
              },
            });
            setShowCategoryModal(false);
            message.success('提交成功');
          }}
        ></ConfirmCate>

        <ConfirmCate
          title={'添加标签'}
          showOpen={showTagModal}
          onClose={() => {
            setShowTagModal(false);
          }}
          onFinish={async ({ name }) => {
            await addTags({
              data: {
                name: name,
              },
            });
            setShowTagModal(false);
            message.success('提交成功');
          }}
        ></ConfirmCate>
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
