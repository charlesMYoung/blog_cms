module.exports = {
  script: 'serve',
  name: 'cms-app',
  env: {
    PM2_SERVE_PATH: '.',
    PM2_SERVE_PORT: 3100,
    PM2_SERVE_SPA: 'true',
    PM2_SERVE_HOMEPAGE: './index.html',
  },
};
