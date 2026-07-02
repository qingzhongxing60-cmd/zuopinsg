import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  Min,
} from 'class-validator';

// slug 格式：仅小写字母、数字、连字符，且不能以连字符开头或结尾
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
// slug 校验失败的统一提示（对齐 SRS 3.5.2 边界与异常）
const SLUG_MESSAGE = '唯一标识仅允许英文字母、数字和连字符';

/**
 * 分类列表查询入参
 * name 为可选的名称模糊搜索关键词（query 参数恒为字符串）。
 */
export class CategoryListDto {
  @ApiProperty({ description: '分类名称模糊搜索关键词', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(50, { message: '搜索关键词不能超过 50 字' })
  name?: string;
}

/**
 * 新增分类入参
 * 分类名、唯一标识、排序值均必填；唯一标识需符合 slug 格式。
 */
export class AddCategoryDto {
  @ApiProperty({ description: '分类名称（全局唯一）', maxLength: 50 })
  @IsNotEmpty({ message: '分类名称不能为空' })
  @IsString()
  @MaxLength(50, { message: '分类名称不能超过 50 字' })
  name: string;

  @ApiProperty({ description: 'URL 唯一标识（全局唯一，小写英数连字符）', maxLength: 100 })
  @IsNotEmpty({ message: '唯一标识不能为空' })
  @IsString()
  @MaxLength(100, { message: '唯一标识不能超过 100 字符' })
  @Matches(SLUG_PATTERN, { message: SLUG_MESSAGE })
  slug: string;

  @ApiProperty({ description: '排序值，数值越小越靠前', minimum: 0 })
  @IsInt({ message: '排序值必须为整数' })
  @Min(0, { message: '排序值不能为负数' })
  sort: number;
}

/**
 * 更新分类入参
 * 通过 id 定位，其余字段均可选（仅更新传入字段）；slug 传入时校验格式。
 */
export class UpdateCategoryDto {
  @ApiProperty({ description: '分类 ID' })
  @IsNotEmpty({ message: '分类 ID 不能为空' })
  @IsInt({ message: '分类 ID 必须为整数' })
  id: number;

  @ApiProperty({ description: '分类名称（全局唯一）', required: false, maxLength: 50 })
  @IsOptional()
  @IsString()
  @MaxLength(50, { message: '分类名称不能超过 50 字' })
  name?: string;

  @ApiProperty({ description: 'URL 唯一标识（全局唯一）', required: false, maxLength: 100 })
  @IsOptional()
  @IsString()
  @MaxLength(100, { message: '唯一标识不能超过 100 字符' })
  @Matches(SLUG_PATTERN, { message: SLUG_MESSAGE })
  slug?: string;

  @ApiProperty({ description: '排序值，数值越小越靠前', required: false, minimum: 0 })
  @IsOptional()
  @IsInt({ message: '排序值必须为整数' })
  @Min(0, { message: '排序值不能为负数' })
  sort?: number;
}
