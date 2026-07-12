import { BadRequestException, Injectable } from '@nestjs/common'
import { PrismaService } from '@/common/prisma.service'
import { UpdateHomeConfigDto } from '../dto/home-config.dto'
import { HomeConfigVo, FeaturedWorkOptionVo } from '../vo/home-config.vo'

// 首页配置为全局唯一单条记录，固定主键
const CONFIG_ID = 1

/**
 * 首页配置服务
 * 配置（HomeConfig）：单条覆盖写入（upsert）；精选作品 ID 校验须为已发布且精选的作品。
 * 候选池：查询已发布且精选标记为是的作品，供前端下拉选取。
 */
@Injectable()
export class HomeConfigService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 获取首页配置
   * 无记录时返回默认空结构，不报错。
   * @returns 首页配置
   */
  async getConfig(): Promise<HomeConfigVo> {
    const entity = await this.prisma.homeConfig.findUnique({ where: { id: CONFIG_ID } })
    if (!entity) {
      return { slogan: '', subtitle: null, highlightText: null, highlightColor: null, featuredWorkIds: [] }
    }
    return {
      slogan: entity.slogan,
      subtitle: entity.subtitle,
      highlightText: entity.highlightText,
      highlightColor: entity.highlightColor,
      featuredWorkIds: this.parseFeaturedIds(entity.featuredWorkIds)
    }
  }

  /**
   * 覆盖写入首页配置（upsert 保证全局唯一）
   * 校验精选作品均为已发布且精选；通过后写入。
   * @param dto 标语、副标题、精选作品 ID 列表
   * @returns 更新后的配置
   */
  async upsertConfig(dto: UpdateHomeConfigDto): Promise<HomeConfigVo> {
    await this.validateFeaturedIds(dto.featuredWorkIds)
    // 高亮文字须为标语子串，否则视为无高亮；无高亮时颜色一并置空，避免孤立配置
    const highlightText = dto.highlightText?.trim() || ''
    const validHighlight = highlightText && dto.slogan.includes(highlightText) ? highlightText : null
    const data = {
      slogan: dto.slogan,
      subtitle: dto.subtitle ?? null,
      highlightText: validHighlight,
      highlightColor: validHighlight ? (dto.highlightColor?.trim() || null) : null,
      featuredWorkIds: dto.featuredWorkIds
    }
    const entity = await this.prisma.homeConfig.upsert({
      where: { id: CONFIG_ID },
      create: { id: CONFIG_ID, ...data },
      update: data
    })
    return {
      slogan: entity.slogan,
      subtitle: entity.subtitle,
      highlightText: entity.highlightText,
      highlightColor: entity.highlightColor,
      featuredWorkIds: this.parseFeaturedIds(entity.featuredWorkIds)
    }
  }

  /**
   * 获取精选作品候选池（已发布且精选标记为是）
   * 按排序值升序（null 排后）、相同按创建时间升序。
   * @returns 候选作品列表
   */
  async getFeaturedOptions(): Promise<FeaturedWorkOptionVo[]> {
    const list = await this.prisma.work.findMany({
      where: { status: 1, featured: true },
      orderBy: [{ sort: { sort: 'asc', nulls: 'last' } }, { createTime: 'asc' }],
      include: { category: { select: { name: true } } }
    })
    return list.map((w) => ({
      id: w.id,
      title: w.title,
      categoryName: w.category?.name ?? '-'
    }))
  }

  /**
   * 校验精选作品 ID 均为已发布且精选的作品
   * @param ids 精选作品 ID 列表
   */
  private async validateFeaturedIds(ids: number[]): Promise<void> {
    if (!ids.length) return
    const validCount = await this.prisma.work.count({
      where: { id: { in: ids }, status: 1, featured: true }
    })
    if (validCount !== ids.length) {
      throw new BadRequestException('存在无效的精选作品 ID，请刷新候选池后重试')
    }
  }

  /**
   * 解析 Json 字段为数字数组（防御非法存储值）
   * @param value Prisma Json 字段值
   * @returns 数字 ID 数组
   */
  private parseFeaturedIds(value: unknown): number[] {
    if (!Array.isArray(value)) return []
    return value.filter((v): v is number => typeof v === 'number')
  }
}
