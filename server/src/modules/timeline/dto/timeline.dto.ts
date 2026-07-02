import { ApiProperty } from '@nestjs/swagger'
import { IsInt, IsNotEmpty, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator'

/**
 * 新增时间轴节点入参
 * 年份、标题、排序值必填；描述选填。
 */
export class AddTimelineDto {
  @ApiProperty({ description: '年份（4 位公历年份）', minimum: 1000, maximum: 9999 })
  @IsInt({ message: '年份必须为整数' })
  @Min(1000, { message: '请输入有效的年份（如 2024）' })
  @Max(9999, { message: '请输入有效的年份（如 2024）' })
  year: number

  @ApiProperty({ description: '节点标题', maxLength: 100 })
  @IsNotEmpty({ message: '标题不能为空' })
  @IsString()
  @MaxLength(100, { message: '标题不能超过 100 字' })
  title: string

  @ApiProperty({ description: '描述', required: false, maxLength: 500 })
  @IsOptional()
  @IsString()
  @MaxLength(500, { message: '描述不能超过 500 字' })
  description?: string

  @ApiProperty({ description: '排序值，数值越小越靠前', minimum: 0 })
  @IsInt({ message: '排序值必须为整数' })
  @Min(0, { message: '排序值不能为负数' })
  sort: number
}

/**
 * 更新时间轴节点入参
 * 通过 id 定位，其余字段均可选（仅更新传入字段）。
 */
export class UpdateTimelineDto {
  @ApiProperty({ description: '节点 ID' })
  @IsNotEmpty({ message: '节点 ID 不能为空' })
  @IsInt({ message: '节点 ID 必须为整数' })
  id: number

  @ApiProperty({ description: '年份（4 位公历年份）', required: false, minimum: 1000, maximum: 9999 })
  @IsOptional()
  @IsInt({ message: '年份必须为整数' })
  @Min(1000, { message: '请输入有效的年份（如 2024）' })
  @Max(9999, { message: '请输入有效的年份（如 2024）' })
  year?: number

  @ApiProperty({ description: '节点标题', required: false, maxLength: 100 })
  @IsOptional()
  @IsString()
  @MaxLength(100, { message: '标题不能超过 100 字' })
  title?: string

  @ApiProperty({ description: '描述', required: false, maxLength: 500 })
  @IsOptional()
  @IsString()
  @MaxLength(500, { message: '描述不能超过 500 字' })
  description?: string

  @ApiProperty({ description: '排序值，数值越小越靠前', required: false, minimum: 0 })
  @IsOptional()
  @IsInt({ message: '排序值必须为整数' })
  @Min(0, { message: '排序值不能为负数' })
  sort?: number
}
