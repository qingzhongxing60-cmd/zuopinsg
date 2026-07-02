import { BadRequestException, Injectable } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { PrismaService } from '@/common/prisma.service'
import { AddWorkDto, UpdateWorkDto, WorkListDto } from '../dto/work.dto'
import { WorkVo } from '../vo/work.vo'

/**
 * 作品管理服务
 * 提供作品全生命周期管理：列表（含分类名拼接）、新增/编辑（slug 唯一+格式校验、分类存在校验）、
 * 删除（数据库级联清子资源）、发布/下架（首次发布记 publishTime 不覆盖）、切换精选。
 */
@Injectable()
export class WorkService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 查询作品列表（不分页）
   * 支持标题模糊、分类、状态过滤；按排序值升序（null 排后）、相同按创建时间倒序。
   * @param query 过滤条件
   * @returns 作品列表（含 categoryName）
   */
  async getList(query: WorkListDto): Promise<WorkVo[]> {
    const where: Prisma.WorkWhereInput = {}
    const title = query.title?.trim()
    if (title) {
      where.title = { contains: title }
    }
    if (query.categoryId && /^\d+$/.test(query.categoryId)) {
      where.categoryId = Number(query.categoryId)
    }
    if (query.status === '0' || query.status === '1') {
      where.status = Number(query.status)
    }
    const list = await this.prisma.work.findMany({
      where,
      orderBy: [{ sort: { sort: 'asc', nulls: 'last' } }, { createTime: 'desc' }],
      include: { category: { select: { name: true } } }
    })
    return list.map((item) => this.toVo(item))
  }

  /**
   * 新增作品
   * 校验分类存在；若 status=1 视为首次发布同步记录 publishTime。
   * @param dto 作品字段
   * @returns 新增后的作品
   */
  async addWork(dto: AddWorkDto): Promise<WorkVo> {
    await this.ensureCategoryExists(dto.categoryId)
    const isPublish = dto.status === 1
    try {
      const created = await this.prisma.work.create({
        data: {
          title: dto.title,
          slug: dto.slug,
          categoryId: dto.categoryId,
          intro: dto.intro ?? null,
          cover: dto.cover ?? null,
          detail: dto.detail ?? null,
          featured: dto.featured ?? false,
          status: dto.status ?? 0,
          sort: dto.sort ?? null,
          publishTime: isPublish ? new Date() : null
        },
        include: { category: { select: { name: true } } }
      })
      return this.toVo(created)
    } catch (e) {
      this.translatePrismaError(e)
      throw e
    }
  }

  /**
   * 更新作品
   * 仅更新传入字段；变更分类时校验存在。status/views/publishTime 不在此处理
   * （发布状态走 toggleStatus 以保证首次发布时间记录逻辑，访问量由展示端维护）。
   * @param dto 作品 ID 及待更新字段
   * @returns 更新后的作品
   */
  async updateWork(dto: UpdateWorkDto): Promise<WorkVo> {
    // 剔除 status，避免绕过 toggleStatus 的首次发布时间记录逻辑
    const { id, status: _status, ...data } = dto
    if (data.categoryId !== undefined) {
      await this.ensureCategoryExists(data.categoryId)
    }
    try {
      const updated = await this.prisma.work.update({
        where: { id },
        data,
        include: { category: { select: { name: true } } }
      })
      return this.toVo(updated)
    } catch (e) {
      this.translatePrismaError(e)
      throw e
    }
  }

  /**
   * 删除作品
   * 数据库外键级联清除原型版本、原型图片、拆解文章（onDelete: Cascade）。
   * @param id 作品 ID
   */
  async deleteWork(id: number): Promise<void> {
    try {
      await this.prisma.work.delete({ where: { id } })
    } catch (e) {
      this.translatePrismaError(e)
      throw e
    }
  }

  /**
   * 发布/下架（切换发布状态）
   * 草稿→已发布时，若从未发布过则记录 publishTime（后续不覆盖）。
   * @param id 作品 ID
   * @returns 更新后的作品
   */
  async toggleStatus(id: number): Promise<WorkVo> {
    const current = await this.prisma.work.findUnique({ where: { id } })
    if (!current) {
      throw new BadRequestException('作品不存在或已被删除')
    }
    const newStatus = current.status === 1 ? 0 : 1
    const isFirstPublish = current.publishTime === null && newStatus === 1
    const updated = await this.prisma.work.update({
      where: { id },
      data: {
        status: newStatus,
        ...(isFirstPublish ? { publishTime: new Date() } : {})
      },
      include: { category: { select: { name: true } } }
    })
    return this.toVo(updated)
  }

  /**
   * 切换精选标记
   * @param id 作品 ID
   * @returns 更新后的作品
   */
  async toggleFeatured(id: number): Promise<WorkVo> {
    const current = await this.prisma.work.findUnique({ where: { id } })
    if (!current) {
      throw new BadRequestException('作品不存在或已被删除')
    }
    const updated = await this.prisma.work.update({
      where: { id },
      data: { featured: !current.featured },
      include: { category: { select: { name: true } } }
    })
    return this.toVo(updated)
  }

  /**
   * 校验分类存在，不存在抛出友好提示
   * @param categoryId 分类 ID
   */
  private async ensureCategoryExists(categoryId: number): Promise<void> {
    const category = await this.prisma.category.findUnique({ where: { id: categoryId } })
    if (!category) {
      throw new BadRequestException('所选分类不存在')
    }
  }

  /**
   * 将 Prisma 已知错误转为带业务语义的中文提示
   * P2002 slug 唯一冲突；P2025 记录不存在。
   * @param e 捕获到的异常
   */
  private translatePrismaError(e: unknown): void {
    if (!(e instanceof Prisma.PrismaClientKnownRequestError)) return
    if (e.code === 'P2002') {
      throw new BadRequestException('唯一标识已存在，请更换')
    }
    if (e.code === 'P2025') {
      throw new BadRequestException('作品不存在或已被删除')
    }
  }

  /**
   * 拼装作品响应 VO（排除 tenantId/updateTime，拼接 categoryName）
   * @param entity 作品实体（含 category 关联）
   */
  private toVo(
    entity: {
      id: number
      title: string
      slug: string
      intro: string | null
      cover: string | null
      detail: string | null
      categoryId: number
      featured: boolean
      status: number
      views: number
      sort: number | null
      publishTime: Date | null
      createTime: Date
      category?: { name: string } | null
    }
  ): WorkVo {
    return {
      id: entity.id,
      title: entity.title,
      slug: entity.slug,
      intro: entity.intro,
      cover: entity.cover,
      detail: entity.detail,
      categoryId: entity.categoryId,
      categoryName: entity.category?.name ?? '-',
      featured: entity.featured,
      status: entity.status,
      views: entity.views,
      sort: entity.sort,
      // 转 ISO，再由全局 TransformInterceptor 统一格式化为东八区
      publishTime: entity.publishTime ? entity.publishTime.toISOString() : null,
      createTime: entity.createTime.toISOString()
    }
  }
}

