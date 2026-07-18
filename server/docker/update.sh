#!/bin/bash
# 手动部署：拉取 GHCR 上的最新前后端镜像并重启容器。
# 前提：已 docker login ghcr.io、已配置好同目录下的 .env（含 BACKEND_IMAGE / FRONTEND_IMAGE 等）。
set -euo pipefail

cd "$(dirname "$0")"

# 首次部署若无 .env，则从模板自动生成，并把占位密码替换为随机强密码。
# .env 被 gitignore、git reset --hard 不会删除它，因此只生成一次、后续一直复用
# （MySQL 密码仅在数据卷首次创建时生效，切勿每次部署都重新生成）。
if [ ! -f .env ]; then
  echo "==> 未找到 .env，从 .env.example 自动生成（随机强密码，仅首次）..."
  if [ ! -f .env.example ]; then
    echo "错误：.env 和 .env.example 都不存在，无法生成配置" >&2
    exit 1
  fi
  gen() {
    if command -v openssl >/dev/null 2>&1; then
      openssl rand -hex "$1"
    else
      head -c "$1" /dev/urandom | od -An -tx1 | tr -d ' \n'
    fi
  }
  cp .env.example .env
  sed -i "s|^MYSQL_ROOT_PASSWORD=.*|MYSQL_ROOT_PASSWORD=$(gen 16)|" .env
  sed -i "s|^MYSQL_PASSWORD=.*|MYSQL_PASSWORD=$(gen 16)|" .env
  sed -i "s|^REDIS_PASSWORD=.*|REDIS_PASSWORD=$(gen 16)|" .env
  sed -i "s|^JWT_SECRET=.*|JWT_SECRET=$(gen 32)|" .env
  echo "==> .env 已生成（含随机密码），后续部署将复用此文件。"
fi

# 校验必填的镜像变量（compose 未设默认值，缺失会导致 invalid reference 报错）
# shellcheck disable=SC1091
set -a; . ./.env; set +a
for v in BACKEND_IMAGE FRONTEND_IMAGE; do
  eval "val=\${$v:-}"
  if [ -z "$val" ]; then
    echo "错误：.env 缺少 $v，请填写 GHCR 镜像地址" >&2
    exit 1
  fi
done

COMPOSE="docker compose -f docker-compose.yaml --env-file .env"

echo "==> 拉取最新镜像..."
$COMPOSE pull

echo "==> 重建并启动容器..."
$COMPOSE up -d

echo "==> 等待后端健康检查..."
healthy=false
for _ in $(seq 1 30); do
  status="$($COMPOSE ps backend --format '{{.Status}}' 2>/dev/null || true)"
  if echo "$status" | grep -q "healthy"; then
    echo "后端已就绪：$status"
    healthy=true
    break
  fi
  sleep 3
done

echo "==> 当前服务状态："
$COMPOSE ps

if [ "$healthy" != "true" ]; then
  echo "错误：后端在 90s 内未就绪，请查看日志：$COMPOSE logs backend" >&2
  exit 1
fi
