import request from '@/utils/http'

/** 作品访问量排行项类型 */
export interface WorkViewRankItem {
  /** 作品 ID */
  id: number
  /** 作品标题 */
  title: string
  /** 所属分类名称，无值为 '-' */
  categoryName: string
  /** 累计访问量（已去重） */
  views: number
}

/** 访问量排行分页结果类型 */
export interface WorkViewRankResult {
  list: WorkViewRankItem[]
  pagination: { page: number; pageSize: number; total: number }
}

/**
 * 获取作品访问量排行（仅已发布作品，按访问量降序，相同时按发布时间倒序，分页）
 * @param params.page 页码
 * @param params.pageSize 每页条数
 */
export function getWorkViewRank(params?: { page?: number; pageSize?: number }) {
  return request.get<WorkViewRankResult>({
    url: '/admin/statistics/work-views',
    params
  })
}
