/**
 * 作品管理 Mock 数据源
 * 包含作品、原型版本、原型图片、拆解文章四类数据及共用工具函数
 * 作品删除级联清除版本/图片/文章；版本删除级联清除图片
 */

export interface MockWork {
  id: number
  title: string
  slug: string
  intro: string | null
  cover: string | null
  detail: string | null
  categoryId: number
  featured: boolean
  status: 0 | 1
  views: number
  sort: number | null
  publishTime: string | null
  createTime: string
}

export interface MockVersion {
  id: number
  workId: number
  name: string
  title: string | null
  sort: number | null
  createTime: string
}

export interface MockImage {
  id: number
  versionId: number
  url: string
  caption: string | null
  sort: number | null
  createTime: string
}

export interface MockArticle {
  id: number
  workId: number
  title: string
  content: string | null
  status: 0 | 1
  sort: number | null
  createTime: string
}

// 作品数据（分类 ID 对应 mock/category.ts：1 AI产品 / 2 医疗健康 / 3 智能外呼 / 4 CRM）
export const works: MockWork[] = [
  {
    id: 1,
    title: '智能客服对话系统',
    slug: 'ai-chatbot',
    intro: '面向企业的多轮对话智能客服，支持意图识别与知识库问答。',
    cover: null,
    detail: '<p>项目覆盖对话管理、意图识别、知识库三大模块。</p>',
    categoryId: 1,
    featured: true,
    status: 1,
    views: 1280,
    sort: 1,
    publishTime: '2026-02-10 10:00:00',
    createTime: '2026-01-10 09:00:00'
  },
  {
    id: 2,
    title: '在线问诊平台',
    slug: 'online-consultation',
    intro: '连接患者与医生的在线问诊与健康管理平台。',
    cover: null,
    detail: '<p>包含图文问诊、电子处方、健康档案等功能。</p>',
    categoryId: 2,
    featured: false,
    status: 1,
    views: 860,
    sort: 2,
    publishTime: '2026-02-15 14:00:00',
    createTime: '2026-01-12 09:00:00'
  },
  {
    id: 3,
    title: '智能外呼调度系统',
    slug: 'outbound-dispatch',
    intro: '基于策略的智能外呼任务调度与数据分析系统。',
    cover: null,
    detail: '<p>支持外呼任务编排、坐席分配与通话数据看板。</p>',
    categoryId: 3,
    featured: false,
    status: 0,
    views: 0,
    sort: null,
    publishTime: null,
    createTime: '2026-01-20 09:00:00'
  }
]

// 原型版本数据
export const versions: MockVersion[] = [
  { id: 1, workId: 1, name: 'V1', title: '初版交互框架', sort: 1, createTime: '2026-01-11 09:00:00' },
  { id: 2, workId: 1, name: 'V2', title: '优化对话流程', sort: 2, createTime: '2026-01-18 09:00:00' },
  { id: 3, workId: 2, name: 'V1', title: '问诊主流程', sort: 1, createTime: '2026-01-13 09:00:00' }
]

// 原型图片数据
export const images: MockImage[] = [
  { id: 1, versionId: 1, url: 'https://picsum.photos/seed/p1/800/600', caption: '首页对话界面', sort: 1, createTime: '2026-01-11 10:00:00' },
  { id: 2, versionId: 1, url: 'https://picsum.photos/seed/p2/800/600', caption: '知识库配置', sort: 2, createTime: '2026-01-11 10:05:00' },
  { id: 3, versionId: 2, url: 'https://picsum.photos/seed/p3/800/600', caption: '多轮对话优化', sort: 1, createTime: '2026-01-18 10:00:00' }
]

// 拆解文章数据
export const articles: MockArticle[] = [
  { id: 1, workId: 1, title: '对话系统的意图识别设计', content: '<p>意图识别采用分层分类策略……</p>', status: 1, sort: 1, createTime: '2026-02-01 09:00:00' },
  { id: 2, workId: 1, title: '知识库召回优化思路', content: '<p>通过向量检索提升召回率……</p>', status: 0, sort: 2, createTime: '2026-02-05 09:00:00' }
]

// 自增 ID 计数器
export const idSeq = { work: 100, version: 100, image: 100, article: 100 }

/**
 * 分类 ID → 名称映射（与 mock/category.ts 初始数据对应）
 * 作品/首页配置/数据统计三处共用，集中维护避免漂移
 */
export const categoryNameMap: Record<number, string> = {
  1: 'AI 产品',
  2: '医疗健康',
  3: '智能外呼',
  4: 'CRM 系统',
  5: '待归档'
}

/** 按分类 ID 取名称，无对应时返回 '-' */
export function getCategoryName(id: number): string {
  return categoryNameMap[id] || '-'
}

/** 生成当前时间字符串 */
export function now(): string {
  return new Date().toLocaleString('zh-CN', { hour12: false })
}

/**
 * 通用排序：排序值升序，无值（null）排在有值之后，
 * tieBreaker 决定排序值相同/均无值时的次级比较
 */
export function sortBySortValue<T extends { sort: number | null }>(
  list: T[],
  tieBreaker: (a: T, b: T) => number
): T[] {
  return [...list].sort((a, b) => {
    const aNull = a.sort === null
    const bNull = b.sort === null
    if (aNull && bNull) return tieBreaker(a, b)
    if (aNull) return 1
    if (bNull) return -1
    if (a.sort !== b.sort) return (a.sort as number) - (b.sort as number)
    return tieBreaker(a, b)
  })
}

/** 按新增时间升序比较 */
export function byCreateAsc(a: { createTime: string }, b: { createTime: string }): number {
  return new Date(a.createTime).getTime() - new Date(b.createTime).getTime()
}

/** 按新增时间倒序比较 */
export function byCreateDesc(a: { createTime: string }, b: { createTime: string }): number {
  return new Date(b.createTime).getTime() - new Date(a.createTime).getTime()
}

/** slug 格式校验：仅英文字母、数字、连字符 */
export function isValidSlug(slug: string): boolean {
  return /^[a-zA-Z0-9-]+$/.test(slug)
}
