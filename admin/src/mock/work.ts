/**
 * 作品管理 Mock 处理函数
 * 涵盖作品、原型版本、原型图片、拆解文章的增删改查与级联删除
 */

import {
  works,
  versions,
  images,
  articles,
  idSeq,
  now,
  sortBySortValue,
  byCreateAsc,
  byCreateDesc,
  isValidSlug,
  getCategoryName,
  type MockWork,
  type MockVersion,
  type MockImage,
  type MockArticle
} from './work-data'

// ==================== 作品 ====================

/** 获取作品列表（带分类名，支持标题/分类/状态筛选） */
export function getWorkListMock(params?: {
  title?: string
  categoryId?: number
  status?: 0 | 1
}): (MockWork & { categoryName: string })[] {
  let result = [...works]
  const title = params?.title?.trim()
  if (title) result = result.filter((w) => w.title.includes(title))
  if (params?.categoryId !== undefined && params.categoryId !== null) {
    result = result.filter((w) => w.categoryId === Number(params.categoryId))
  }
  if (params?.status !== undefined && params.status !== null) {
    result = result.filter((w) => w.status === Number(params.status))
  }
  const sorted = sortBySortValue(result, byCreateDesc)
  return sorted.map((w) => ({ ...w, categoryName: getCategoryName(w.categoryId) }))
}

/** 校验作品唯一标识（格式 + 全局唯一），excludeId 用于编辑时排除自身 */
function validateWorkSlug(slug: string, excludeId?: number): void {
  if (!isValidSlug(slug)) {
    throw new Error('唯一标识仅允许英文字母、数字和连字符')
  }
  if (works.some((w) => w.slug === slug && w.id !== excludeId)) {
    throw new Error('唯一标识已存在，请更换')
  }
}

/** 新增作品 */
export function addWorkMock(data: Partial<MockWork>): MockWork {
  if (!data.title) throw new Error('请输入作品标题')
  if (!data.slug) throw new Error('请输入唯一标识')
  validateWorkSlug(data.slug)
  if (!data.categoryId) throw new Error('请选择所属分类')
  const status = (data.status ?? 0) as 0 | 1
  const item: MockWork = {
    id: idSeq.work++,
    title: data.title,
    slug: data.slug,
    intro: data.intro ?? null,
    cover: data.cover ?? null,
    detail: data.detail ?? null,
    categoryId: data.categoryId,
    featured: data.featured ?? false,
    status,
    views: 0,
    sort: data.sort ?? null,
    // 新增即发布时记录发布时间
    publishTime: status === 1 ? now() : null,
    createTime: now()
  }
  works.push(item)
  return item
}

/** 更新作品（访问量、发布时间不可通过此接口篡改） */
export function updateWorkMock(data: Partial<MockWork> & { id: number }): MockWork {
  const target = works.find((w) => w.id === data.id)
  if (!target) throw new Error('作品不存在')
  if (data.slug !== undefined) validateWorkSlug(data.slug, data.id)
  if (data.categoryId !== undefined && !data.categoryId) throw new Error('请选择所属分类')

  const prevStatus = target.status
  if (data.title !== undefined) target.title = data.title
  if (data.slug !== undefined) target.slug = data.slug
  if (data.intro !== undefined) target.intro = data.intro
  if (data.cover !== undefined) target.cover = data.cover
  if (data.detail !== undefined) target.detail = data.detail
  if (data.categoryId !== undefined) target.categoryId = data.categoryId
  if (data.featured !== undefined) target.featured = data.featured
  if (data.sort !== undefined) target.sort = data.sort
  if (data.status !== undefined) {
    target.status = data.status
    // 首次由草稿变为已发布时记录发布时间，后续不覆盖
    if (prevStatus === 0 && data.status === 1 && !target.publishTime) {
      target.publishTime = now()
    }
  }
  return target
}

/** 删除作品（级联删除版本、图片、文章） */
export function deleteWorkMock(id: number): boolean {
  const index = works.findIndex((w) => w.id === id)
  if (index === -1) throw new Error('作品不存在')
  // 找到该作品下所有版本，删除版本及其图片
  const versionIds = versions.filter((v) => v.workId === id).map((v) => v.id)
  for (let i = images.length - 1; i >= 0; i--) {
    if (versionIds.includes(images[i].versionId)) images.splice(i, 1)
  }
  for (let i = versions.length - 1; i >= 0; i--) {
    if (versions[i].workId === id) versions.splice(i, 1)
  }
  for (let i = articles.length - 1; i >= 0; i--) {
    if (articles[i].workId === id) articles.splice(i, 1)
  }
  works.splice(index, 1)
  return true
}

/** 切换作品发布状态 */
export function toggleWorkStatusMock(id: number): MockWork {
  const target = works.find((w) => w.id === id)
  if (!target) throw new Error('作品不存在')
  target.status = target.status === 1 ? 0 : 1
  if (target.status === 1 && !target.publishTime) target.publishTime = now()
  return target
}

/** 切换作品精选标记 */
export function toggleWorkFeaturedMock(id: number): MockWork {
  const target = works.find((w) => w.id === id)
  if (!target) throw new Error('作品不存在')
  target.featured = !target.featured
  return target
}

// ==================== 原型版本 ====================

/** 获取作品的版本列表（排序值升序，相同按新增时间升序） */
export function getVersionListMock(workId: number): MockVersion[] {
  return sortBySortValue(
    versions.filter((v) => v.workId === Number(workId)),
    byCreateAsc
  )
}

/** 新增原型版本（版本名在作品内唯一） */
export function addVersionMock(data: {
  workId: number
  name: string
  title?: string
  sort?: number
}): MockVersion {
  if (!data.name) throw new Error('请输入版本名')
  if (versions.some((v) => v.workId === data.workId && v.name === data.name)) {
    throw new Error('该版本名已存在，请更换')
  }
  const item: MockVersion = {
    id: idSeq.version++,
    workId: data.workId,
    name: data.name,
    title: data.title ?? null,
    sort: data.sort ?? null,
    createTime: now()
  }
  versions.push(item)
  return item
}

/** 更新原型版本（版本名在作品内唯一，排除自身） */
export function updateVersionMock(
  id: number,
  data: { name?: string; title?: string; sort?: number }
): MockVersion {
  const target = versions.find((v) => v.id === id)
  if (!target) throw new Error('版本不存在')
  if (data.name !== undefined) {
    if (!data.name) throw new Error('请输入版本名')
    if (versions.some((v) => v.workId === target.workId && v.name === data.name && v.id !== id)) {
      throw new Error('该版本名已存在，请更换')
    }
    target.name = data.name
  }
  if (data.title !== undefined) target.title = data.title
  if (data.sort !== undefined) target.sort = data.sort
  return target
}

/** 删除原型版本（级联删除该版本下全部图片） */
export function deleteVersionMock(id: number): boolean {
  const index = versions.findIndex((v) => v.id === id)
  if (index === -1) throw new Error('版本不存在')
  for (let i = images.length - 1; i >= 0; i--) {
    if (images[i].versionId === id) images.splice(i, 1)
  }
  versions.splice(index, 1)
  return true
}

// ==================== 原型图片 ====================

/** 获取版本的图片列表（排序值升序，相同按上传时间升序） */
export function getImageListMock(versionId: number): MockImage[] {
  return sortBySortValue(
    images.filter((img) => img.versionId === Number(versionId)),
    byCreateAsc
  )
}

/** 批量新增原型图片 */
export function addImagesMock(data: {
  versionId: number
  images: { url: string; caption?: string; sort?: number }[]
}): MockImage[] {
  if (!data.images?.length) throw new Error('请至少上传一张图片')
  const added: MockImage[] = data.images.map((img) => ({
    id: idSeq.image++,
    versionId: data.versionId,
    url: img.url,
    caption: img.caption ?? null,
    sort: img.sort ?? null,
    createTime: now()
  }))
  images.push(...added)
  return added
}

/** 更新原型图片说明与排序 */
export function updateImageMock(
  id: number,
  data: { caption?: string; sort?: number }
): MockImage {
  const target = images.find((img) => img.id === id)
  if (!target) throw new Error('图片不存在')
  if (data.caption !== undefined) target.caption = data.caption
  if (data.sort !== undefined) target.sort = data.sort
  return target
}

/** 删除原型图片 */
export function deleteImageMock(id: number): boolean {
  const index = images.findIndex((img) => img.id === id)
  if (index === -1) throw new Error('图片不存在')
  images.splice(index, 1)
  return true
}

// ==================== 拆解文章 ====================

/** 获取作品的拆解文章列表（排序值升序，相同按新增时间升序） */
export function getArticleListMock(workId: number): MockArticle[] {
  return sortBySortValue(
    articles.filter((a) => a.workId === Number(workId)),
    byCreateAsc
  )
}

/** 新增拆解文章 */
export function addArticleMock(data: {
  workId: number
  title: string
  content?: string
  status?: 0 | 1
  sort?: number
}): MockArticle {
  if (!data.title) throw new Error('请输入文章标题')
  const item: MockArticle = {
    id: idSeq.article++,
    workId: data.workId,
    title: data.title,
    content: data.content ?? null,
    status: (data.status ?? 0) as 0 | 1,
    sort: data.sort ?? null,
    createTime: now()
  }
  articles.push(item)
  return item
}

/** 更新拆解文章 */
export function updateArticleMock(
  id: number,
  data: { title?: string; content?: string; status?: 0 | 1; sort?: number }
): MockArticle {
  const target = articles.find((a) => a.id === id)
  if (!target) throw new Error('文章不存在')
  if (data.title !== undefined) {
    if (!data.title) throw new Error('请输入文章标题')
    target.title = data.title
  }
  if (data.content !== undefined) target.content = data.content
  if (data.status !== undefined) target.status = data.status
  if (data.sort !== undefined) target.sort = data.sort
  return target
}

/** 删除拆解文章 */
export function deleteArticleMock(id: number): boolean {
  const index = articles.findIndex((a) => a.id === id)
  if (index === -1) throw new Error('文章不存在')
  articles.splice(index, 1)
  return true
}

/** 切换拆解文章发布状态 */
export function toggleArticleStatusMock(id: number): MockArticle {
  const target = articles.find((a) => a.id === id)
  if (!target) throw new Error('文章不存在')
  target.status = target.status === 1 ? 0 : 1
  return target
}
