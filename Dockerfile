
# 构建生产环境镜像
FROM node:18-alpine AS base

FROM base AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat

WORKDIR /app

COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./
RUN yarn

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN yarn run build


FROM base AS runner

WORKDIR /app

ENV NODE_ENV production

RUN addgroup -g 1001 -S dmc
RUN adduser -S lady -u 1001

RUN mkdir -p /app/logs
RUN chown -R lady:dmc /app/logs
RUN npm install pm2 -g
# 拷贝文件
COPY --from=builder --chown=lady:dmc /app/dist/* ./
COPY --from=builder --chown=lady:dmc /app/ecosystem.config.js ./
# https://github.com/Tzahi12345/YoutubeDL-Material/commit/45be270b6f3d85c75b52f30ea6c7f0cee068c4f8
ENV PM2_HOME=/app/pm2

RUN ls -al -R

USER lady

EXPOSE 3000

CMD ["/bin/sh", "-c", "pm2-runtime start ecosystem.config.js > /app/logs/start_lady.log 2>&1"]
