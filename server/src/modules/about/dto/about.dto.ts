import { ApiProperty } from '@nestjs/swagger'
import { IsInt, IsNotEmpty, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator'

/**
 * 更新个人介绍入参（覆盖写入）
 * intro 必填；avatar、resume 选填。
 */
export class UpdateAboutProfileDto {
  @ApiProperty({ description: '个人简介', maxLength: 500 })
  @IsNotEmpty({ message: '个人简介不能为空' })
  @IsString()
  @MaxLength(500, { message: '个人简介不能超过 500 字' })
  intro: string

  @ApiProperty({ description: '头像图片 URL', required: false, maxLength: 500 })
  @IsOptional()
  @IsString()
  @MaxLength(500, { message: '头像 URL 不能超过 500 字符' })
  avatar?: string | null

  @ApiProperty({ description: '简历富文本 HTML', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(50000, { message: '简历内容过长' })
  resume?: string | null
}

/**
 * 新增技能入参
 * 技能名称、评分值、排序值均必填。
 */
export class AddSkillDto {
  @ApiProperty({ description: '技能名称', maxLength: 100 })
  @IsNotEmpty({ message: '技能名称不能为空' })
  @IsString()
  @MaxLength(100, { message: '技能名称不能超过 100 字' })
  name: string

  @ApiProperty({ description: '评分值（0-100）', minimum: 0, maximum: 100 })
  @IsInt({ message: '评分值必须为整数' })
  @Min(0, { message: '评分值须在 0 到 100 之间' })
  @Max(100, { message: '评分值须在 0 到 100 之间' })
  score: number

  @ApiProperty({ description: '排序值，数值越小越靠前', minimum: 0 })
  @IsInt({ message: '排序值必须为整数' })
  @Min(0, { message: '排序值不能为负数' })
  sort: number
}

/**
 * 更新技能入参
 * 通过 id 定位，其余字段均可选（仅更新传入字段）。
 */
export class UpdateSkillDto {
  @ApiProperty({ description: '技能 ID' })
  @IsNotEmpty({ message: '技能 ID 不能为空' })
  @IsInt({ message: '技能 ID 必须为整数' })
  id: number

  @ApiProperty({ description: '技能名称', required: false, maxLength: 100 })
  @IsOptional()
  @IsString()
  @MaxLength(100, { message: '技能名称不能超过 100 字' })
  name?: string

  @ApiProperty({ description: '评分值（0-100）', required: false, minimum: 0, maximum: 100 })
  @IsOptional()
  @IsInt({ message: '评分值必须为整数' })
  @Min(0, { message: '评分值须在 0 到 100 之间' })
  @Max(100, { message: '评分值须在 0 到 100 之间' })
  score?: number

  @ApiProperty({ description: '排序值，数值越小越靠前', required: false, minimum: 0 })
  @IsOptional()
  @IsInt({ message: '排序值必须为整数' })
  @Min(0, { message: '排序值不能为负数' })
  sort?: number
}
