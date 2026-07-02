import request from '@/utils/http'

// ==================== 类型定义 ====================

/** 发布状态：0 草稿 / 1 已发布 */
export type PublishStatus = 0 | 1

/** 作品数据类型 */
export interface Work {
  id: number
  title: string
  slug: string
  intro: string | null
  cover: string | null
  detail: string | null
  categoryId: number
  categoryName?: string
  featured: boolean
  status: PublishStatus
  views: number
  sort: number | null
  publishTime: string | null
  createTime: string
}

/** 原型版本数据类型 */
export interface PrototypeVersion {
  id: number
  workId: number
  name: string
  title: string | null
  sort: number | null
  createTime: string
}

/** 原型图片数据类型 */
export interface PrototypeImage {
  id: number
  versionId: number
  url: string
  caption: string | null
  sort: number | null
  createTime: string
}

/** 拆解文章数据类型 */
export interface BreakdownArticle {
  id: number
  workId: number
  title: string
  content: string | null
  status: PublishStatus
  sort: number | null
  createTime: string
}

// ==================== 作品接口 ====================

/**
 * 获取作品列表（按排序值升序，无值排后，相同时按新增时间倒序）
 */
export function getWorkList(params?: { title?: string; categoryId?: number; status?: PublishStatus }) {
  return request.get<Work[]>({ url: '/admin/work/list', params })
}

/**
 * 新增作品
 */
export function addWork(data: Partial<Work>) {
  return request.post({ url: '/admin/work/add', data })
}

/**
 * 更新作品
 */
export function updateWork(data: Partial<Work> & { id: number }) {
  return request.put({ url: '/admin/work/update', data })
}

/**
 * 删除作品（级联删除原型版本、图片与拆解文章）
 */
export function deleteWork(id: number) {
  return request.del({ url: `/admin/work/delete/${id}` })
}

/**
 * 切换作品发布状态（发布/下架）
 */
export function toggleWorkStatus(id: number) {
  return request.put({ url: '/admin/work/toggle-status', data: { id } })
}

/**
 * 切换作品精选标记
 */
export function toggleWorkFeatured(id: number) {
  return request.put({ url: '/admin/work/toggle-featured', data: { id } })
}

// ==================== 原型版本接口 ====================

/**
 * 获取指定作品的原型版本列表
 */
export function getVersionList(workId: number) {
  return request.get<PrototypeVersion[]>({ url: '/admin/work/version/list', params: { workId } })
}

/**
 * 新增原型版本
 */
export function addVersion(data: { workId: number; name: string; title?: string; sort?: number }) {
  return request.post({ url: '/admin/work/version/add', data })
}

/**
 * 更新原型版本
 */
export function updateVersion(data: { id: number; name?: string; title?: string; sort?: number }) {
  return request.put({ url: '/admin/work/version/update', data })
}

/**
 * 删除原型版本（级联删除该版本下全部图片）
 */
export function deleteVersion(id: number) {
  return request.del({ url: `/admin/work/version/delete/${id}` })
}

// ==================== 原型图片接口 ====================

/**
 * 获取指定版本的图片列表
 */
export function getImageList(versionId: number) {
  return request.get<PrototypeImage[]>({ url: '/admin/work/image/list', params: { versionId } })
}

/**
 * 新增原型图片（支持批量）
 */
export function addImages(data: { versionId: number; images: { url: string; caption?: string; sort?: number }[] }) {
  return request.post({ url: '/admin/work/image/add', data })
}

/**
 * 更新原型图片说明与排序
 */
export function updateImage(data: { id: number; caption?: string; sort?: number }) {
  return request.put({ url: '/admin/work/image/update', data })
}

/**
 * 删除原型图片
 */
export function deleteImage(id: number) {
  return request.del({ url: `/admin/work/image/delete/${id}` })
}

// ==================== 拆解文章接口 ====================

/**
 * 获取指定作品的拆解文章列表
 */
export function getArticleList(workId: number) {
  return request.get<BreakdownArticle[]>({ url: '/admin/work/article/list', params: { workId } })
}

/**
 * 新增拆解文章
 */
export function addArticle(data: { workId: number; title: string; content?: string; status?: PublishStatus; sort?: number }) {
  return request.post({ url: '/admin/work/article/add', data })
}

/**
 * 更新拆解文章
 */
export function updateArticle(data: { id: number; title?: string; content?: string; status?: PublishStatus; sort?: number }) {
  return request.put({ url: '/admin/work/article/update', data })
}

/**
 * 删除拆解文章
 */
export function deleteArticle(id: number) {
  return request.del({ url: `/admin/work/article/delete/${id}` })
}

/**
 * 切换拆解文章发布状态（发布/下架）
 */
export function toggleArticleStatus(id: number) {
  return request.put({ url: '/admin/work/article/toggle-status', data: { id } })
}
