import { ApiProperty } from '@nestjs/swagger';

/**
 * 分类响应 VO
 * 对齐前端契约（src/api/category.ts）：id/name/slug/sort/workCount/createTime。
 * tenantId 为单管理员模式内部字段，不对外返回。
 */
export class CategoryVo {
  @ApiProperty({ description: '分类 ID' })
  id: number;

  @ApiProperty({ description: '分类名称（全局唯一）' })
  name: string;

  @ApiProperty({ description: 'URL 唯一标识（全局唯一，仅小写英数连字符）' })
  slug: string;

  @ApiProperty({ description: '排序值，数值越小越靠前' })
  sort: number;

  @ApiProperty({ description: '关联作品数（含草稿与已发布的全部作品）' })
  workCount: number;

  @ApiProperty({ description: '创建时间' })
  createTime: string;
}
