import { ApiProperty } from '@nestjs/swagger'

/**
 * 展示站点「最新思考」相关响应 VO
 * 对齐前端契约（website/src/api/site.ts 中的 ThoughtItem / ThoughtDetail）。
 * 数据源为 breakdown_article（作品拆解文章），仅暴露展示所需字段，
 * 草稿隔离（status=1）与排序在 service 层完成。
 */

/** 思考列表项（展示端只读） */
export class SiteThoughtItemVo {
  @ApiProperty({ description: '文章 ID' })
  id: number

  @ApiProperty({ description: '文章标题' })
  title: string

  @ApiProperty({ description: '纯文本摘要（由富文本正文去标签截取）' })
  desc: string

  @ApiProperty({ description: '展示日期（YYYY.MM.DD）' })
  date: string

  @ApiProperty({ description: '所属作品标题' })
  workTitle: string

  @ApiProperty({ description: '所属作品 slug（用于跳转作品详情）', nullable: true })
  workSlug: string | null
}

/** 思考正文分节 */
export class SiteThoughtSectionVo {
  @ApiProperty({ description: '分节标题' })
  heading: string

  @ApiProperty({ description: '分节段落文本', type: [String] })
  paragraphs: string[]
}

/** 上一篇 / 下一篇导航项 */
export class SiteThoughtNavVo {
  @ApiProperty({ description: '文章 ID' })
  id: number

  @ApiProperty({ description: '文章标题' })
  title: string
}

/** 思考详情（含正文分节与上下篇导航） */
export class SiteThoughtDetailVo {
  @ApiProperty({ description: '文章 ID' })
  id: number

  @ApiProperty({ description: '文章标题' })
  title: string

  @ApiProperty({ description: '展示日期（YYYY.MM.DD）' })
  date: string

  @ApiProperty({ description: '所属作品标题' })
  workTitle: string

  @ApiProperty({ description: '所属作品 slug（用于跳转作品详情）', nullable: true })
  workSlug: string | null

  @ApiProperty({ description: '正文分节（由富文本正文解析）', type: [SiteThoughtSectionVo] })
  sections: SiteThoughtSectionVo[]

  @ApiProperty({ description: '上一篇导航', type: SiteThoughtNavVo, nullable: true })
  prev: SiteThoughtNavVo | null

  @ApiProperty({ description: '下一篇导航', type: SiteThoughtNavVo, nullable: true })
  next: SiteThoughtNavVo | null
}
