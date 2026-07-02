import { ApiProperty } from '@nestjs/swagger'

/**
 * 作品响应 VO
 * 对齐前端契约（admin/src/api/work.ts）。categoryName 为关联查询拼接字段（非实体列）。
 * tenantId、updateTime 为内部字段，不对外返回。
 */
export class WorkVo {
  @ApiProperty({ description: '作品 ID' })
  id: number

  @ApiProperty({ description: '作品标题' })
  title: string

  @ApiProperty({ description: 'URL 唯一标识' })
  slug: string

  @ApiProperty({ description: '作品简介', nullable: true })
  intro: string | null

  @ApiProperty({ description: '封面图 URL', nullable: true })
  cover: string | null

  @ApiProperty({ description: '富文本详情', nullable: true })
  detail: string | null

  @ApiProperty({ description: '所属分类 ID' })
  categoryId: number

  @ApiProperty({ description: '所属分类名称（关联拼接）' })
  categoryName: string

  @ApiProperty({ description: '是否精选' })
  featured: boolean

  @ApiProperty({ description: '发布状态：0 草稿 1 已发布' })
  status: number

  @ApiProperty({ description: '累计访问量（只读）' })
  views: number

  @ApiProperty({ description: '排序值，数值越小越靠前', nullable: true })
  sort: number | null

  @ApiProperty({ description: '首次发布时间', nullable: true })
  publishTime: string | null

  @ApiProperty({ description: '创建时间' })
  createTime: string
}

/**
 * 原型版本响应 VO
 */
export class PrototypeVersionVo {
  @ApiProperty({ description: '版本 ID' })
  id: number

  @ApiProperty({ description: '所属作品 ID' })
  workId: number

  @ApiProperty({ description: '版本名' })
  name: string

  @ApiProperty({ description: '版本标题', nullable: true })
  title: string | null

  @ApiProperty({ description: '排序值', nullable: true })
  sort: number | null

  @ApiProperty({ description: '创建时间' })
  createTime: string
}

/**
 * 原型图片响应 VO
 */
export class PrototypeImageVo {
  @ApiProperty({ description: '图片 ID' })
  id: number

  @ApiProperty({ description: '所属版本 ID' })
  versionId: number

  @ApiProperty({ description: '图片 URL' })
  url: string

  @ApiProperty({ description: '图片说明', nullable: true })
  caption: string | null

  @ApiProperty({ description: '排序值', nullable: true })
  sort: number | null

  @ApiProperty({ description: '创建时间' })
  createTime: string
}

/**
 * 拆解文章响应 VO
 */
export class BreakdownArticleVo {
  @ApiProperty({ description: '文章 ID' })
  id: number

  @ApiProperty({ description: '所属作品 ID' })
  workId: number

  @ApiProperty({ description: '文章标题' })
  title: string

  @ApiProperty({ description: '富文本正文', nullable: true })
  content: string | null

  @ApiProperty({ description: '发布状态：0 草稿 1 已发布' })
  status: number

  @ApiProperty({ description: '排序值', nullable: true })
  sort: number | null

  @ApiProperty({ description: '创建时间' })
  createTime: string
}
