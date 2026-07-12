import { ApiProperty } from '@nestjs/swagger'
import {
  ArrayMaxSize,
  ArrayUnique,
  IsArray,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength
} from 'class-validator'

/**
 * 更新首页配置入参（覆盖写入）
 * slogan 必填 1-50 字；subtitle 选填 0-100 字；featuredWorkIds 为整数数组（去重）。
 */
export class UpdateHomeConfigDto {
  @ApiProperty({ description: '展示标语', maxLength: 50 })
  @IsNotEmpty({ message: '展示标语不能为空' })
  @IsString()
  @MaxLength(50, { message: '展示标语不能超过 50 字' })
  slogan: string

  @ApiProperty({ description: '副标题', required: false, maxLength: 100 })
  @IsOptional()
  @IsString()
  @MaxLength(100, { message: '副标题不能超过 100 字' })
  subtitle?: string | null

  @ApiProperty({ description: '高亮文字片段（须为标语子串）', required: false, maxLength: 50 })
  @IsOptional()
  @IsString()
  @MaxLength(50, { message: '高亮文字不能超过 50 字' })
  highlightText?: string | null

  @ApiProperty({ description: '高亮文字颜色（十六进制色值，如 #C0451F）', required: false, maxLength: 20 })
  @IsOptional()
  @IsString()
  @MaxLength(20, { message: '高亮颜色格式不正确' })
  // 仅允许 3/6 位十六进制色值，防止非法样式值落库
  @Matches(/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/, { message: '高亮颜色须为十六进制色值，如 #C0451F' })
  highlightColor?: string | null

  @ApiProperty({ description: '精选作品 ID 列表', type: [Number] })
  @IsArray({ message: '精选作品列表格式不正确' })
  @IsInt({ each: true, message: '精选作品 ID 必须为整数' })
  @ArrayUnique({ message: '精选作品 ID 不能重复' })
  @ArrayMaxSize(20, { message: '精选作品不能超过 20 个' })
  featuredWorkIds: number[]
}
