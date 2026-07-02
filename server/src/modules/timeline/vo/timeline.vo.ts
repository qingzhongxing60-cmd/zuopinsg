import { ApiProperty } from '@nestjs/swagger'

/**
 * 时间轴节点响应 VO
 * 对齐前端契约（admin/src/api/timeline.ts）：id/year/title/description/sort/createTime。
 * tenantId、updateTime 为内部字段，不对外返回。
 */
export class TimelineNodeVo {
  @ApiProperty({ description: '节点 ID' })
  id: number

  @ApiProperty({ description: '年份（4 位公历年份）' })
  year: number

  @ApiProperty({ description: '节点标题' })
  title: string

  @ApiProperty({ description: '描述', nullable: true })
  description: string | null

  @ApiProperty({ description: '排序值，数值越小越靠前' })
  sort: number

  @ApiProperty({ description: '创建时间' })
  createTime: string
}
