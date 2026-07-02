/**
 * 数据统计 Mock 数据
 * 作品访问量排行：仅统计已发布作品（status=1）
 * 按访问量降序，相同时按发布时间倒序（发布晚的靠前），分页返回
 */

import { works, getCategoryName } from './work-data'

/** 取发布时间戳，未发布按 0 处理（仅已发布作品参与，正常都有值） */
function publishTimestamp(publishTime: string | null): number {
  return publishTime ? new Date(publishTime).getTime() : 0
}

/**
 * 获取作品访问量排行（分页）
 * 仅已发布作品；访问量降序，相同时按发布时间倒序
 */
export function getWorkViewRankMock(params?: { page?: number; pageSize?: number }) {
  const page = Number(params?.page) || 1
  const pageSize = Number(params?.pageSize) || 10

  const ranked = works
    .filter((w) => w.status === 1)
    .sort((a, b) => {
      if (b.views !== a.views) return b.views - a.views
      return publishTimestamp(b.publishTime) - publishTimestamp(a.publishTime)
    })
    .map((w) => ({
      id: w.id,
      title: w.title,
      categoryName: getCategoryName(w.categoryId),
      views: w.views
    }))

  const start = (page - 1) * pageSize
  const list = ranked.slice(start, start + pageSize)

  return {
    list,
    pagination: { page, pageSize, total: ranked.length }
  }
}
