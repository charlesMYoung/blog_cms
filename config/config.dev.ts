// config/config.test.ts test环境对应的配置文件
import { defineConfig } from '@umijs/max';

export default defineConfig({
  define: {
    CLIENT_ID: '1',
    CLIENT_SECRET: '2',
    SERVICE_URL: '/api',
  },
});
