import { Injectable } from '@nestjs/common'
import { PrismaService } from '@/common/prisma.service'
import {
  SiteThoughtItemVo,
  SiteThoughtDetailVo,
  SiteThoughtSectionVo,
} from '../vo/site-thought.vo'

/**
 * 展示站点「最新思考」服务
 * 数据源为 breakdown_article（作品拆解文章）：草稿隔离（status=1）、按创建时间倒序。
 * 详情正文由富文本解析为纯文本分节（防 XSS），并提供按时间相邻的上下篇导航。
 * 底层查询异常向上抛出，由前端加载失败空态兜底。
 */
@Injectable()
export class SiteThoughtService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 获取全部已发布思考文章列表
   * 草稿隔离（仅 status=1），按创建时间倒序，拼接所属作品标题与 slug。
   * @returns 思考列表项
   */
  async getThoughts(): Promise<SiteThoughtItemVo[]> {
    const articles = await this.prisma.breakdownArticle.findMany({
      where: { status: 1 },
      orderBy: { createTime: 'desc' },
      include: { work: { select: { title: true, slug: true } } },
      // 公开无鉴权接口，限制单次返回条数作为纵深防御，避免文章量增长导致响应体过大
      take: 200,
    })
    return articles.map((a) => ({
      id: a.id,
      title: a.title,
      desc: this.toPlainSummary(a.content, 60),
      date: this.toYearMonthDay(a.createTime),
      workTitle: a.work?.title ?? '',
      workSlug: a.work?.slug ?? null,
    }))
  }

  /**
   * 按 ID 获取思考文章详情
   * 仅返回已发布文章；ID 不存在或指向草稿时返回 null（由控制器转 404）。
   * @param id 文章 ID
   * @returns 思考详情，未找到返回 null
   */
  async getThoughtDetail(id: number): Promise<SiteThoughtDetailVo | null> {
    // ID 非法（非正整数）直接视为未找到，不发起无意义查询
    if (!Number.isInteger(id) || id <= 0) return null

    const article = await this.prisma.breakdownArticle.findFirst({
      where: { id, status: 1 },
      include: { work: { select: { title: true, slug: true } } },
    })
    if (!article) return null

    const { prev, next } = await this.buildNav(article.createTime, article.id)

    return {
      id: article.id,
      title: article.title,
      date: this.toYearMonthDay(article.createTime),
      workTitle: article.work?.title ?? '',
      workSlug: article.work?.slug ?? null,
      sections: this.parseSections(article.content),
      prev,
      next,
    }
  }

  /**
   * 构建上一篇 / 下一篇导航
   * 以当前文章创建时间为界，在已发布文章中取相邻两条（同列表倒序口径）。
   * prev = 更新的一篇（时间更大），next = 更旧的一篇（时间更小）。
   * @param pivot 当前文章创建时间
   * @param currentId 当前文章 ID（排除自身）
   * @returns 上下篇导航对象
   */
  private async buildNav(
    pivot: Date,
    currentId: number,
  ): Promise<{ prev: { id: number; title: string } | null; next: { id: number; title: string } | null }> {
    // 更新的一篇：创建时间 > pivot 中最接近的一条（升序取第一条）
    const prevArticle = await this.prisma.breakdownArticle.findFirst({
      where: { status: 1, createTime: { gt: pivot }, id: { not: currentId } },
      orderBy: { createTime: 'asc' },
      select: { id: true, title: true },
    })
    // 更旧的一篇：创建时间 < pivot 中最接近的一条（降序取第一条）
    const nextArticle = await this.prisma.breakdownArticle.findFirst({
      where: { status: 1, createTime: { lt: pivot }, id: { not: currentId } },
      orderBy: { createTime: 'desc' },
      select: { id: true, title: true },
    })
    return {
      prev: prevArticle ? { id: prevArticle.id, title: prevArticle.title } : null,
      next: nextArticle ? { id: nextArticle.id, title: nextArticle.title } : null,
    }
  }

  /**
   * 将富文本正文解析为展示用分节
   * 以 h1-h4 标题切分，标题下的段落归入该节；首个标题前的内容并入「正文」默认节。
   * 无标题时全文作为单节。全程去标签，前端渲染纯文本，规避富文本 XSS。
   * @param html 富文本正文（可能为 null）
   * @returns 分节数组（无正文时返回空数组）
   */
  private parseSections(html: string | null): SiteThoughtSectionVo[] {
    if (!html || !html.trim()) return []

    // 先剔除 script/style 整块，避免脚本/样式内容混入正文
    const cleaned = html.replace(/<(script|style)[^>]*>[\s\S]*?<\/\1>/gi, '')

    const sections: SiteThoughtSectionVo[] = []
    let current: SiteThoughtSectionVo = { heading: '正文', paragraphs: [] }

    // 按标题标签切分：捕获标题文本作为分节 heading
    const headingRe = /<h[1-4][^>]*>([\s\S]*?)<\/h[1-4]>/gi
    let lastIndex = 0
    let match: RegExpExecArray | null

    const flushBody = (bodyHtml: string) => {
      for (const para of this.extractParagraphs(bodyHtml)) {
        current.paragraphs.push(para)
      }
    }

    while ((match = headingRe.exec(cleaned)) !== null) {
      // 标题前的正文归入当前节
      flushBody(cleaned.slice(lastIndex, match.index))
      // 当前节有内容才入列，随后开启新节
      if (current.paragraphs.length) sections.push(current)
      const heading = this.stripTags(match[1]) || '正文'
      current = { heading, paragraphs: [] }
      lastIndex = headingRe.lastIndex
    }
    // 收尾：最后一个标题之后（或全文无标题）的正文
    flushBody(cleaned.slice(lastIndex))
    if (current.paragraphs.length) sections.push(current)

    return sections
  }

  /**
   * 从一段 HTML 中提取段落文本
   * 优先按 p/li 块切分；无块级标签时按整体去标签兜底。
   * @param html HTML 片段
   * @returns 非空段落文本数组
   */
  private extractParagraphs(html: string): string[] {
    if (!html || !html.trim()) return []
    const blockRe = /<(p|li)[^>]*>([\s\S]*?)<\/\1>/gi
    const result: string[] = []
    let match: RegExpExecArray | null
    let matched = false
    while ((match = blockRe.exec(html)) !== null) {
      matched = true
      const text = this.stripTags(match[2])
      if (text) result.push(text)
    }
    if (!matched) {
      const text = this.stripTags(html)
      if (text) result.push(text)
    }
    return result
  }

  /**
   * 去除 HTML 标签并还原基础实体、折叠空白
   * @param html HTML 片段
   * @returns 纯文本
   */
  private stripTags(html: string): string {
    return html
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/\s+/g, ' ')
      .trim()
  }

  /**
   * 富文本去标签并截取为纯文本摘要
   * @param html 富文本内容（可能为 null）
   * @param maxLen 最大字符数
   * @returns 纯文本摘要（超长截断加省略号）
   */
  private toPlainSummary(html: string | null, maxLen: number): string {
    if (!html) return ''
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
   * 日期转 YYYY.MM.DD（东八区）
   * @param date 日期
   * @returns 形如 2024.03.15 的字符串
   */
  private toYearMonthDay(date: Date): string {
    const local = new Date(date.getTime() + 8 * 60 * 60 * 1000)
    const y = local.getUTCFullYear()
    const m = String(local.getUTCMonth() + 1).padStart(2, '0')
    const d = String(local.getUTCDate()).padStart(2, '0')
    return `${y}.${m}.${d}`
  }
}
