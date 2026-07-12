import { Injectable } from '@nestjs/common'
// sanitize-html 类型声明为 export =（无默认导出），用命名空间导入而非默认导入，
// 否则未开启 esModuleInterop 时会编译成运行时不存在的 .default 调用
import * as sanitizeHtml from 'sanitize-html'
import { PrismaService } from '@/common/prisma.service'
import { SiteAboutVo, SiteAboutExpertiseVo } from '../vo/site-about.vo'

/** 个人介绍为全局唯一单条记录，固定主键 */
const PROFILE_ID = 1

/**
 * 展示站点「关于我」聚合服务
 * 聚合 AboutMe（简介/头像/简历）与 Skill（专长领域），拼装为前端 AboutData 契约。
 * name/role/stats/contacts 后端表无对应数据源，返回安全默认值（空字符串/空数组），不编造。
 * 底层查询异常向上抛出，由前端加载失败空态兜底。
 */
@Injectable()
export class SiteAboutService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 获取「关于我」聚合数据
   * @returns 关于我聚合结构（对齐前端 AboutData）
   */
  async getAbout(): Promise<SiteAboutVo> {
    const [about, skills] = await Promise.all([
      this.prisma.aboutMe.findUnique({ where: { id: PROFILE_ID } }),
      this.prisma.skill.findMany({ orderBy: [{ sort: 'asc' }, { createTime: 'asc' }] }),
    ])

    return {
      name: '',
      role: '',
      avatar: about?.avatar ?? null,
      intro: about?.intro ?? '',
      stats: [],
      paragraphs: this.parseParagraphs(about?.resume ?? null),
      resumeHtml: this.sanitizeResume(about?.resume ?? null),
      expertise: this.buildExpertise(skills),
      contacts: [],
    }
  }

  /**
   * 由技能列表映射专长领域
   * 技能表无描述字段，desc 返回空字符串（前端按需展示）。
   * @param skills 技能实体列表
   * @returns 专长领域列表
   */
  private buildExpertise(skills: { name: string }[]): SiteAboutExpertiseVo[] {
    return skills.map((s) => ({ name: s.name, desc: '' }))
  }

  /**
   * 将简历富文本解析为自我介绍段落
   * 先剔除 script/style，再按 p/li 块切分；无块级标签时整体去标签作为单段。
   * @param html 简历富文本（可能为 null）
   * @returns 非空段落文本数组
   */
  private parseParagraphs(html: string | null): string[] {
    if (!html || !html.trim()) return []
    const cleaned = html.replace(/<(script|style)[^>]*>[\s\S]*?<\/\1>/gi, '')
    const blockRe = /<(p|li)[^>]*>([\s\S]*?)<\/\1>/gi
    const result: string[] = []
    let match: RegExpExecArray | null
    let matched = false
    while ((match = blockRe.exec(cleaned)) !== null) {
      matched = true
      const text = this.stripTags(match[2])
      if (text) result.push(text)
    }
    if (!matched) {
      const text = this.stripTags(cleaned)
      if (text) result.push(text)
    }
    return result
  }

  /**
   * 净化简历富文本，供前端 v-html 安全渲染
   * 白名单默认拒绝：仅放行富文本常用标签与安全属性，剥离 script/iframe/事件属性；
   * img 仅允许 http(s) 与站内 /uploads 相对路径，a 仅允许 http(s)/mailto。
   * @param html 简历富文本（可能为 null）
   * @returns 净化后的 HTML（无内容时返回空字符串）
   */
  private sanitizeResume(html: string | null): string {
    if (!html || !html.trim()) return ''
    return sanitizeHtml(html, {
      allowedTags: [
        'p', 'br', 'span', 'div',
        'strong', 'b', 'em', 'i', 'u', 's', 'sub', 'sup',
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'ul', 'ol', 'li', 'blockquote', 'pre', 'code', 'hr',
        'a', 'img',
        'table', 'thead', 'tbody', 'tr', 'th', 'td',
      ],
      allowedAttributes: {
        a: ['href', 'target', 'rel'],
        img: ['src', 'alt', 'width', 'height'],
        // 富文本内联样式：仅放行安全的排版属性
        '*': ['style'],
      },
      allowedStyles: {
        '*': {
          color: [/^#(0x)?[0-9a-f]+$/i, /^rgba?\(([\d.\s]+,){2,3}[\d.\s]+\)$/i],
          'background-color': [/^#(0x)?[0-9a-f]+$/i, /^rgba?\(([\d.\s]+,){2,3}[\d.\s]+\)$/i],
          'font-size': [/^\d+(?:\.\d+)?(?:px|em|rem|%)$/],
          'font-family': [/^[\w\s,'"-]+$/],
          'text-align': [/^(left|right|center|justify)$/],
          'line-height': [/^\d+(?:\.\d+)?(?:px|em|rem|%)?$/],
        },
      },
      // 仅放行安全协议；img 额外允许相对路径（站内 /uploads）
      allowedSchemes: ['http', 'https', 'mailto'],
      allowProtocolRelative: false,
      allowedSchemesByTag: { a: ['http', 'https', 'mailto'] },
      // 外链自动补 rel，防止 target=_blank 的 opener 劫持
      transformTags: {
        a: sanitizeHtml.simpleTransform('a', { rel: 'noopener noreferrer' }, true),
      },
    })
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
}
