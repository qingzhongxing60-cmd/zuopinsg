#!/bin/bash
# 手动预拉取 GHCR 镜像(救急用)。
# 适用场景：服务器连 ghcr.io 很慢，CI 的 pull 会超时。本脚本不受 CI 时间限制，
# 可挂后台反复重试，docker 会缓存已下载完成的层，每次重试续传直至拉全。
#
# 用法(在服务器部署目录，即 .env 所在目录执行)：
#   1) 先登录 GHCR(仅首次)： docker login ghcr.io -u <你的GitHub用户名>
#      密码粘贴一个有 read:packages 权限的 GitHub Personal Access Token
#   2) 后台运行： nohup ./prepull.sh > prepull.log 2>&1 &
#   3) 查看进度： tail -f prepull.log   (拉全后会打印“全部镜像已拉取完成”)
#   4) 拉完后回 GitHub Actions 重跑失败的 deploy 作业即可秒过。
set -u

cd "$(dirname "$0")"

# 优先从 .env 读取镜像地址；.env 不存在则用本仓库默认镜像名。
if [ -f .env ]; then
  # shellcheck disable=SC1091
  set -a; . ./.env; set +a
fi
: "${BACKEND_IMAGE:=ghcr.io/qingzhongxing60-cmd/zuopinsg-backend:latest}"
: "${FRONTEND_IMAGE:=ghcr.io/qingzhongxing60-cmd/zuopinsg-frontend:latest}"
: "${WEBSITE_IMAGE:=ghcr.io/qingzhongxing60-cmd/zuopinsg-website:latest}"

IMAGES="$BACKEND_IMAGE $FRONTEND_IMAGE $WEBSITE_IMAGE"

for img in $IMAGES; do
  echo "================================================================"
  echo "==> 开始拉取：$img  ($(date '+%F %T'))"
  n=0
  until docker pull "$img"; do
    n=$((n + 1))
    echo "==> [$img] 第 $n 次未拉全，20s 后续传重试...  ($(date '+%F %T'))"
    sleep 20
  done
  echo "==> 完成：$img"
done

echo "================================================================"
echo "全部镜像已拉取完成。现在可回 GitHub Actions 重跑 deploy 作业。"
