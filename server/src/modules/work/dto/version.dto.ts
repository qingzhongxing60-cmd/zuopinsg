import { ApiProperty } from '@nestjs/swagger'
import { IsInt, IsNotEmpty, IsOptional, IsString, Matches, MaxLength, Min } from 'class-validator'

/**
 * 新增原型版本入参
 * 所属作品、版本名必填；版本名在同一作品下唯一。
 */
export class AddVersionDto {
  @ApiProperty({ description: '所属作品 ID' })
  @IsNotEmpty({ message: '所属作品不能为空' })
  @IsInt({ message: '作品 ID 必须为整数' })
  workId: number

  @ApiProperty({ description: '版本名（同作品下唯一）', maxLength: 20 })
  @IsNotEmpty({ message: '版本名不能为空' })
  @IsString()
  @MaxLength(20, { message: '版本名不能超过 20 字' })
  name: string

  @ApiProperty({ description: '版本标题', required: false, maxLength: 100 })
  @IsOptional()
  @IsString()
  @MaxLength(100, { message: '版本标题不能超过 100 字' })
  title?: string

  @ApiProperty({ description: '排序值，数值越小越靠前', required: false, minimum: 0 })
  @IsOptional()
  @IsInt({ message: '排序值必须为整数' })
  @Min(0, { message: '排序值不能为负数' })
  sort?: number
}

/**
 * 更新原型版本入参
 * 通过 id 定位，其余字段可选。
 */
export class UpdateVersionDto {
  @ApiProperty({ description: '版本 ID' })
  @IsNotEmpty({ message: '版本 ID 不能为空' })
  @IsInt({ message: '版本 ID 必须为整数' })
  id: number

  @ApiProperty({ description: '版本名（同作品下唯一）', required: false, maxLength: 20 })
  @IsOptional()
  @IsString()
  @MaxLength(20, { message: '版本名不能超过 20 字' })
  name?: string

  @ApiProperty({ description: '版本标题', required: false, maxLength: 100 })
  @IsOptional()
  @IsString()
  @MaxLength(100, { message: '版本标题不能超过 100 字' })
  title?: string

  @ApiProperty({ description: '排序值，数值越小越靠前', required: false, minimum: 0 })
  @IsOptional()
  @IsInt({ message: '排序值必须为整数' })
  @Min(0, { message: '排序值不能为负数' })
  sort?: number
}

/**
 * 版本列表查询入参（query）
 */
export class VersionListDto {
  @ApiProperty({ description: '所属作品 ID' })
  @IsNotEmpty({ message: '作品 ID 不能为空' })
  @Matches(/^\d+$/, { message: '作品 ID 必须为数字' })
  workId: string
}
