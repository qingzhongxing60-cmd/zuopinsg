import { ApiProperty } from '@nestjs/swagger'
import { IsOptional, IsString } from 'class-validator'

/**
 * 作品访问量排行查询入参
 * page/pageSize 选填（query 参数恒为字符串，Service 内转换并兜底默认值）。
 */
export class WorkViewRankDto {
  @ApiProperty({ description: '页码，从 1 开始', required: false })
  @IsOptional()
  @IsString()
  page?: string

  @ApiProperty({ description: '每页条数（1-100，默认 10）', required: false })
  @IsOptional()
  @IsString()
  pageSize?: string
}
