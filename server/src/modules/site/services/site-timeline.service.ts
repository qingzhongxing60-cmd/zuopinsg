import { Injectable } from '@nestjs/common'
import { PrismaService } from '@/common/prisma.service'
import { SiteTimelineNodeVo } from '../vo/site-timeline.vo'

/**
 * 展示站点时间轴服务
 * 从数据库获取时间轴节点，转换为前端期望的格式（year → period）。
 */
@Injectable()
export class SiteTimelineService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 获取展示站点时间轴节点列表
   * 从数据库读取，按年份升序排列，转换为前端期望的 period 格式。
   * @returns 时间轴节点列表
   */
  async getTimeline(): Promise<SiteTimelineNodeVo[]> {
    const nodes = await this.prisma.timelineNode.findMany({
      orderBy: { year: 'asc' }
    })

    return nodes.map((node) => ({
      period: this.yearToPeriod(node.year),
      title: node.title,
      desc: node.description ?? '',
      tags: [], // 后端暂无标签字段，返回空数组
    }))
  }

  /**
   * 将年份转换为时期字符串
   * 根据年份生成合适的 period 描述。
   * @param year 年份（4位数字）
   * @returns 时期字符串（如 "2021 年至今" 或 "2018 年"）
   */
  private yearToPeriod(year: number): string {
    const currentYear = new Date().getFullYear()

    // 如果是当前年份或未来，显示为"至今"
    if (year >= currentYear) {
      return `${year} 年至今`
    }

    // 其他情况显示为"YYYY 年"
    return `${year} 年`
  }
}
