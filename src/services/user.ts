// @ts-ignore
/* eslint-disable */
import { request } from '@umijs/max';

export async function userList(
  { current, pageSize: page_size }: any,
  sort?: Record<string, any>,
  filter?: Record<string, any>,
) {
  return request<API.User[]>('/api/user', {
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

export async function getUserDetail(params: { id?: string }) {
  return request<API.User[]>('/api/user', {
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
export async function addUser(options?: Record<string, any>) {
  return request<Record<string, any>>('/api/user', {
    method: 'POST',
    ...(options || {}),
  });
}

/**
 * 新增agent
 * @param options
 * @returns
 */
export async function updateUser(options?: Record<string, any>) {
  return request<Record<string, any>>('/api/user', {
    method: 'PUT',
    ...(options || {}),
  });
}

/**
 * 卸载agent
 * @param options
 * @returns
 */
export async function removeUser(options?: Record<string, any>) {
  return request<Record<string, any>>('/api/user', {
    method: 'DELETE',
    ...(options || {}),
  });
}
