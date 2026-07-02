import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import {
  ArrayNotEmpty,
  IsArray,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  Min,
  ValidateNested
} from 'class-validator'

/**
 * 批量新增图片的单项
 */
export class ImageItemDto {
  @ApiProperty({ description: '图片 URL', maxLength: 500 })
  @IsNotEmpty({ message: '图片 URL 不能为空' })
  @IsString()
  @MaxLength(500, { message: '图片 URL 不能超过 500 字符' })
  url: string

  @ApiProperty({ description: '图片说明', required: false, maxLength: 200 })
  @IsOptional()
  @IsString()
  @MaxLength(200, { message: '图片说明不能超过 200 字' })
  caption?: string

  @ApiProperty({ description: '排序值，数值越小越靠前', required: false, minimum: 0 })
  @IsOptional()
  @IsInt({ message: '排序值必须为整数' })
  @Min(0, { message: '排序值不能为负数' })
  sort?: number
}

/**
 * 批量新增原型图片入参
 */
export class AddImagesDto {
  @ApiProperty({ description: '所属版本 ID' })
  @IsNotEmpty({ message: '所属版本不能为空' })
  @IsInt({ message: '版本 ID 必须为整数' })
  versionId: number

  @ApiProperty({ description: '图片列表', type: [ImageItemDto] })
  @IsArray({ message: '图片列表格式不正确' })
  @ArrayNotEmpty({ message: '图片列表不能为空' })
  @ValidateNested({ each: true })
  @Type(() => ImageItemDto)
  images: ImageItemDto[]
}

/**
 * 更新原型图片入参（仅说明与排序，不可改 url）
 */
export class UpdateImageDto {
  @ApiProperty({ description: '图片 ID' })
  @IsNotEmpty({ message: '图片 ID 不能为空' })
  @IsInt({ message: '图片 ID 必须为整数' })
  id: number

  @ApiProperty({ description: '图片说明', required: false, maxLength: 200 })
  @IsOptional()
  @IsString()
  @MaxLength(200, { message: '图片说明不能超过 200 字' })
  caption?: string

  @ApiProperty({ description: '排序值，数值越小越靠前', required: false, minimum: 0 })
  @IsOptional()
  @IsInt({ message: '排序值必须为整数' })
  @Min(0, { message: '排序值不能为负数' })
  sort?: number
}

/**
 * 图片列表查询入参（query）
 */
export class ImageListDto {
  @ApiProperty({ description: '所属版本 ID' })
  @IsNotEmpty({ message: '版本 ID 不能为空' })
  @Matches(/^\d+$/, { message: '版本 ID 必须为数字' })
  versionId: string
}
