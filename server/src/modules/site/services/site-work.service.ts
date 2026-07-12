import { createHash } from 'crypto'
import { Injectable, Logger } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { PrismaService } from '@/common/prisma.service'
import { SiteWorkItemVo, SiteWorkDetailVo, SiteWorkSectionVo } from '../vo/site-work.vo'

/**
 * 展示站点作品服务
 * 提供公开的已发布作品列表与详情：草稿隔离（status=1）、按发布日期倒序、
 * 详情含由富文本解析的正文分节与上下篇导航。底层查询异常向上抛出，由前端加载失败空态兜底。
 * 另提供访问量去重累加（recordView），作为详情请求的副作用，异常不影响详情返回。
 */
@Injectable()
export class SiteWorkService {
  private readonly logger = new Logger(SiteWorkService.name)

  constructor(private readonly prisma: PrismaService) {}

  /**
   * 获取全部已发布作品列表
   * 草稿隔离（仅 status=1），按发布时间倒序（无发布时间回退创建时间），拼接分类名。
   * @returns 作品列表项
   */
  async getWorks(): Promise<SiteWorkItemVo[]> {
    const works = await this.prisma.work.findMany({
      where: { status: 1 },
      orderBy: [{ publishTime: 'desc' }, { createTime: 'desc' }],
      include: { category: { select: { name: true } } },
      // 公开无鉴权接口，限制单次返回条数作为纵深防御，避免作品量增长导致响应体过大
      take: 200,
    })
    return works.map((w) => ({
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
   * 按 slug 获取作品详情
   * 仅返回已发布作品；slug 不存在或指向草稿时返回 null（由控制器转 404）。
   * @param slug 作品唯一标识
   * @returns 作品详情，未找到返回 null
   */
  async getWorkDetail(slug: string): Promise<SiteWorkDetailVo | null> {
    const work = await this.prisma.work.findFirst({
      where: { slug, status: 1 },
      include: { category: { select: { name: true } } },
    })
    if (!work) return null

    const { prev, next } = await this.buildNav(work.publishTime ?? work.createTime, work.id)

    return {
      id: work.id,
      title: work.title,
      slug: work.slug,
      category: work.category?.name ?? '-',
      intro: work.intro,
      cover: work.cover,
      date: this.toYearMonth(work.publishTime ?? work.createTime),
      // 以下字段后端表无对应数据源，返回安全默认值（不编造）
      role: null,
      duration: null,
      tags: [],
      overview: null,
      sections: this.parseSections(work.detail),
      prev,
      next,
    }
  }

  /**
   * 记录一次作品访问并按同源自然日去重累加访问量
   * 以 visitorKey（IP+UA 的 sha256 前 32 位，脱敏不存原始 IP）+ visitDate（UTC 自然日）
   * 借 work_view_log 唯一约束去重：插入成功则 Work.views 原子 +1；命中唯一冲突（P2002）视为
   * 当日已记录，跳过累加。整体为详情请求的副作用，任何异常都吞掉并记日志，不向上抛出、不影响详情返回。
   * @param workId 作品 ID
   * @param ip 客户端 IP（已由控制器解析，可能为空串）
   * @param userAgent 客户端 User-Agent（可能为空串）
   */
  async recordView(workId: number, ip: string, userAgent: string): Promise<void> {
    try {
      // 指纹：sha256(ip + ':' + userAgent) 前 32 位，仅存哈希不存原始 IP（脱敏）
      const visitorKey = createHash('sha256')
        .update(`${ip}:${userAgent}`)
        .digest('hex')
        .slice(0, 32)
      // UTC 自然日 YYYY-MM-DD，与 schema 约定一致（不用东八区，避免跨时区去重口径漂移）
      const visitDate = new Date().toISOString().slice(0, 10)

      // 事务包裹「插日志占坑 + 累加」两步，保证原子：
      // 唯一约束 [workId, visitorKey, visitDate] 命中（当日重复访问）→ create 抛 P2002 整体回滚，不累加；
      // 非重复 → 两步同成同败，避免占坑成功但累加失败导致该访客当日永久漏计。
      await this.prisma.$transaction([
        this.prisma.workViewLog.create({
          data: { workId, visitorKey, visitDate },
        }),
        this.prisma.work.update({
          where: { id: workId },
          data: { views: { increment: 1 } },
        }),
      ])
    } catch (e) {
      // P2002 = 唯一约束冲突，即同源当日已访问，属正常去重命中，静默跳过
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
        return
      }
      // 其余异常（如作品刚被删导致 update 失败）不影响详情返回，仅记录告警
      this.logger.warn(`访问量累加失败（workId=${workId}）：${e instanceof Error ? e.message : e}`)
    }
  }

  /**
   * 构建上一篇 / 下一篇导航
   * 以当前作品发布日期为界，在已发布作品中取相邻两条（同列表倒序口径）。
   * prev = 更新的一篇（日期更大），next = 更旧的一篇（日期更小）。
   * @param pivot 当前作品的发布/创建时间
   * @param currentId 当前作品 ID（排除自身）
   * @returns 上下篇导航对象
   */
  private async buildNav(
    pivot: Date,
    currentId: number,
  ): Promise<{ prev: { title: string; slug: string } | null; next: { title: string; slug: string } | null }> {
    // 更新的一篇：发布时间 > pivot 中最接近的一条（升序取第一条）
    const prevWork = await this.prisma.work.findFirst({
      where: { status: 1, publishTime: { gt: pivot }, id: { not: currentId } },
      orderBy: { publishTime: 'asc' },
      select: { title: true, slug: true },
    })
    // 更旧的一篇：发布时间 < pivot 中最接近的一条（降序取第一条）
    const nextWork = await this.prisma.work.findFirst({
      where: { status: 1, publishTime: { lt: pivot }, id: { not: currentId } },
      orderBy: { publishTime: 'desc' },
      select: { title: true, slug: true },
    })
    return {
      prev: prevWork ? { title: prevWork.title, slug: prevWork.slug } : null,
      next: nextWork ? { title: nextWork.title, slug: nextWork.slug } : null,
    }
  }

  /**
   * 将富文本详情解析为展示用分节
   * 以 h1-h4 标题切分，标题下的段落（p/li 或纯文本块）归入该节；
   * 首个标题之前的内容并入「项目详情」默认节。无标题时全文作为单节。
   * @param html 富文本详情（可能为 null）
   * @returns 分节数组（无正文时返回空数组）
   */
  private parseSections(html: string | null): SiteWorkSectionVo[] {
    if (!html || !html.trim()) return []

    // 先剔除 script/style 整块，避免脚本/样式内容混入正文
    const cleaned = html.replace(/<(script|style)[^>]*>[\s\S]*?<\/\1>/gi, '')

    const sections: SiteWorkSectionVo[] = []
    let current: SiteWorkSectionVo = { heading: '项目详情', paragraphs: [] }

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
      const heading = this.stripTags(match[1]) || '项目详情'
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
   * 优先按 p/li 块切分；无块级标签时按换行/纯文本兜底。
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
      // 无块级标签：整体去标签后作为单段
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
   * 日期转 YYYY.MM（东八区）
   * @param date 日期
   * @returns 形如 2024.03 的字符串
   */
  private toYearMonth(date: Date): string {
    const local = new Date(date.getTime() + 8 * 60 * 60 * 1000)
    const y = local.getUTCFullYear()
    const m = String(local.getUTCMonth() + 1).padStart(2, '0')
    return `${y}.${m}`
  }
}
