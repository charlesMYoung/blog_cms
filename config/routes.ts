export default [
  {
    path: '/user',
    layout: false,
    routes: [{ name: '登录', path: '/user/login', component: './User/Login' }],
  },
  {
    path: '/post',
    name: '博客',
    icon: 'FileMarkdownOutlined',
    component: './post',
  },
  {
    path: '/post-image',
    name: '图片',
    icon: 'FileImageOutlined',
    component: './post_img',
  },
  {
    path: '/device',
    name: '设备管理',
    icon: 'FileImageOutlined',
    component: './device',
  },
  {
    path: '/userList',
    name: '用户管理',
    icon: 'FileImageOutlined',
    component: './userList',
  },
  {
    path: '/',
    redirect: '/post',
  },
  { path: '*', layout: false, component: './404' },
];
