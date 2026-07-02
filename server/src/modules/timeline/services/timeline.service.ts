import { BadRequestException, Injectable } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { PrismaService } from '@/common/prisma.service'
import { BaseService } from '@/common/crud'
import { AddTimelineDto, UpdateTimelineDto } from '../dto/timeline.dto'
import { TimelineNodeVo } from '../vo/timeline.vo'

/**
 * 时间轴管理服务
 * 在基础 CRUD 能力之上提供：按排序值升序（相同按年份升序）的列表、增改删。
 * 无草稿状态、无唯一约束，保存即对外可见。
 */
@Injectable()
export class TimelineService extends BaseService {
  constructor(protected prisma: PrismaService) {
    super(prisma, 'timelineNode')
  }

  /**
   * 查询时间轴节点列表（不分页）
   * 按排序值升序、相同时按年份升序排列。
   * @returns 节点列表
   */
  async getList(): Promise<TimelineNodeVo[]> {
    const list = await this.prisma.timelineNode.findMany({
      orderBy: [{ sort: 'asc' }, { year: 'asc' }]
    })
    return list.map((item) => this.toVo(item))
  }

  /**
   * 新增时间轴节点
   * @param dto 年份、标题、描述、排序值
   * @returns 新增后的节点
   */
  async addNode(dto: AddTimelineDto): Promise<TimelineNodeVo> {
    const created = await this.prisma.timelineNode.create({
      data: {
        year: dto.year,
        title: dto.title,
        description: dto.description ?? null,
        sort: dto.sort
      }
    })
    return this.toVo(created)
  }

  /**
   * 更新时间轴节点
   * 仅更新传入字段；目标不存在时给出友好提示。
   * @param dto 节点 ID 及待更新字段
   * @returns 更新后的节点
   */
  async updateNode(dto: UpdateTimelineDto): Promise<TimelineNodeVo> {
    const { id, ...data } = dto
    try {
      const updated = await this.prisma.timelineNode.update({ where: { id }, data })
      return this.toVo(updated)
    } catch (e) {
      this.translatePrismaError(e)
      throw e
    }
  }

  /**
   * 删除时间轴节点
   * @param id 节点 ID
   */
  async deleteNode(id: number): Promise<void> {
    try {
      await this.prisma.timelineNode.delete({ where: { id } })
    } catch (e) {
      this.translatePrismaError(e)
      throw e
    }
  }

  /**
   * 将 Prisma 已知错误转为带业务语义的中文提示
   * P2025 记录不存在：更新/删除目标节点已不存在。
   * @param e 捕获到的异常
   */
  private translatePrismaError(e: unknown): void {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2025') {
      throw new BadRequestException('时间轴节点不存在或已被删除')
    }
  }

  /**
   * 拼装响应 VO（排除 tenantId/updateTime 等不对外字段）
   * @param entity 时间轴节点实体
   */
  private toVo(entity: {
    id: number
    year: number
    title: string
    description: string | null
    sort: number
    createTime: Date
  }): TimelineNodeVo {
    return {
      id: entity.id,
      year: entity.year,
      title: entity.title,
      description: entity.description,
      sort: entity.sort,
      // 转 ISO，再由全局 TransformInterceptor 统一格式化为东八区 YYYY-MM-DD HH:mm:ss
      createTime: entity.createTime.toISOString()
    }
  }
}
