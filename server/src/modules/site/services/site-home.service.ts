import { Injectable } from '@nestjs/common'
import { PrismaService } from '@/common/prisma.service'
import {
  SiteHomeVo,
  SiteHeroVo,
  SiteHeroTitleLineVo,
  SiteFeaturedWorkVo,
  SiteCapabilityVo,
  SiteThoughtVo,
  SiteAboutVo,
  SiteTimelineItemVo,
} from '../vo/site-home.vo'

/** HomeConfig / AboutMe 均为全局唯一单条记录，固定主键 */
const SINGLETON_ID = 1

/**
 * 展示站点首页聚合服务
 * 聚合 HomeConfig（标语/精选ID）、Work（精选作品）、Skill（能力）、
 * AboutMe（关于我）、BreakdownArticle（最新思考）、TimelineNode（成长历程），
 * 拼装为前端 HomeData 契约。单条配置/关于我无记录时回退安全默认值；
 * 底层查询异常向上抛出，由前端加载失败空态兜底。
 */
@Injectable()
export class SiteHomeService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 获取首页聚合数据
   * @returns 首页聚合结构（对齐前端 HomeData）
   */
  async getHome(): Promise<SiteHomeVo> {
    const config = await this.prisma.homeConfig.findUnique({ where: { id: SINGLETON_ID } })
    const featuredIds = this.parseFeaturedIds(config?.featuredWorkIds)
    const highlightText = config?.highlightText ?? null
    const highlightColor = config?.highlightColor ?? null

    const [featured, capabilities, thoughts, about, timeline, publishedCount, skillCount] =
      await Promise.all([
        this.buildFeatured(featuredIds),
        this.buildCapabilities(),
        this.buildThoughts(),
        this.buildAbout(),
        this.buildTimeline(),
        this.prisma.work.count({ where: { status: 1 } }),
        this.prisma.skill.count(),
      ])

    const hero = this.buildHero({
      slogan: config?.slogan ?? '',
      subtitle: config?.subtitle ?? null,
      highlightText,
      highlightColor,
      featured,
      publishedCount,
      skillCount,
      timelineCount: timeline.length,
    })

    return { hero, featured, capabilities, thoughts, about, timeline }
  }

  /**
   * 构建 Hero 标语区
   * 装饰性文案用默认值；统计与项目数由真实数据派生；高亮块取最新精选作品。
   * @param ctx 标语、副标题及各类真实计数
   * @returns Hero 聚合结构
   */
  private buildHero(ctx: {
    slogan: string
    subtitle: string | null
    highlightText: string | null
    highlightColor: string | null
    featured: SiteFeaturedWorkVo[]
    publishedCount: number
    skillCount: number
    timelineCount: number
  }): SiteHeroVo {
    const latest = ctx.featured[0]
    return {
      eyebrow: 'AI PRODUCT MANAGER',
      titleLines: ctx.slogan
        ? this.buildTitleLines(ctx.slogan, ctx.highlightText, ctx.highlightColor)
        : [{ text: '用 ', accent: 'AI' }, { text: '产品的', accent: '每一刻' }],
      subtitle: ctx.subtitle,
      stats: [
        { value: `${ctx.publishedCount}`, label: '作品案例' },
        { value: `${ctx.skillCount}`, label: '能力维度' },
        { value: `${ctx.timelineCount}`, label: '成长节点' },
      ],
      ctaText: '探索作品',
      highlight: latest
        ? { tag: 'LATEST WORK', title: latest.title, desc: latest.intro ?? '' }
        : { tag: 'LATEST WORK', title: '暂无代表作', desc: '' },
      projectCard: { badge: 'PROJECTS', count: `${ctx.publishedCount}`, label: '作品案例总数' },
      accentBlock: { lines: [{ text: '智能' }, { text: '产品', accent: true }, { text: '设计' }] },
      growthCard: { badge: 'GROWTH', bars: [35, 45, 42, 58, 70, 85, 100] },
    }
  }

  /**
   * 将标语拆分为标题行，命中高亮片段时以强调片段渲染
   * highlightText 须为 slogan 的子串且非空，否则整段作普通文本返回。
   * @param slogan 展示标语
   * @param highlightText 需高亮的子串（可空）
   * @param highlightColor 高亮颜色（可空，缺省用主题强调色）
   * @returns 标题行数组
   */
  private buildTitleLines(
    slogan: string,
    highlightText: string | null,
    highlightColor: string | null,
  ): SiteHeroTitleLineVo[] {
    const keyword = highlightText?.trim() ?? ''
    const start = keyword ? slogan.indexOf(keyword) : -1
    // 无高亮或未命中：整段普通文本
    if (!keyword || start === -1) {
      return [{ text: slogan }]
    }
    const line: SiteHeroTitleLineVo = {
      text: slogan.slice(0, start),
      accent: keyword,
      tail: slogan.slice(start + keyword.length),
    }
    const color = highlightColor?.trim()
    if (color) line.accentColor = color
    return [line]
  }

  /**
   * 构建精选作品列表
   * 按 featuredWorkIds 顺序取已发布作品（草稿隔离），保持配置顺序。
   * @param ids 精选作品 ID 列表
   * @returns 精选作品展示项
   */
  private async buildFeatured(ids: number[]): Promise<SiteFeaturedWorkVo[]> {
    if (!ids.length) return []
    const works = await this.prisma.work.findMany({
      where: { id: { in: ids }, status: 1 },
      include: { category: { select: { name: true } } },
    })
    // 按配置顺序重排（数据库 in 查询不保证顺序）
    const byId = new Map(works.map((w) => [w.id, w]))
    return ids
      .map((id) => byId.get(id))
      .filter((w): w is NonNullable<typeof w> => !!w)
      .map((w) => ({
        id: w.id,
        title: w.title,
        slug: w.slug,
        category: w.category?.name ?? '-',
        intro: w.intro,
        cover: w.cover,
        date: this.toYearMonth(w.publishTime ?? w.createTime),
      }))
  }

  /**
   * 构建能力图谱
   * 取全部技能，name/score 用于雷达图，title/desc 用于列表（desc 无数据源留空）。
   * @returns 能力项列表
   */
  private async buildCapabilities(): Promise<SiteCapabilityVo[]> {
    const skills = await this.prisma.skill.findMany({
      orderBy: [{ sort: 'asc' }, { createTime: 'asc' }],
    })
    return skills.map((s) => ({ name: s.name, score: s.score, title: s.name, desc: '' }))
  }

  /**
   * 构建最新思考
   * 取已发布拆解文章，按创建时间倒序取前 5 条，正文去标签截取为摘要。
   * @returns 思考项列表
   */
  private async buildThoughts(): Promise<SiteThoughtVo[]> {
    const articles = await this.prisma.breakdownArticle.findMany({
      where: { status: 1 },
      orderBy: { createTime: 'desc' },
      take: 5,
    })
    return articles.map((a) => ({
      id: a.id,
      title: a.title,
      desc: this.toPlainSummary(a.content, 50),
      date: this.toYearMonthDay(a.createTime),
    }))
  }

  /**
   * 构建关于我
   * name/role 后端表无对应字段，返回空字符串（不编造）；avatar/intro 取真实值。
   * @returns 关于我精简卡片
   */
  private async buildAbout(): Promise<SiteAboutVo> {
    const about = await this.prisma.aboutMe.findUnique({ where: { id: SINGLETON_ID } })
    return {
      name: '',
      role: '',
      avatar: about?.avatar ?? null,
      intro: about?.intro ?? '',
    }
  }

  /**
   * 构建成长历程
   * 按年份升序取时间轴节点，year 转 period 字符串。
   * @returns 成长历程节点
   */
  private async buildTimeline(): Promise<SiteTimelineItemVo[]> {
    const nodes = await this.prisma.timelineNode.findMany({ orderBy: { year: 'asc' } })
    return nodes.map((n) => ({
      period: this.yearToPeriod(n.year),
      title: n.title,
      desc: n.description ?? '',
    }))
  }

  /**
   * 解析 Json 字段为数字数组（防御非法存储值）
   * @param value Prisma Json 字段值
   * @returns 数字 ID 数组
   */
  private parseFeaturedIds(value: unknown): number[] {
    if (!Array.isArray(value)) return []
    return value.filter((v): v is number => typeof v === 'number')
  }

  /**
   * 富文本去标签并截取为纯文本摘要
   * 先剔除 script/style 整块（含标签内文本），再去除其余标签，避免摘要混入脚本/样式内容。
   * @param html 富文本内容（可能为 null）
   * @param maxLen 最大字符数
   * @returns 纯文本摘要（超长截断加省略号）
   */
  private toPlainSummary(html: string | null, maxLen: number): string {
    if (!html) return ''
    // 去 HTML 标签 + 折叠空白；实体符号做基础还原
    const text = html
      .replace(/<(script|style)[^>]*>[\s\S]*?<\/\1>/gi, '')
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/\s+/g, ' ')
      .trim()
    return text.length > maxLen ? `${text.slice(0, maxLen)}…` : text
  }

  /**
   * 日期转 YYYY.MM（东八区）
   * @param date 日期
   * @returns 形如 2024.03 的字符串
   */
  private toYearMonth(date: Date): string {
    const local = this.toLocal(date)
    const y = local.getUTCFullYear()
    const m = String(local.getUTCMonth() + 1).padStart(2, '0')
    return `${y}.${m}`
  }

  /**
   * 日期转 YYYY.MM.DD（东八区）
   * @param date 日期
   * @returns 形如 2024.03.15 的字符串
   */
  private toYearMonthDay(date: Date): string {
    const local = this.toLocal(date)
    const y = local.getUTCFullYear()
    const m = String(local.getUTCMonth() + 1).padStart(2, '0')
    const d = String(local.getUTCDate()).padStart(2, '0')
    return `${y}.${m}.${d}`
  }

  /**
   * 将 UTC 时间偏移到东八区（返回可用 getUTC* 读取本地值的 Date）
   * @param date 原始日期
   * @returns 偏移后的 Date
   */
  private toLocal(date: Date): Date {
    return new Date(date.getTime() + 8 * 60 * 60 * 1000)
  }

  /**
   * 年份转时期字符串（与 site-timeline 保持一致的展示口径）
   * @param year 4 位年份
   * @returns 形如 "2021 年至今" 或 "2018 年"
   */
  private yearToPeriod(year: number): string {
    const currentYear = new Date().getFullYear()
    return year >= currentYear ? `${year} 年至今` : `${year} 年`
  }
}


