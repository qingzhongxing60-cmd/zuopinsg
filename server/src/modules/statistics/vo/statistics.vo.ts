import { ApiProperty } from '@nestjs/swagger'

/**
 * 作品访问量排行项 VO
 * 对齐前端契约（admin/src/api/statistics.ts）：id/title/categoryName/views。
 */
export class WorkViewRankItemVo {
  @ApiProperty({ description: '作品 ID' })
  id: number

  @ApiProperty({ description: '作品标题' })
  title: string

  @ApiProperty({ description: '所属分类名称（无分类为 "-"）' })
  categoryName: string

  @ApiProperty({ description: '累计访问量（已去重）' })
  views: number
}

/**
 * 访问量排行分页结果 VO
 */
export class WorkViewRankResultVo {
  @ApiProperty({ description: '当前页数据列表', type: [WorkViewRankItemVo] })
  list: WorkViewRankItemVo[]

  @ApiProperty({ description: '分页元信息' })
  pagination: { page: number; pageSize: number; total: number }
}
