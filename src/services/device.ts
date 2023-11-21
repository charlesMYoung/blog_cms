// @ts-ignore
/* eslint-disable */
import { request } from '@umijs/max';

export async function getDevice(
  { current, pageSize: page_size }: any,
  sort?: Record<string, any>,
  filter?: Record<string, any>,
) {
  return request<API.Device[]>('/client', {
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

export async function getDeviceDetail(params: { id?: string }) {
  return request<API.Device[]>('/client', {
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
export async function addDevice(options?: Record<string, any>) {
  return request<Record<string, any>>('/client', {
    method: 'POST',
    ...(options || {}),
  });
}

export async function addScope(options?: Record<string, any>) {
  return request<Record<string, any>>('/client/scope', {
    method: 'POST',
    ...(options || {}),
  });
}

export async function getScope(params?: { client_id?: string }) {
  return request<{ data: API.Scope[] }>('/client/scope', {
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
export async function updateDevice(options?: Record<string, any>) {
  return request<Record<string, any>>('/client', {
    method: 'PUT',
    ...(options || {}),
  });
}

/**
 * 卸载agent
 * @param options
 * @returns
 */
export async function removeDevice(options?: Record<string, any>) {
  return request<Record<string, any>>('/client', {
    method: 'DELETE',
    ...(options || {}),
  });
}
