import { ApiProperty } from '@nestjs/swagger'

/**
 * 首页配置响应 VO
 * 对齐前端契约（admin/src/api/home-config.ts）：slogan/subtitle/featuredWorkIds。
 * 单条全局记录，不返回 id/tenantId/时间等内部字段。
 */
export class HomeConfigVo {
  @ApiProperty({ description: '展示标语' })
  slogan: string

  @ApiProperty({ description: '副标题', nullable: true })
  subtitle: string | null

  @ApiProperty({ description: '精选作品 ID 列表', type: [Number] })
  featuredWorkIds: number[]
}

/**
 * 精选作品候选项 VO
 * 已发布且精选标记为是的作品，供首页配置下拉选取。
 */
export class FeaturedWorkOptionVo {
  @ApiProperty({ description: '作品 ID' })
  id: number

  @ApiProperty({ description: '作品标题' })
  title: string

  @ApiProperty({ description: '所属分类名称（无分类为 "-"）' })
  categoryName: string
}
