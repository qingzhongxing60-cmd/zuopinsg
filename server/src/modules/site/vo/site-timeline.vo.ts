import { ApiProperty } from '@nestjs/swagger'

/**
 * 展示站点时间轴节点响应 VO
 * 对齐前端契约（website/src/api/site.ts 中的 TimelineItem）：period/title/desc/tags。
 * 由后端将 TimelineNode 表的 year 转换为 period 字符串。
 */
export class SiteTimelineNodeVo {
  @ApiProperty({ description: '时期（如 "2021 - 至今"）' })
  period: string

  @ApiProperty({ description: '节点标题' })
  title: string

  @ApiProperty({ description: '描述' })
  desc: string

  @ApiProperty({ description: '标签列表', required: false })
  tags?: string[]
}
