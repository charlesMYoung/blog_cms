// @ts-ignore
/* eslint-disable */
import { request } from '@umijs/max';

export async function getImageInfo(
  params: {
    current?: number;
    pageSize?: number;
  },
  options?: Record<string, any>,
) {
  return request<API.Image[]>('/image', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

export async function getImageDetail(params: { id?: number }) {
  return request<API.Image>('/image', {
    method: 'GET',
    params: {
      ...params,
    },
  });
}

export async function removeImage(options?: Record<string, any>) {
  return request<Record<string, any>>('/image', {
    method: 'DELETE',
    ...(options || {}),
  });
}

export async function addImage(options?: Record<string, any>) {
  return request<Record<string, API.Image>>('/image/upload', {
    method: 'POST',
    ...(options || {}),
  });
}
