import { ApiProperty } from '@nestjs/swagger'

/**
 * 个人介绍响应 VO
 * 对齐前端契约（admin/src/api/about.ts）：intro/avatar/resume。
 * 单条全局记录，不返回 id/tenantId/时间等内部字段。
 */
export class AboutProfileVo {
  @ApiProperty({ description: '个人简介' })
  intro: string

  @ApiProperty({ description: '头像图片 URL', nullable: true })
  avatar: string | null

  @ApiProperty({ description: '简历富文本 HTML', nullable: true })
  resume: string | null
}

/**
 * 技能响应 VO
 * 对齐前端契约：id/name/score/sort/createTime。
 * tenantId、updateTime 不对外返回。
 */
export class SkillVo {
  @ApiProperty({ description: '技能 ID' })
  id: number

  @ApiProperty({ description: '技能名称' })
  name: string

  @ApiProperty({ description: '评分值（0-100）' })
  score: number

  @ApiProperty({ description: '排序值，数值越小越靠前' })
  sort: number

  @ApiProperty({ description: '创建时间' })
  createTime: string
}
