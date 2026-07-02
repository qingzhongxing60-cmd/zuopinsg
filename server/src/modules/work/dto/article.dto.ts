import { ApiProperty } from '@nestjs/swagger'
import { IsInt, IsNotEmpty, IsOptional, IsString, Matches, Max, MaxLength, Min } from 'class-validator'

// 富文本正文长度上限，防止超大内容写入
const CONTENT_MAX = 100000

/**
 * 新增拆解文章入参
 * 所属作品、标题必填；内容、状态、排序选填。
 */
export class AddArticleDto {
  @ApiProperty({ description: '所属作品 ID' })
  @IsNotEmpty({ message: '所属作品不能为空' })
  @IsInt({ message: '作品 ID 必须为整数' })
  workId: number

  @ApiProperty({ description: '文章标题', maxLength: 100 })
  @IsNotEmpty({ message: '文章标题不能为空' })
  @IsString()
  @MaxLength(100, { message: '文章标题不能超过 100 字' })
  title: string

  @ApiProperty({ description: '富文本正文', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(CONTENT_MAX, { message: '正文内容过长' })
  content?: string

  @ApiProperty({ description: '发布状态：0 草稿 1 已发布', required: false, default: 0 })
  @IsOptional()
  @IsInt({ message: '发布状态必须为整数' })
  @Min(0, { message: '发布状态非法' })
  @Max(1, { message: '发布状态非法' })
  status?: number

  @ApiProperty({ description: '排序值，数值越小越靠前', required: false, minimum: 0 })
  @IsOptional()
  @IsInt({ message: '排序值必须为整数' })
  @Min(0, { message: '排序值不能为负数' })
  sort?: number
}

/**
 * 更新拆解文章入参
 * 通过 id 定位，其余字段可选。
 */
export class UpdateArticleDto {
  @ApiProperty({ description: '文章 ID' })
  @IsNotEmpty({ message: '文章 ID 不能为空' })
  @IsInt({ message: '文章 ID 必须为整数' })
  id: number

  @ApiProperty({ description: '文章标题', required: false, maxLength: 100 })
  @IsOptional()
  @IsString()
  @MaxLength(100, { message: '文章标题不能超过 100 字' })
  title?: string

  @ApiProperty({ description: '富文本正文', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(CONTENT_MAX, { message: '正文内容过长' })
  content?: string

  @ApiProperty({ description: '发布状态：0 草稿 1 已发布', required: false })
  @IsOptional()
  @IsInt({ message: '发布状态必须为整数' })
  @Min(0, { message: '发布状态非法' })
  @Max(1, { message: '发布状态非法' })
  status?: number

  @ApiProperty({ description: '排序值，数值越小越靠前', required: false, minimum: 0 })
  @IsOptional()
  @IsInt({ message: '排序值必须为整数' })
  @Min(0, { message: '排序值不能为负数' })
  sort?: number
}

/**
 * 文章列表查询入参（query）
 */
export class ArticleListDto {
  @ApiProperty({ description: '所属作品 ID' })
  @IsNotEmpty({ message: '作品 ID 不能为空' })
  @Matches(/^\d+$/, { message: '作品 ID 必须为数字' })
  workId: string
}

/**
 * 仅含 id 的操作入参（文章发布/下架）
 */
export class ArticleIdDto {
  @ApiProperty({ description: '文章 ID' })
  @IsNotEmpty({ message: '文章 ID 不能为空' })
  @IsInt({ message: '文章 ID 必须为整数' })
  id: number
}
