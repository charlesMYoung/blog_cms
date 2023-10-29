// @ts-ignore
/* eslint-disable */

declare namespace API {
  type Image = {
    id: string;
    url: string;
    type: string;
    name: string;
    post_id?: string;
    Post?: {
      title: string;
    };
  };

  /**
   * agent 信息
   */
  type Post = {
    id: string;
    title: string;
    description: string | null;
    is_release: boolean;
    content: string;
    release_date: Date | null;
    category_id: string | null;
    created_at: Date;
    update_at: Date;
    images: Image[];
    category?: Category;
    tags?: { tag: Tag }[];
  };

  type User = {
    id: string;
    username?: string;
    password?: string;
    email?: string;
    is_locked?: boolean;
    enable?: boolean;
  };

  type Device = {
    client_id?: string;
    client_name?: string;
    is_locked?: boolean;
    scopes?: string;
    authorized_grant_types: string;
    web_server_redirect_uri: string;
    access_token_validity?: number;
    refresh_token_validity?: number;
  };

  type Scope = {
    id?: string;
    scope: string;
  };

  type Category = {
    id: string;
    name: string;
  };

  type Tag = {
    id: string;
    name: string;
  };

  type CurrentUser = {
    username: string;
  };

  type LoginResult = {
    code?: string;
    message?: string;
    data?: {
      access_token?: string;
    };
  };

  type PageParams = {
    current?: number;
    pageSize?: number;
  };

  type RuleListItem = {
    key?: number;
    disabled?: boolean;
    href?: string;
    avatar?: string;
    name?: string;
    owner?: string;
    desc?: string;
    callNo?: number;
    status?: number;
    updatedAt?: string;
    createdAt?: string;
    progress?: number;
  };

  type RuleList = {
    data?: RuleListItem[];
    /** 列表的内容总数 */
    total?: number;
    success?: boolean;
  };

  type FakeCaptcha = {
    code?: number;
    status?: string;
  };

  type LoginParams = {
    username?: string;
    password?: string;
    autoLogin?: boolean;
    type?: string;
  };

  type ErrorResponse = {
    /** 业务约定的错误码 */
    errorCode: string;
    /** 业务上的错误信息 */
    errorMessage?: string;
    /** 业务上的请求是否成功 */
    success?: boolean;
  };

  type NoticeIconList = {
    data?: NoticeIconItem[];
    /** 列表的内容总数 */
    total?: number;
    success?: boolean;
  };

  type NoticeIconItemType = 'notification' | 'message' | 'event';

  type NoticeIconItem = {
    id?: string;
    extra?: string;
    key?: string;
    read?: boolean;
    avatar?: string;
    title?: string;
    status?: string;
    datetime?: string;
    description?: string;
    type?: NoticeIconItemType;
  };
}
