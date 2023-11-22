import type { AxiosError, RequestOptions } from '@@/plugin-request/request';
import type { RequestConfig } from '@umijs/max';
import { message, notification } from 'antd';
import { session } from './utils';
import { history, request } from '@umijs/max';
import { oAuthToken } from './services/user';

// 错误处理方案： 错误类型
enum ErrorShowType {
  SILENT = 0,
  WARN_MESSAGE = 1,
  ERROR_MESSAGE = 2,
  NOTIFICATION = 3,
  REDIRECT = 9,
}
// 与后端约定的响应数据格式
interface ResponseStructure {
  success: boolean;
  data: any;
  errorCode?: number;
  errorMessage?: string;
  showType?: ErrorShowType;
}

let isPending: boolean = false;
let preRequests: { url: string | undefined; method: string | undefined; params: any; data: any }[] =
  [];
const preRequestAPI = async (error: AxiosError) => {
  if (isPending) {
    preRequests.push({
      url: error.config.url,
      method: error.config.method,
      params: error.config.params,
      data: error.config.data,
    });
    return;
  }

  const token = session.get<API.Token>('token');
  if (!token.refresh_token) {
    if (!history) return;
    history.push('/user/login');
  }
  const params = new URLSearchParams();
  params.set('refresh_token', token.refresh_token);
  params.set('grant_type', 'refresh_token');
  try {
    isPending = true;
    const { data: token } = await oAuthToken(params, {
      skipErrorHandler: true,
    });
    if (token) {
      session.put('token', token);
      session.put('refresh_token', token.refresh_token, true);
    }
    const readyQuest = preRequests.map((item) => {
      return request(item.url || '', {
        method: item.method,
        params: item.params,
        data: item.data,
      });
    });
    isPending = false;
    return Promise.all(readyQuest);
  } catch (error) {
    if (!history) return;
    history.push('/user/login');
  }
};

/**
 * @name 错误处理
 * pro 自带的错误处理， 可以在这里做自己的改动
 * @doc https://umijs.org/docs/max/request#配置
 */
export const errorConfig: RequestConfig = {
  // 错误处理： umi@3 的错误处理方案。
  errorConfig: {
    // 错误抛出
    errorThrower: (res) => {
      const { success, data, errorCode, errorMessage, showType } =
        res as unknown as ResponseStructure;
      if (!success) {
        const error: any = new Error(errorMessage);
        error.name = 'BizError';
        error.info = { errorCode, errorMessage, showType, data };
        throw error; // 抛出自制的错误
      }
    },
    // 错误接收及处理
    errorHandler: (error: any, opts: any) => {
      if (opts?.skipErrorHandler) throw error;
      // 我们的 errorThrower 抛出的错误。
      if (error.name === 'BizError') {
        const errorInfo: ResponseStructure | undefined = error.info;
        if (errorInfo) {
          const { errorMessage, errorCode } = errorInfo;
          switch (errorInfo.showType) {
            case ErrorShowType.SILENT:
              // do nothing
              break;
            case ErrorShowType.WARN_MESSAGE:
              message.warning(errorMessage);
              break;
            case ErrorShowType.ERROR_MESSAGE:
              message.error(errorMessage);
              break;
            case ErrorShowType.NOTIFICATION:
              notification.open({
                description: errorMessage,
                message: errorCode,
              });
              break;
            case ErrorShowType.REDIRECT:
              // TODO: redirect
              break;
            default:
              message.error(errorMessage);
          }
        }
      } else if (error.response.data.code === 'C40008') {
        preRequestAPI(error);
      } else if (error.response) {
        // Axios 的错误
        // 请求成功发出且服务器也响应了状态码，但状态代码超出了 2xx 的范围
        notification.open({
          type: 'error',
          placement: 'bottom',
          message: `错误码:${error.response.data.code}`,
          description: `${error.response.data.message}`,
        });
      } else if (error.request) {
        // 请求已经成功发起，但没有收到响应
        // \`error.request\` 在浏览器中是 XMLHttpRequest 的实例，
        // 而在node.js中是 http.ClientRequest 的实例
        message.error('None response! Please retry.');
      } else {
        // 发送请求时出了点问题
        message.error('Request error, please retry.');
      }
    },
  },

  // 请求拦截器
  requestInterceptors: [
    (config: RequestOptions) => {
      const token = session.get<API.Token>('token');
      let Authorization = '';
      if (config.method === 'post' && config.url === 'oauth2/token') {
        const clientId = process.env.CLIENT_ID || CLIENT_ID;
        const clientSecure = process.env.CLIENT_SECRET || CLIENT_SECRET;
        const basicToken = btoa(`${clientId}:${clientSecure}`);
        Authorization = `Basic ${basicToken}`;
      } else if (token.access_token) {
        Authorization = `Bearer ${token.access_token}`;
      }
      if (process.env.SERVICE_URL || SERVICE_URL) {
        config.baseURL = process.env.SERVICE_URL || SERVICE_URL;
      }
      return {
        ...config,
        headers: {
          ...config.headers,
          Authorization,
        },
      };
    },
  ],

  // 响应拦截器
  responseInterceptors: [
    (response) => {
      // 拦截响应数据，进行个性化处理
      const { data } = response as unknown as ResponseStructure;

      if (data?.code !== '0000') {
        message.error('请求失败！');
      }
      return response;
    },
  ],
};
