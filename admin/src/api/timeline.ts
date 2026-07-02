import request from '@/utils/http'

/** 时间轴节点数据类型 */
export interface TimelineNode {
  /** 节点 ID */
  id: number
  /** 年份（4 位公历年份） */
  year: number
  /** 标题 */
  title: string
  /** 描述（选填） */
  description: string | null
  /** 排序值，数值越小越靠前 */
  sort: number
  /** 创建时间 */
  createTime: string
}

/**
 * 获取时间轴节点列表（按排序值升序，相同时按年份升序）
 */
export function getTimelineList() {
  return request.get<TimelineNode[]>({
    url: '/admin/timeline/list'
  })
}

/**
 * 新增时间轴节点
 * @param data 年份、标题、描述、排序值
 */
export function addTimeline(data: {
  year: number
  title: string
  description?: string
  sort: number
}) {
  return request.post({
    url: '/admin/timeline/add',
    data
  })
}

/**
 * 更新时间轴节点
 * @param data 节点 ID 及待更新字段
 */
export function updateTimeline(data: {
  id: number
  year?: number
  title?: string
  description?: string
  sort?: number
}) {
  return request.put({
    url: '/admin/timeline/update',
    data
  })
}

/**
 * 删除时间轴节点
 * @param id 节点 ID
 */
export function deleteTimeline(id: number) {
  return request.del({
    url: `/admin/timeline/delete/${id}`
  })
}
