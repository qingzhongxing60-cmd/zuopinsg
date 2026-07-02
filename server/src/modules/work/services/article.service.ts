import { BadRequestException, Injectable } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { PrismaService } from '@/common/prisma.service'
import { AddArticleDto, UpdateArticleDto } from '../dto/article.dto'
import { BreakdownArticleVo } from '../vo/work.vo'

/**
 * 拆解文章服务
 * 提供指定作品下拆解文章的列表、增改删、发布/下架；草稿状态隔离由展示端过滤实现。
 */
@Injectable()
export class ArticleService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 获取指定作品的拆解文章列表
   * 按排序值升序（null 排后）、相同按创建时间升序。
   * @param workId 作品 ID
   * @returns 文章列表
   */
  async getList(workId: number): Promise<BreakdownArticleVo[]> {
    const list = await this.prisma.breakdownArticle.findMany({
      where: { workId },
      orderBy: [{ sort: { sort: 'asc', nulls: 'last' } }, { createTime: 'asc' }]
    })
    return list.map((item) => this.toVo(item))
  }

  /**
   * 新增拆解文章
   * @param dto 作品 ID、标题、内容、状态、排序
   * @returns 新增后的文章
   */
  async addArticle(dto: AddArticleDto): Promise<BreakdownArticleVo> {
    await this.ensureWorkExists(dto.workId)
    const created = await this.prisma.breakdownArticle.create({
      data: {
        workId: dto.workId,
        title: dto.title,
        content: dto.content ?? null,
        status: dto.status ?? 0,
        sort: dto.sort ?? null
      }
    })
    return this.toVo(created)
  }

  /**
   * 更新拆解文章
   * @param dto 文章 ID 及待更新字段
   * @returns 更新后的文章
   */
  async updateArticle(dto: UpdateArticleDto): Promise<BreakdownArticleVo> {
    const { id, ...data } = dto
    try {
      const updated = await this.prisma.breakdownArticle.update({ where: { id }, data })
      return this.toVo(updated)
    } catch (e) {
      this.translatePrismaError(e)
      throw e
    }
  }

  /**
   * 删除拆解文章
   * @param id 文章 ID
   */
  async deleteArticle(id: number): Promise<void> {
    try {
      await this.prisma.breakdownArticle.delete({ where: { id } })
    } catch (e) {
      this.translatePrismaError(e)
      throw e
    }
  }

  /**
   * 发布/下架（切换发布状态）
   * @param id 文章 ID
   * @returns 更新后的文章
   */
  async toggleStatus(id: number): Promise<BreakdownArticleVo> {
    const current = await this.prisma.breakdownArticle.findUnique({ where: { id } })
    if (!current) {
      throw new BadRequestException('拆解文章不存在或已被删除')
    }
    const updated = await this.prisma.breakdownArticle.update({
      where: { id },
      data: { status: current.status === 1 ? 0 : 1 }
    })
    return this.toVo(updated)
  }

  /**
   * 校验作品存在
   * @param workId 作品 ID
   */
  private async ensureWorkExists(workId: number): Promise<void> {
    const work = await this.prisma.work.findUnique({ where: { id: workId } })
    if (!work) {
      throw new BadRequestException('关联的作品不存在')
    }
  }

  /**
   * Prisma 错误转中文提示：P2025 不存在
   * @param e 捕获到的异常
   */
  private translatePrismaError(e: unknown): void {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2025') {
      throw new BadRequestException('拆解文章不存在或已被删除')
    }
  }

  /**
   * 拼装文章响应 VO（排除 tenantId/updateTime）
   * @param entity 文章实体
   */
  private toVo(entity: {
    id: number
    workId: number
    title: string
    content: string | null
    status: number
    sort: number | null
    createTime: Date
  }): BreakdownArticleVo {
    return {
      id: entity.id,
      workId: entity.workId,
      title: entity.title,
      content: entity.content,
      status: entity.status,
      sort: entity.sort,
      createTime: entity.createTime.toISOString()
    }
  }
}
