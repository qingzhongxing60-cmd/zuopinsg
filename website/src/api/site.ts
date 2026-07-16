/**
 * 展示站点 - 首页相关接口
 * 与后端约定响应格式：{ code, data, message }，code=0 表示成功
 */

/** 首页精选作品项 */
export interface FeaturedWork {
  id: number
  title: string
  slug: string
  category: string
  intro: string | null
  cover: string | null
  date: string
}

/** 能力项 */
export interface Capability {
  name: string
  score: number
  title: string
  desc: string
}

/** 思考文章项 */
export interface Thought {
  id: number
  title: string
  desc: string
  date: string
}

/** 成长历程节点 */
export interface TimelineNode {
  period: string
  title: string
  desc: string
}

/** 成长历程节点（独立页用，含可选标签） */
export interface TimelineItem {
  period: string
  title: string
  desc: string
  tags?: string[]
}

/** 关于我 - 关键数据指标 */
export interface AboutStat {
  value: string
  label: string
}

/** 关于我 - 专长领域 */
export interface AboutExpertise {
  name: string
  desc: string
}

/** 关于我 - 联系方式（email 用 mailto，link 用外链） */
export interface AboutContact {
  type: 'email' | 'link'
  label: string
  value: string
  display?: string
}

/** 关于我聚合数据 */
export interface AboutData {
  name: string
  role: string
  avatar: string | null
  intro: string
  stats: AboutStat[]
  /** 自我介绍段落（纯文本兜底，无富文本时使用） */
  paragraphs: string[]
  /** 简历富文本（后端已净化，含图片与格式，用于 v-html 渲染） */
  resumeHtml: string
  expertise: AboutExpertise[]
  contacts: AboutContact[]
}

/** 首页聚合数据 */
export interface HomeData {
  hero: {
    eyebrow: string
    /** 标题行：text 为强调前文本，accent 强调片段，tail 强调后文本，accentColor 自定义强调色 */
    titleLines: { text: string; accent?: string; accentColor?: string; tail?: string }[]
    subtitle: string | null
    stats: { value: string; label: string }[]
    ctaText: string
    highlight: { tag: string; title: string; desc: string }
    /** 右侧·项目总数卡片 */
    projectCard: { badge: string; count: string; label: string }
    /** 右侧·强调块（逐行文案，accent=true 的行以强调色渲染） */
    accentBlock: { lines: { text: string; accent?: boolean }[] }
    /** 右侧·增长趋势卡片（bars 为各柱高度百分比，最后一根高亮） */
    growthCard: { badge: string; bars: number[] }
  }
  featured: FeaturedWork[]
  capabilities: Capability[]
  thoughts: Thought[]
  about: {
    name: string
    role: string
    avatar: string | null
    intro: string
  }
  timeline: TimelineNode[]
}

/** 作品列表项（展示端只读） */
export interface WorkItem {
  id: number
  title: string
  slug: string
  category: string
  intro: string | null
  cover: string | null
  date: string
}

/** 作品正文分节 */
export interface WorkSection {
  heading: string
  paragraphs: string[]
}

/** 上一篇/下一篇导航项 */
export interface WorkNav {
  title: string
  slug: string
}

/** 原型图片（展示端只读） */
export interface WorkPrototypeImage {
  url: string
  caption: string | null
}

/** 原型版本（展示端只读，含该版本下的图片） */
export interface WorkPrototypeVersion {
  name: string
  title: string | null
  images: WorkPrototypeImage[]
}

/** 作品详情（含正文分节、原型演示与上下篇导航） */
export interface WorkDetail {
  id: number
  title: string
  slug: string
  category: string
  intro: string | null
  cover: string | null
  date: string
  role: string | null
  duration: string | null
  tags: string[]
  overview: string | null
  sections: WorkSection[]
  /** 原型演示版本（仅含至少一张图片的版本，无则为空数组） */
  prototypes: WorkPrototypeVersion[]
  prev: WorkNav | null
  next: WorkNav | null
}

interface ApiResponse<T> {
  code: number
  data: T
  message: string
}

/**
 * 获取展示站点首页聚合数据
 * 精选作品已在服务端执行草稿隔离（仅返回已发布作品）
 */
export async function getHomeData(): Promise<HomeData> {
  const res = await fetch('/api/site/home')
  const json = (await res.json()) as ApiResponse<HomeData>
  // 兼容 mock (code=0) 和后端 API (code=200)
  if (json.code !== 0 && json.code !== 200) {
    throw new Error(json.message || '获取首页数据失败')
  }
  return json.data
}

/**
 * 获取全部已发布作品列表
 * 服务端已执行草稿隔离（仅返回已发布作品）并按日期倒序排列
 */
export async function getWorks(): Promise<WorkItem[]> {
  const res = await fetch('/api/site/works')
  const json = (await res.json()) as ApiResponse<WorkItem[]>
  // 兼容 mock (code=0) 和后端 API (code=200)
  if (json.code !== 0 && json.code !== 200) {
    throw new Error(json.message || '获取作品列表失败')
  }
  return json.data
}

/** 作品分类项（展示端用） */
export interface CategoryItem {
  id: number
  name: string
  slug: string
  sort: number
}

/**
 * 获取全部作品分类列表
 * 无需登录鉴权，按排序值升序返回所有分类。
 */
export async function getCategories(): Promise<CategoryItem[]> {
  const res = await fetch('/api/site/categories')
  const json = (await res.json()) as ApiResponse<CategoryItem[]>
  if (json.code !== 0 && json.code !== 200) {
    throw new Error(json.message || '获取分类列表失败')
  }
  return json.data
}

/**
 * 按 slug 获取作品详情
 * 仅返回已发布作品；slug 不存在或指向草稿时 data 为 null（视为未找到，非异常）
 * @param slug 作品唯一标识
 * @returns 作品详情，未找到时返回 null
 */
export async function getWorkDetail(slug: string): Promise<WorkDetail | null> {
  const res = await fetch(`/api/site/works/${encodeURIComponent(slug)}`)
  const json = (await res.json()) as ApiResponse<WorkDetail | null>
  // code=404 表示未找到（草稿或不存在），返回 null 由页面展示未找到态
  if (json.code === 404) {
    return null
  }
  // 兼容 mock (code=0) 和后端 API (code=200)
  if (json.code !== 0 && json.code !== 200) {
    throw new Error(json.message || '获取作品详情失败')
  }
  return json.data
}

/**
 * 获取成长历程时间轴节点列表
 * 始终调用后端真实 API（不使用 mock）
 */
export async function getTimeline(): Promise<TimelineItem[]> {
  const res = await fetch('/api/site/timeline')
  const json = (await res.json()) as ApiResponse<TimelineItem[]>
  // 后端 API 返回 code=200
  if (json.code !== 200) {
    throw new Error(json.message || '获取成长历程失败')
  }
  return json.data
}

/**
 * 获取「关于我」聚合数据
 * 含个人名片、关键数据、自我介绍、专长领域与联系方式
 */
export async function getAbout(): Promise<AboutData> {
  const res = await fetch('/api/site/about')
  const json = (await res.json()) as ApiResponse<AboutData>
  // 兼容 mock (code=0) 和后端 API (code=200)
  if (json.code !== 0 && json.code !== 200) {
    throw new Error(json.message || '获取关于我数据失败')
  }
  return json.data
}

/** 思考列表项（展示端只读） */
export interface ThoughtItem {
  id: number
  title: string
  /** 纯文本摘要（后端由富文本正文去标签截取） */
  desc: string
  date: string
  /** 所属作品标题 */
  workTitle: string
  /** 所属作品 slug，用于跳转作品详情；无关联时为 null */
  workSlug: string | null
}

/** 思考正文分节 */
export interface ThoughtSection {
  heading: string
  paragraphs: string[]
}

/** 思考上一篇/下一篇导航项 */
export interface ThoughtNav {
  id: number
  title: string
}

/** 思考详情（含正文分节与上下篇导航） */
export interface ThoughtDetail {
  id: number
  title: string
  date: string
  workTitle: string
  workSlug: string | null
  sections: ThoughtSection[]
  prev: ThoughtNav | null
  next: ThoughtNav | null
}

/**
 * 获取全部已发布思考文章列表
 * 服务端已执行草稿隔离（仅返回已发布文章）并按创建时间倒序排列
 */
export async function getThoughts(): Promise<ThoughtItem[]> {
  const res = await fetch('/api/site/thoughts')
  const json = (await res.json()) as ApiResponse<ThoughtItem[]>
  // 兼容 mock (code=0) 和后端 API (code=200)
  if (json.code !== 0 && json.code !== 200) {
    throw new Error(json.message || '获取思考列表失败')
  }
  return json.data
}

/**
 * 按 ID 获取思考文章详情
 * 仅返回已发布文章；ID 不存在或指向草稿时 data 为 null（视为未找到，非异常）
 * @param id 文章 ID
 * @returns 思考详情，未找到时返回 null
 */
export async function getThoughtDetail(id: number): Promise<ThoughtDetail | null> {
  const res = await fetch(`/api/site/thoughts/${encodeURIComponent(String(id))}`)
  const json = (await res.json()) as ApiResponse<ThoughtDetail | null>
  // code=404 表示未找到（草稿或不存在），返回 null 由页面展示未找到态
  if (json.code === 404) {
    return null
  }
  // 兼容 mock (code=0) 和后端 API (code=200)
  if (json.code !== 0 && json.code !== 200) {
    throw new Error(json.message || '获取思考详情失败')
  }
  return json.data
}
