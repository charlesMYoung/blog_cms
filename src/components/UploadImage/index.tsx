import { session } from '@/utils';
import { Upload, UploadFile, UploadProps } from 'antd';
import ImgCrop from 'antd-img-crop';
import { RcFile } from 'antd/es/upload';
import React from 'react';

const uploadUrl = '/api/image/upload';

export interface UploadImageProps {
  onUpload: (imageData: API.Image, files: UploadFile[]) => void;
  onRemove: (imageId: string) => void;
  imageList: UploadFile[];
}

export const UploadImage = ({ onUpload, onRemove, imageList }: UploadImageProps) => {
  const onChange: UploadProps<{ data: API.Image }>['onChange'] = ({
    fileList: newFileList,
    event,
    file,
  }) => {
    console.log('fileList--->', newFileList, event, 'file-->', file);
    const { response } = file;
    const data = response?.data || ({} as API.Image);
    if (response) {
      data.type = 'COVER'; // 封面图片
    }
    onUpload(data, newFileList);
    // setFileList(newFileList);
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
    onRemove(file.response.data.id);
  };

  return (
    <ImgCrop rotationSlider aspect={1.7} showGrid showReset>
      <Upload
        action={uploadUrl}
        headers={{
          Authorization: `Bearer ${session.get('app_access_token')}`,
        }}
        listType="picture-card"
        fileList={imageList}
        onChange={onChange}
        onPreview={onPreview}
        onRemove={onRemoveHandle}
      >
        {imageList.length < 1 && '+ 上传图片'}
      </Upload>
    </ImgCrop>
  );
};
