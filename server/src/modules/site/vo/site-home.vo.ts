import { ApiProperty } from '@nestjs/swagger'

/**
 * 展示站点首页聚合响应 VO
 * 对齐前端契约（website/src/api/site.ts 中的 HomeData）。
 * 由后端聚合 HomeConfig / Work / Skill / AboutMe / TimelineNode 数据拼装。
 */

/** Hero 标题行（accent 为强调片段，可选） */
export class SiteHeroTitleLineVo {
  @ApiProperty({ description: '正常文本片段' })
  text: string

  @ApiProperty({ description: '强调文本片段（以强调色渲染）', required: false })
  accent?: string
}

/** Hero 统计指标项 */
export class SiteHeroStatVo {
  @ApiProperty({ description: '指标数值（展示字符串，如 "12+"）' })
  value: string

  @ApiProperty({ description: '指标标签' })
  label: string
}

/** Hero 高亮块（最新代表作） */
export class SiteHeroHighlightVo {
  @ApiProperty({ description: '标签文案' })
  tag: string

  @ApiProperty({ description: '标题' })
  title: string

  @ApiProperty({ description: '描述' })
  desc: string
}

/** Hero 右侧·项目总数卡片 */
export class SiteHeroProjectCardVo {
  @ApiProperty({ description: '角标文案' })
  badge: string

  @ApiProperty({ description: '数量（展示字符串）' })
  count: string

  @ApiProperty({ description: '说明标签' })
  label: string
}

/** Hero 右侧·强调块单行文案 */
export class SiteHeroAccentLineVo {
  @ApiProperty({ description: '文本' })
  text: string

  @ApiProperty({ description: '是否以强调色渲染', required: false })
  accent?: boolean
}

/** Hero 右侧·强调块 */
export class SiteHeroAccentBlockVo {
  @ApiProperty({ description: '逐行文案', type: [SiteHeroAccentLineVo] })
  lines: SiteHeroAccentLineVo[]
}

/** Hero 右侧·增长趋势卡片 */
export class SiteHeroGrowthCardVo {
  @ApiProperty({ description: '角标文案' })
  badge: string

  @ApiProperty({ description: '各柱高度百分比（最后一根高亮）', type: [Number] })
  bars: number[]
}

/** Hero 标语区聚合 */
export class SiteHeroVo {
  @ApiProperty({ description: '眼眉文案' })
  eyebrow: string

  @ApiProperty({ description: '主标题行', type: [SiteHeroTitleLineVo] })
  titleLines: SiteHeroTitleLineVo[]

  @ApiProperty({ description: '副标题', nullable: true })
  subtitle: string | null

  @ApiProperty({ description: '统计指标', type: [SiteHeroStatVo] })
  stats: SiteHeroStatVo[]

  @ApiProperty({ description: '行动按钮文案' })
  ctaText: string

  @ApiProperty({ description: '高亮块' })
  highlight: SiteHeroHighlightVo

  @ApiProperty({ description: '项目总数卡片' })
  projectCard: SiteHeroProjectCardVo

  @ApiProperty({ description: '强调块' })
  accentBlock: SiteHeroAccentBlockVo

  @ApiProperty({ description: '增长趋势卡片' })
  growthCard: SiteHeroGrowthCardVo
}

/** 首页精选作品项 */
export class SiteFeaturedWorkVo {
  @ApiProperty({ description: '作品 ID' })
  id: number

  @ApiProperty({ description: '作品标题' })
  title: string

  @ApiProperty({ description: 'URL 唯一标识' })
  slug: string

  @ApiProperty({ description: '所属分类名称' })
  category: string

  @ApiProperty({ description: '作品简介', nullable: true })
  intro: string | null

  @ApiProperty({ description: '封面图 URL', nullable: true })
  cover: string | null

  @ApiProperty({ description: '展示日期（YYYY.MM）' })
  date: string
}

/** 能力项（雷达图 + 列表共用） */
export class SiteCapabilityVo {
  @ApiProperty({ description: '能力名称（雷达图轴）' })
  name: string

  @ApiProperty({ description: '评分值（0-100）' })
  score: number

  @ApiProperty({ description: '列表标题' })
  title: string

  @ApiProperty({ description: '列表描述' })
  desc: string
}

/** 最新思考项 */
export class SiteThoughtVo {
  @ApiProperty({ description: '文章 ID' })
  id: number

  @ApiProperty({ description: '标题' })
  title: string

  @ApiProperty({ description: '摘要' })
  desc: string

  @ApiProperty({ description: '展示日期（YYYY.MM.DD）' })
  date: string
}

/** 关于我（首页精简卡片） */
export class SiteAboutVo {
  @ApiProperty({ description: '姓名' })
  name: string

  @ApiProperty({ description: '角色/职位' })
  role: string

  @ApiProperty({ description: '头像 URL', nullable: true })
  avatar: string | null

  @ApiProperty({ description: '简介' })
  intro: string
}

/** 成长历程节点（首页精简） */
export class SiteTimelineItemVo {
  @ApiProperty({ description: '时期（如 "2021 年至今"）' })
  period: string

  @ApiProperty({ description: '节点标题' })
  title: string

  @ApiProperty({ description: '描述' })
  desc: string
}

/** 首页聚合响应 */
export class SiteHomeVo {
  @ApiProperty({ description: 'Hero 标语区' })
  hero: SiteHeroVo

  @ApiProperty({ description: '精选作品', type: [SiteFeaturedWorkVo] })
  featured: SiteFeaturedWorkVo[]

  @ApiProperty({ description: '能力图谱', type: [SiteCapabilityVo] })
  capabilities: SiteCapabilityVo[]

  @ApiProperty({ description: '最新思考', type: [SiteThoughtVo] })
  thoughts: SiteThoughtVo[]

  @ApiProperty({ description: '关于我' })
  about: SiteAboutVo

  @ApiProperty({ description: '成长历程', type: [SiteTimelineItemVo] })
  timeline: SiteTimelineItemVo[]
}


