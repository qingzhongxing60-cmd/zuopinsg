import { Injectable } from '@nestjs/common'
import { PrismaService } from '@/common/prisma.service'
import { WorkViewRankDto } from '../dto/statistics.dto'
import { WorkViewRankResultVo } from '../vo/statistics.vo'

/**
 * 数据统计服务
 * 提供作品访问量排行（只读）：仅已发布作品，按访问量降序、相同按发布时间倒序，分页返回。
 * 访问量累加与去重由展示端写入，此处仅读取 Work.views 冗余字段。
 */
@Injectable()
export class StatisticsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 获取作品访问量排行（分页）
   * @param query 分页参数
   * @returns 排行分页结果
   */
  async getWorkViewRank(query: WorkViewRankDto): Promise<WorkViewRankResultVo> {
    // query 参数恒为字符串，转数字并做范围兜底；page 设上限规避深度分页性能问题
    const page = Math.min(Math.max(this.toInt(query.page, 1), 1), 10000)
    const pageSize = Math.min(Math.max(this.toInt(query.pageSize, 10), 1), 100)
    const skip = (page - 1) * pageSize
    const where = { status: 1 }

    const [list, total] = await Promise.all([
      this.prisma.work.findMany({
        where,
        orderBy: [{ views: 'desc' }, { publishTime: 'desc' }],
        skip,
        take: pageSize,
        select: {
          id: true,
          title: true,
          views: true,
          category: { select: { name: true } }
        }
      }),
      this.prisma.work.count({ where })
    ])

    return {
      list: list.map((w) => ({
        id: w.id,
        title: w.title,
        categoryName: w.category?.name ?? '-',
        views: w.views
      })),
      pagination: { page, pageSize, total }
    }
  }

  /**
   * 字符串转整数，非法时返回默认值
   * @param value 原始字符串
   * @param fallback 默认值
   */
  private toInt(value: string | undefined, fallback: number): number {
    if (value === undefined || !/^\d+$/.test(value)) return fallback
    return Number(value)
  }
}
