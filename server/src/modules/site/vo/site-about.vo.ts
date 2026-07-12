import { ApiProperty } from '@nestjs/swagger'

/**
 * 展示站点「关于我」相关响应 VO
 * 对齐前端契约（website/src/api/site.ts 中的 AboutData）。
 * 由后端聚合 AboutMe / Skill / Work 数据拼装；无数据源的字段返回安全默认值，不编造。
 */

/** 关键数据指标 */
export class SiteAboutStatVo {
  @ApiProperty({ description: '指标数值（展示字符串）' })
  value: string

  @ApiProperty({ description: '指标标签' })
  label: string
}

/** 专长领域 */
export class SiteAboutExpertiseVo {
  @ApiProperty({ description: '领域名称' })
  name: string

  @ApiProperty({ description: '领域描述' })
  desc: string
}

/** 联系方式（email 用 mailto，link 用外链） */
export class SiteAboutContactVo {
  @ApiProperty({ description: '联系方式类型', enum: ['email', 'link'] })
  type: 'email' | 'link'

  @ApiProperty({ description: '标签' })
  label: string

  @ApiProperty({ description: '值（邮箱地址或外链 URL）' })
  value: string

  @ApiProperty({ description: '展示文案（缺省用 value）', required: false })
  display?: string
}

/** 关于我聚合数据 */
export class SiteAboutVo {
  @ApiProperty({ description: '姓名（暂无数据源，返回空字符串）' })
  name: string

  @ApiProperty({ description: '角色/职位（暂无数据源，返回空字符串）' })
  role: string

  @ApiProperty({ description: '头像 URL', nullable: true })
  avatar: string | null

  @ApiProperty({ description: '个人简介' })
  intro: string

  @ApiProperty({ description: '关键数据指标', type: [SiteAboutStatVo] })
  stats: SiteAboutStatVo[]

  @ApiProperty({ description: '自我介绍段落（由简历富文本去标签解析，纯文本兜底）', type: [String] })
  paragraphs: string[]

  @ApiProperty({ description: '简历富文本（已净化，供前端 v-html 渲染，保留图片与格式）' })
  resumeHtml: string

  @ApiProperty({ description: '专长领域（由技能列表映射）', type: [SiteAboutExpertiseVo] })
  expertise: SiteAboutExpertiseVo[]

  @ApiProperty({ description: '联系方式（暂无数据源，返回空数组）', type: [SiteAboutContactVo] })
  contacts: SiteAboutContactVo[]
}
