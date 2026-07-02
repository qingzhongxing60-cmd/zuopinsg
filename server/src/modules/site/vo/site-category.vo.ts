import { ApiProperty } from '@nestjs/swagger'

/**
 * 展示站点分类 VO（精简版，仅含前端筛选所需字段）
 */
export class SiteCategoryVo {
  @ApiProperty({ description: '分类 ID' })
  id: number

  @ApiProperty({ description: '分类名称' })
  name: string

  @ApiProperty({ description: 'URL 唯一标识' })
  slug: string

  @ApiProperty({ description: '排序值' })
  sort: number
}
