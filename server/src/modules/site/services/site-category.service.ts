import { Injectable } from '@nestjs/common'
import { PrismaService } from '@/common/prisma.service'
import { SiteCategoryVo } from '../vo/site-category.vo'

/**
 * 展示站点分类服务
 * 提供公开的分类列表 API（无需登录鉴权），按排序值升序返回所有分类。
 */
@Injectable()
export class SiteCategoryService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 获取全部分类列表
   * 按排序值升序、相同时按创建时间升序排列。
   * @returns 分类列表
   */
  async getCategories(): Promise<SiteCategoryVo[]> {
    const categories = await this.prisma.category.findMany({
      orderBy: [{ sort: 'asc' }, { createTime: 'asc' }],
      select: { id: true, name: true, slug: true, sort: true },
    })
    return categories
  }
}
