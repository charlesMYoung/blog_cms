import Footer from '@/components/Footer';
import { oAuthToken } from '@/services/user';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { LoginForm, ProFormCheckbox, ProFormText } from '@ant-design/pro-components';
import { useEmotionCss } from '@ant-design/use-emotion-css';
import { history, SelectLang, useModel, Helmet } from '@umijs/max';
import { Alert, message } from 'antd';
import Settings from '../../../../config/defaultSettings';
import React, { useState } from 'react';
import { flushSync } from 'react-dom';
import { session } from '@/utils';

const Lang = () => {
  const langClassName = useEmotionCss(({ token }) => {
    return {
      width: 42,
      height: 42,
      lineHeight: '42px',
      position: 'fixed',
      right: 16,
      borderRadius: token.borderRadius,
      ':hover': {
        backgroundColor: token.colorBgTextHover,
      },
    };
  });

  return (
    <div className={langClassName} data-lang>
      {SelectLang && <SelectLang />}
    </div>
  );
};

const LoginMessage: React.FC<{
  content: string;
}> = ({ content }) => {
  return (
    <Alert
      style={{
        marginBottom: 24,
      }}
      message={content}
      type="error"
      showIcon
    />
  );
};

const Login: React.FC = () => {
  const [userLoginState, setUserLoginState] = useState<API.LoginResult>(
    {} as unknown as API.LoginResult,
  );
  const { initialState, setInitialState } = useModel('@@initialState');

  const containerClassName = useEmotionCss(() => {
    return {
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      overflow: 'auto',
      backgroundImage:
        "url('https://mdn.alipayobjects.com/yuyan_qk0oxh/afts/img/V-_oS6r-i7wAAAAAAAAAAAAAFl94AQBr')",
      backgroundSize: '100% 100%',
    };
  });

  const fetchUserInfo = async () => {
    const userInfo = await initialState?.fetchUserInfo?.();
    if (userInfo) {
      flushSync(() => {
        setInitialState((s) => ({
          ...s,
          currentUser: userInfo,
        }));
      });
    }
  };

  const handleSubmit = async (values: API.LoginParams) => {
    try {
      // 登录
      const params = new URLSearchParams();
      params.set('username', values.username);
      params.set('password', values.password);
      params.set('grant_type', 'password');
      params.set('scope', 'admin:blog');
      const msg = await oAuthToken(params, {
        skipErrorHandler: true,
      });
      if (msg.code === '0000') {
        message.success('登录成功！');
        session.put('token', msg.data);
        if (values.auto_login) {
          session.put('refresh_token', msg.data?.refresh_token, true);
          session.put('auto_login', true, true);
        } else {
          session.remove('auto_login');
          session.remove('refresh_token');
        }
        await fetchUserInfo();

        /** 此方法会跳转到 redirect 参数所在的位置 */
        if (!history) return;
        history.push('/');
        return;
      }
      // 如果失败去设置用户错误信息
    } catch (error: any) {
      setUserLoginState(error?.response.data as API.LoginResult);
    }
  };
  const { code } = userLoginState;
  console.log(userLoginState);
  return (
    <div className={containerClassName}>
      <Helmet>
        <title>登录页 - {Settings.title}</title>
      </Helmet>
      <Lang />
      <div
        style={{
          flex: '1',
          padding: '32px 0',
        }}
      >
        <LoginForm
          contentStyle={{
            minWidth: 280,
            maxWidth: '75vw',
          }}
          logo={<img alt="logo" src="/logo.svg" />}
          title="Cyatime"
          subTitle={`简单管理`}
          initialValues={{
            autoLogin: true,
          }}
          onFinish={async (values) => {
            await handleSubmit(values as API.LoginParams);
          }}
        >
          {code && code === 'C40005' && <LoginMessage content={'账户或密码错误'} />}
          <ProFormText
            name="username"
            fieldProps={{
              size: 'large',
              prefix: <UserOutlined />,
            }}
            placeholder="用户名"
            rules={[
              {
                required: true,
                message: '请输入用户名!',
              },
            ]}
          />
          <ProFormText.Password
            name="password"
            fieldProps={{
              size: 'large',
              prefix: <LockOutlined />,
            }}
            placeholder="密码"
            rules={[
              {
                required: true,
                message: '请输入密码！',
              },
            ]}
          />
          <div
            style={{
              marginBottom: 24,
            }}
          >
            <ProFormCheckbox noStyle name="auto_login">
              自动登录
            </ProFormCheckbox>
            <a
              style={{
                float: 'right',
              }}
            >
              忘记密码
            </a>
          </div>
        </LoginForm>
      </div>
      <Footer />
    </div>
  );
};

export default Login;
