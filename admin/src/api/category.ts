import request from '@/utils/http'

/** 分类数据类型 */
export interface Category {
  /** 分类 ID */
  id: number
  /** 分类名（全局唯一） */
  name: string
  /** 唯一标识（全局唯一，仅英文字母、数字、连字符） */
  slug: string
  /** 排序值，数值越小越靠前 */
  sort: number
  /** 关联作品数（只读，含草稿与已发布全部作品） */
  workCount: number
  /** 创建时间 */
  createTime: string
}

/**
 * 获取分类列表（按排序值升序，相同时按新增时间升序）
 * @param params.name 分类名称模糊搜索关键词
 */
export function getCategoryList(params?: { name?: string }) {
  return request.get<Category[]>({
    url: '/admin/category/list',
    params
  })
}

/**
 * 新增分类
 * @param data 分类名、唯一标识、排序值
 */
export function addCategory(data: { name: string; slug: string; sort: number }) {
  return request.post({
    url: '/admin/category/add',
    data
  })
}

/**
 * 更新分类
 * @param data 分类 ID 及待更新字段
 */
export function updateCategory(data: {
  id: number
  name?: string
  slug?: string
  sort?: number
}) {
  return request.put({
    url: '/admin/category/update',
    data
  })
}

/**
 * 删除分类（分类下存在关联作品时拒绝删除）
 * @param id 分类 ID
 */
export function deleteCategory(id: number) {
  return request.del({
    url: `/admin/category/delete/${id}`
  })
}
