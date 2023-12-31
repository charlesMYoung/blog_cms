// @ts-ignore
/* eslint-disable */
import { request } from '@umijs/max';

export async function userList(
  { current, pageSize: page_size }: any,
  sort?: Record<string, any>,
  filter?: Record<string, any>,
) {
  return request<{ data: API.User[] }>('user', {
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

export async function getUserDetail(params: { id?: string; email?: string; username?: string }) {
  return request<{ data: API.User }>('user', {
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
  return request<Record<string, any>>('user', {
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
  return request<Record<string, any>>('user', {
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
  return request<Record<string, any>>('user', {
    method: 'DELETE',
    ...(options || {}),
  });
}

/** 获取当前的用户 GET currentUser */
export async function currentUser(options?: { [key: string]: any }) {
  return request<{
    data: API.CurrentUser;
  }>('user/current', {
    method: 'GET',
    ...(options || {}),
  });
}

/** 退出登录接口 POST login/outLogin */
export async function outLogin(options?: { [key: string]: any }) {
  return request<Record<string, any>>('login/outLogin', {
    method: 'POST',
    ...(options || {}),
  });
}

export async function oAuthToken(data: any, options?: { [key: string]: any }) {
  return request<API.LoginResult>('oauth2/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    data,
    // data: body,
    ...(options || {}),
  });
}
