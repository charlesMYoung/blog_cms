// @ts-ignore
/* eslint-disable */
import { request } from '@umijs/max';

export async function getPostInfo(
  { current, pageSize: page_size }: any,
  sort?: Record<string, any>,
  filter?: Record<string, any>,
) {
  return request<API.Post[]>('/api/post', {
    method: 'GET',
    params: {
      ...{
        current,
        page_size,
      },
      ...(sort || {}),
      ...(filter || {}),
    },
  });
}

export async function getPostDetail(params: { id?: number }) {
  return request<API.Post[]>('/api/post', {
    method: 'GET',
    params: {
      ...params,
    },
  });
}

/**
 * 新增agent
 * @param options
 * @returns
 */
export async function addPost(options?: Record<string, any>) {
  return request<Record<string, any>>('/api/post', {
    method: 'POST',
    ...(options || {}),
  });
}

/**
 * 卸载agent
 * @param options
 * @returns
 */
export async function removePost(options?: Record<string, any>) {
  return request<Record<string, any>>('/api/post', {
    method: 'DELETE',
    ...(options || {}),
  });
}

export async function getAllTags() {
  return request<API.Tag[]>('/api/tag', {
    method: 'GET',
    params: {},
  });
}

export async function addTags(options?: Record<string, any>) {
  return request<API.Tag[]>('/api/tag', {
    method: 'Post',
    ...(options || {}),
  });
}

export async function addCategory(options?: Record<string, any>) {
  return request<API.Tag[]>('/api/category', {
    method: 'Post',
    ...(options || {}),
  });
}

export async function getCategory() {
  return request<API.Category[]>('/api/category', {
    method: 'GET',
    params: {},
  });
}
