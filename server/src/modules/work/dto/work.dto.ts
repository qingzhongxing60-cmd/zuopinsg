import { ApiProperty } from '@nestjs/swagger'
import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min
} from 'class-validator'

// slug 格式：仅小写字母、数字、连字符，且不能以连字符开头或结尾
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const SLUG_MESSAGE = '唯一标识仅允许英文字母、数字和连字符'
// 富文本详情长度上限，防止超大内容写入
const DETAIL_MAX = 100000

/**
 * 作品列表查询入参
 * 支持按标题模糊、分类、发布状态过滤（query 参数恒为字符串，整数字段用 Type 转换）。
 */
export class WorkListDto {
  @ApiProperty({ description: '作品标题模糊搜索', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(100, { message: '搜索关键词不能超过 100 字' })
  title?: string

  @ApiProperty({ description: '所属分类 ID', required: false })
  @IsOptional()
  @IsString()
  categoryId?: string

  @ApiProperty({ description: '发布状态：0 草稿 1 已发布', required: false })
  @IsOptional()
  @IsString()
  status?: string
}

/**
 * 新增作品入参
 * 标题、唯一标识、分类必填；其余选填。publishTime/views 由后端控制，不接受传入。
 */
export class AddWorkDto {
  @ApiProperty({ description: '作品标题', maxLength: 100 })
  @IsNotEmpty({ message: '作品标题不能为空' })
  @IsString()
  @MaxLength(100, { message: '作品标题不能超过 100 字' })
  title: string

  @ApiProperty({ description: 'URL 唯一标识（全局唯一）', maxLength: 100 })
  @IsNotEmpty({ message: '唯一标识不能为空' })
  @IsString()
  @MaxLength(100, { message: '唯一标识不能超过 100 字符' })
  @Matches(SLUG_PATTERN, { message: SLUG_MESSAGE })
  slug: string

  @ApiProperty({ description: '所属分类 ID' })
  @IsNotEmpty({ message: '所属分类不能为空' })
  @IsInt({ message: '分类 ID 必须为整数' })
  categoryId: number

  @ApiProperty({ description: '作品简介', required: false, maxLength: 500 })
  @IsOptional()
  @IsString()
  @MaxLength(500, { message: '简介不能超过 500 字' })
  intro?: string

  @ApiProperty({ description: '封面图 URL', required: false, maxLength: 500 })
  @IsOptional()
  @IsString()
  @MaxLength(500, { message: '封面 URL 不能超过 500 字符' })
  cover?: string

  @ApiProperty({ description: '富文本详情', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(DETAIL_MAX, { message: '详情内容过长' })
  detail?: string

  @ApiProperty({ description: '是否精选', required: false, default: false })
  @IsOptional()
  @IsBoolean({ message: '精选标记必须为布尔值' })
  featured?: boolean

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
 * 更新作品入参
 * 通过 id 定位，其余字段均可选；views/publishTime 不接受传入。
 */
export class UpdateWorkDto {
  @ApiProperty({ description: '作品 ID' })
  @IsNotEmpty({ message: '作品 ID 不能为空' })
  @IsInt({ message: '作品 ID 必须为整数' })
  id: number

  @ApiProperty({ description: '作品标题', required: false, maxLength: 100 })
  @IsOptional()
  @IsString()
  @MaxLength(100, { message: '作品标题不能超过 100 字' })
  title?: string

  @ApiProperty({ description: 'URL 唯一标识', required: false, maxLength: 100 })
  @IsOptional()
  @IsString()
  @MaxLength(100, { message: '唯一标识不能超过 100 字符' })
  @Matches(SLUG_PATTERN, { message: SLUG_MESSAGE })
  slug?: string

  @ApiProperty({ description: '所属分类 ID', required: false })
  @IsOptional()
  @IsInt({ message: '分类 ID 必须为整数' })
  categoryId?: number

  @ApiProperty({ description: '作品简介', required: false, maxLength: 500 })
  @IsOptional()
  @IsString()
  @MaxLength(500, { message: '简介不能超过 500 字' })
  intro?: string

  @ApiProperty({ description: '封面图 URL', required: false, maxLength: 500 })
  @IsOptional()
  @IsString()
  @MaxLength(500, { message: '封面 URL 不能超过 500 字符' })
  cover?: string

  @ApiProperty({ description: '富文本详情', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(DETAIL_MAX, { message: '详情内容过长' })
  detail?: string

  @ApiProperty({ description: '是否精选', required: false })
  @IsOptional()
  @IsBoolean({ message: '精选标记必须为布尔值' })
  featured?: boolean

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
 * 仅含 id 的操作入参（发布/下架、切换精选）
 */
export class WorkIdDto {
  @ApiProperty({ description: '作品 ID' })
  @IsNotEmpty({ message: '作品 ID 不能为空' })
  @IsInt({ message: '作品 ID 必须为整数' })
  id: number
}
