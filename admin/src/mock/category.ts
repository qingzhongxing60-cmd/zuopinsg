/**
 * 分类管理 Mock 数据
 * 列表按排序值升序返回，排序值相同时按新增时间升序
 * 业务规则：分类名全局唯一、唯一标识全局唯一、删除保护（有关联作品时拒绝删除）
 */

interface MockCategory {
  id: number
  name: string
  slug: string
  sort: number
  workCount: number
  createTime: string
}

// 初始分类数据（固定数据，含一条无关联作品的可删除分类）
const categories: MockCategory[] = [
  { id: 1, name: 'AI 产品', slug: 'ai-product', sort: 1, workCount: 6, createTime: '2026-01-05 09:00:00' },
  { id: 2, name: '医疗健康', slug: 'medical', sort: 2, workCount: 4, createTime: '2026-01-06 09:00:00' },
  { id: 3, name: '智能外呼', slug: 'outbound-call', sort: 3, workCount: 3, createTime: '2026-01-07 09:00:00' },
  { id: 4, name: 'CRM 系统', slug: 'crm', sort: 4, workCount: 2, createTime: '2026-01-08 09:00:00' },
  { id: 5, name: '待归档', slug: 'archived', sort: 5, workCount: 0, createTime: '2026-01-09 09:00:00' }
]

let nextId = 100

/** 按排序值升序、相同时按新增时间升序排列 */
function sortCategories(list: MockCategory[]): MockCategory[] {
  return [...list].sort((a, b) => {
    if (a.sort !== b.sort) return a.sort - b.sort
    return new Date(a.createTime).getTime() - new Date(b.createTime).getTime()
  })
}

/** 获取分类列表（支持名称模糊搜索） */
export function getCategoryListMock(params?: { name?: string }): MockCategory[] {
  const keyword = params?.name?.trim()
  let result = categories
  if (keyword) {
    result = categories.filter((c) => c.name.includes(keyword))
  }
  return sortCategories(result)
}

/** 新增分类（校验分类名与唯一标识全局唯一） */
export function addCategoryMock(data: { name: string; slug: string; sort: number }): MockCategory {
  if (categories.some((c) => c.name === data.name)) {
    throw new Error('分类名称已存在，请修改后重新提交')
  }
  if (categories.some((c) => c.slug === data.slug)) {
    throw new Error('唯一标识已存在，请修改后重新提交')
  }
  const item: MockCategory = {
    id: nextId++,
    name: data.name,
    slug: data.slug,
    sort: data.sort,
    workCount: 0,
    createTime: new Date().toLocaleString('zh-CN', { hour12: false })
  }
  categories.push(item)
  return item
}

/** 更新分类（校验分类名与唯一标识全局唯一，排除自身） */
export function updateCategoryMock(
  id: number,
  data: { name?: string; slug?: string; sort?: number }
): MockCategory {
  const target = categories.find((c) => c.id === id)
  if (!target) throw new Error('分类不存在')
  if (data.name && categories.some((c) => c.name === data.name && c.id !== id)) {
    throw new Error('分类名称已存在，请修改后重新提交')
  }
  if (data.slug && categories.some((c) => c.slug === data.slug && c.id !== id)) {
    throw new Error('唯一标识已存在，请修改后重新提交')
  }
  if (data.name !== undefined) target.name = data.name
  if (data.slug !== undefined) target.slug = data.slug
  if (data.sort !== undefined) target.sort = data.sort
  return target
}

/** 删除分类（有关联作品时拒绝删除） */
export function deleteCategoryMock(id: number): boolean {
  const target = categories.find((c) => c.id === id)
  if (!target) throw new Error('分类不存在')
  if (target.workCount > 0) {
    throw new Error('该分类下存在作品，请先迁移作品后再删除')
  }
  const index = categories.findIndex((c) => c.id === id)
  categories.splice(index, 1)
  return true
}
