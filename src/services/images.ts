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
  return request<API.Image[]>('/api/image', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

export async function getImageDetail(params: { id?: number }) {
  return request<API.Post[]>('/api/image', {
    method: 'GET',
    params: {
      ...params,
    },
  });
}

/**
 * 卸载agent
 * @param options
 * @returns
 */
export async function removeImage(options?: Record<string, any>) {
  return request<Record<string, any>>('/api/image', {
    method: 'DELETE',
    ...(options || {}),
  });
}
