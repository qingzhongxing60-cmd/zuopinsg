# 构建阶段：在容器内 vite 构建出静态产物
FROM node:20-alpine AS builder

WORKDIR /app

RUN sed -i 's/dl-cdn.alpinelinux.org/mirrors.aliyun.com/g' /etc/apk/repositories

# 先装依赖（用 npm install 容错安装，兼容 lock 漂移）
COPY package.json package-lock.json* ./
RUN npm install --no-audit --no-fund

# 再拷源码构建
# 仅跑 vite build（不含 vue-tsc 类型检查门禁），类型检查作为单独 CI 关注
COPY . .
RUN npx vite build

# 运行阶段：nginx 托管静态产物 + 反代后端
FROM nginx:1.25-alpine

RUN apk add --no-cache tzdata
ENV TZ="Asia/Shanghai"

# nginx 配置
COPY nginx.conf /etc/nginx/nginx.conf
# 构建产物
COPY --from=builder /app/dist /usr/share/nginx/html/web

EXPOSE 80
