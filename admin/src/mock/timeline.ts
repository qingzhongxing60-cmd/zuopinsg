/**
 * 时间轴管理 Mock 数据
 * 列表按排序值升序返回，排序值相同时按年份升序
 * 时间轴节点独立维护，无草稿状态，无外部关联
 */

interface MockTimelineNode {
  id: number
  year: number
  title: string
  description: string | null
  sort: number
  createTime: string
}

// 初始时间轴数据（固定数据）
const timelineNodes: MockTimelineNode[] = [
  {
    id: 1,
    year: 2019,
    title: '初入产品行业',
    description: '加入首家互联网公司，从助理产品经理起步，负责后台工具产品。',
    sort: 1,
    createTime: '2026-01-05 09:00:00'
  },
  {
    id: 2,
    year: 2021,
    title: '主导 AI 外呼项目',
    description: '独立负责智能外呼系统从 0 到 1，落地多家企业客户。',
    sort: 2,
    createTime: '2026-01-06 09:00:00'
  },
  {
    id: 3,
    year: 2023,
    title: '转向医疗健康赛道',
    description: null,
    sort: 3,
    createTime: '2026-01-07 09:00:00'
  },
  {
    id: 4,
    year: 2025,
    title: '搭建个人作品集',
    description: '系统沉淀历年项目经验，构建对外展示的作品拾光平台。',
    sort: 4,
    createTime: '2026-01-08 09:00:00'
  }
]

let nextId = 100

/** 按排序值升序、相同时按年份升序排列 */
function sortNodes(list: MockTimelineNode[]): MockTimelineNode[] {
  return [...list].sort((a, b) => {
    if (a.sort !== b.sort) return a.sort - b.sort
    return a.year - b.year
  })
}

/** 获取时间轴节点列表 */
export function getTimelineListMock(): MockTimelineNode[] {
  return sortNodes(timelineNodes)
}

/** 新增时间轴节点 */
export function addTimelineMock(data: {
  year: number
  title: string
  description?: string
  sort: number
}): MockTimelineNode {
  const item: MockTimelineNode = {
    id: nextId++,
    year: data.year,
    title: data.title,
    description: data.description || null,
    sort: data.sort,
    createTime: new Date().toLocaleString('zh-CN', { hour12: false })
  }
  timelineNodes.push(item)
  return item
}

/** 更新时间轴节点 */
export function updateTimelineMock(
  id: number,
  data: { year?: number; title?: string; description?: string; sort?: number }
): MockTimelineNode {
  const target = timelineNodes.find((n) => n.id === id)
  if (!target) throw new Error('时间轴节点不存在')
  if (data.year !== undefined) target.year = data.year
  if (data.title !== undefined) target.title = data.title
  if (data.description !== undefined) target.description = data.description || null
  if (data.sort !== undefined) target.sort = data.sort
  return target
}

/** 删除时间轴节点 */
export function deleteTimelineMock(id: number): boolean {
  const index = timelineNodes.findIndex((n) => n.id === id)
  if (index === -1) throw new Error('时间轴节点不存在')
  timelineNodes.splice(index, 1)
  return true
}
