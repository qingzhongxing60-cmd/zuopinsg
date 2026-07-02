import { ApiProperty } from '@nestjs/swagger'

/**
 * 展示站点作品相关响应 VO
 * 对齐前端契约（website/src/api/site.ts 中的 WorkItem / WorkDetail）。
 * 仅暴露展示所需字段，草稿隔离与排序在 service 层完成。
 */

/** 作品列表项（展示端只读） */
export class SiteWorkItemVo {
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

/** 作品正文分节 */
export class SiteWorkSectionVo {
  @ApiProperty({ description: '分节标题' })
  heading: string

  @ApiProperty({ description: '分节段落文本', type: [String] })
  paragraphs: string[]
}

/** 上一篇 / 下一篇导航项 */
export class SiteWorkNavVo {
  @ApiProperty({ description: '作品标题' })
  title: string

  @ApiProperty({ description: 'URL 唯一标识' })
  slug: string
}

/** 作品详情（含正文分节与上下篇导航） */
export class SiteWorkDetailVo {
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

  @ApiProperty({ description: '担任角色（暂无数据源，固定 null）', nullable: true })
  role: string | null

  @ApiProperty({ description: '项目周期（暂无数据源，固定 null）', nullable: true })
  duration: string | null

  @ApiProperty({ description: '技术/能力标签（暂无数据源，固定空数组）', type: [String] })
  tags: string[]

  @ApiProperty({ description: '项目概述（暂无独立数据源，固定 null）', nullable: true })
  overview: string | null

  @ApiProperty({ description: '正文分节（由富文本详情解析）', type: [SiteWorkSectionVo] })
  sections: SiteWorkSectionVo[]

  @ApiProperty({ description: '上一篇导航', type: SiteWorkNavVo, nullable: true })
  prev: SiteWorkNavVo | null

  @ApiProperty({ description: '下一篇导航', type: SiteWorkNavVo, nullable: true })
  next: SiteWorkNavVo | null
}
