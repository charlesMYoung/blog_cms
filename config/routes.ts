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
    name: '博客图片',
    icon: 'FileImageOutlined',
    component: './post_img',
  },
  {
    path: '/',
    redirect: '/post',
  },
  { path: '*', layout: false, component: './404' },
];
