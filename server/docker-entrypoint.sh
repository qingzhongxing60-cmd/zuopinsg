#!/bin/sh
# 容器启动入口：在应用进程启动前先把数据库结构对齐到 schema.prisma，
# 保证表结构就绪后再起应用，避免应用内的定时任务/初始化在建表前访问数据库。
#
# 为什么用 db push 而不是 migrate deploy：
#   本项目从始至终用 `prisma db push` 管理数据库（见 package.json 的 prisma:push），
#   业务表（work / home_config / about_me 等）从未生成迁移文件。若用 migrate deploy，
#   这些表及后续新增字段永远不会建到库里，线上功能会因“列/表不存在”而报错。
# 安全性：
#   db push 幂等——缺表建表、缺列补列；对“新增可空列”这类加法改动完全安全；
#   遇到会丢数据的破坏性改动会直接报错退出（未加 --accept-data-loss），不会误删生产数据。
#   --skip-generate：Prisma Client 已在镜像构建期生成且与本次代码同源，无需重复生成。
set -eu

echo "[entrypoint] 同步数据库结构 (prisma db push)..."
./node_modules/.bin/prisma db push --skip-generate

echo "[entrypoint] 启动服务 (node dist/main)..."
exec node dist/main
