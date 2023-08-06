import { session } from '@/utils';
import { Upload, UploadFile, UploadProps } from 'antd';
import ImgCrop from 'antd-img-crop';
import { RcFile } from 'antd/es/upload';
import React, { useState } from 'react';

const uploadUrl = '/api/image/upload';

export interface UploadImageProps {
  onUpload: (imageData: API.Image) => void;
  onRemove: (imageId: string) => void;
}

export const UploadImage = ({ onUpload, onRemove }: UploadImageProps) => {
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  const onChange: UploadProps<{ data: API.Image }>['onChange'] = ({
    fileList: newFileList,
    event,
    file,
  }) => {
    console.log('fileList--->', fileList, event, 'file-->', file);
    const { response } = file;
    if (response) {
      const data = response.data;
      data.type = 'COVER'; // 封面图片
      onUpload(data);
    }
    setFileList(newFileList);
  };

  const onPreview = async (file: UploadFile) => {
    let src = file.url as string;
    if (!src) {
      src = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(file.originFileObj as RcFile);
        reader.onload = () => resolve(reader.result as string);
      });
    }
    const image = new Image();
    image.src = src;
    const imgWindow = window.open(src);
    imgWindow?.document.write(image.outerHTML);
  };

  const onRemoveHandle = (file: UploadFile) => {
    console.log('onRemoveHandle fileList--->', fileList, 'file-->', file);
    onRemove(file.response.data.id);
  };

  return (
    <div
      style={{
        position: 'relative',
        zIndex: 999,
      }}
    >
      <ImgCrop rotationSlider aspect={1.7} showGrid showReset>
        <Upload
          action={uploadUrl}
          headers={{
            Authorization: `Bearer ${session.get('app_access_token')}`,
          }}
          listType="picture-card"
          fileList={fileList}
          onChange={onChange}
          onPreview={onPreview}
          onRemove={onRemoveHandle}
        >
          {fileList.length < 1 && '+ 上传图片'}
        </Upload>
      </ImgCrop>
    </div>
  );
};
