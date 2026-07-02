import { BadRequestException, Injectable } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { PrismaService } from '@/common/prisma.service'
import { AddVersionDto, UpdateVersionDto } from '../dto/version.dto'
import { PrototypeVersionVo } from '../vo/work.vo'

/**
 * 原型版本服务
 * 提供指定作品下原型版本的列表、增改删；版本名在同一作品下唯一，删除时级联清除图片（数据库约束）。
 */
@Injectable()
export class VersionService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 获取指定作品的版本列表
   * 按排序值升序（null 排后）、相同按创建时间升序。
   * @param workId 作品 ID
   * @returns 版本列表
   */
  async getList(workId: number): Promise<PrototypeVersionVo[]> {
    const list = await this.prisma.prototypeVersion.findMany({
      where: { workId },
      orderBy: [{ sort: { sort: 'asc', nulls: 'last' } }, { createTime: 'asc' }]
    })
    return list.map((item) => this.toVo(item))
  }

  /**
   * 新增原型版本
   * @param dto 作品 ID、版本名、标题、排序
   * @returns 新增后的版本
   */
  async addVersion(dto: AddVersionDto): Promise<PrototypeVersionVo> {
    await this.ensureWorkExists(dto.workId)
    try {
      const created = await this.prisma.prototypeVersion.create({
        data: {
          workId: dto.workId,
          name: dto.name,
          title: dto.title ?? null,
          sort: dto.sort ?? null
        }
      })
      return this.toVo(created)
    } catch (e) {
      this.translatePrismaError(e)
      throw e
    }
  }

  /**
   * 更新原型版本
   * @param dto 版本 ID 及待更新字段
   * @returns 更新后的版本
   */
  async updateVersion(dto: UpdateVersionDto): Promise<PrototypeVersionVo> {
    const { id, ...data } = dto
    try {
      const updated = await this.prisma.prototypeVersion.update({ where: { id }, data })
      return this.toVo(updated)
    } catch (e) {
      this.translatePrismaError(e)
      throw e
    }
  }

  /**
   * 删除原型版本（数据库级联清除该版本下图片）
   * @param id 版本 ID
   */
  async deleteVersion(id: number): Promise<void> {
    try {
      await this.prisma.prototypeVersion.delete({ where: { id } })
    } catch (e) {
      this.translatePrismaError(e)
      throw e
    }
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
   * Prisma 错误转中文提示：P2002 版本名冲突；P2025 不存在
   * @param e 捕获到的异常
   */
  private translatePrismaError(e: unknown): void {
    if (!(e instanceof Prisma.PrismaClientKnownRequestError)) return
    if (e.code === 'P2002') {
      throw new BadRequestException('该版本名已存在，请更换')
    }
    if (e.code === 'P2025') {
      throw new BadRequestException('原型版本不存在或已被删除')
    }
  }

  /**
   * 拼装版本响应 VO（排除 tenantId/updateTime）
   * @param entity 版本实体
   */
  private toVo(entity: {
    id: number
    workId: number
    name: string
    title: string | null
    sort: number | null
    createTime: Date
  }): PrototypeVersionVo {
    return {
      id: entity.id,
      workId: entity.workId,
      name: entity.name,
      title: entity.title,
      sort: entity.sort,
      createTime: entity.createTime.toISOString()
    }
  }
}
