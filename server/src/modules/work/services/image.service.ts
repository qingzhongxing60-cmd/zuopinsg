import { BadRequestException, Injectable } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { PrismaService } from '@/common/prisma.service'
import { AddImagesDto, UpdateImageDto } from '../dto/image.dto'
import { PrototypeImageVo } from '../vo/work.vo'

/**
 * 原型图片服务
 * 提供指定版本下图片的列表、批量新增、更新说明/排序、删除。
 */
@Injectable()
export class ImageService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 获取指定版本的图片列表
   * 按排序值升序（null 排后）、相同按创建时间升序。
   * @param versionId 版本 ID
   * @returns 图片列表
   */
  async getList(versionId: number): Promise<PrototypeImageVo[]> {
    const list = await this.prisma.prototypeImage.findMany({
      where: { versionId },
      orderBy: [{ sort: { sort: 'asc', nulls: 'last' } }, { createTime: 'asc' }]
    })
    return list.map((item) => this.toVo(item))
  }

  /**
   * 批量新增原型图片
   * 校验版本存在后，用事务逐条 create 保证精确返回本次新增记录（规避并发下的取回竞态）。
   * @param dto 版本 ID 与图片数组
   * @returns 新增的图片列表
   */
  async addImages(dto: AddImagesDto): Promise<PrototypeImageVo[]> {
    const version = await this.prisma.prototypeVersion.findUnique({
      where: { id: dto.versionId }
    })
    if (!version) {
      throw new BadRequestException('关联的版本不存在')
    }
    // 用事务逐条 create，返回值即本次新增记录，保持插入顺序，避免 createMany 后取回的并发竞态
    const created = await this.prisma.$transaction(
      dto.images.map((img) =>
        this.prisma.prototypeImage.create({
          data: {
            versionId: dto.versionId,
            url: img.url,
            caption: img.caption ?? null,
            sort: img.sort ?? null
          }
        })
      )
    )
    return created.map((item) => this.toVo(item))
  }

  /**
   * 更新图片说明与排序（不可改 url）
   * @param dto 图片 ID、说明、排序
   * @returns 更新后的图片
   */
  async updateImage(dto: UpdateImageDto): Promise<PrototypeImageVo> {
    const { id, ...data } = dto
    try {
      const updated = await this.prisma.prototypeImage.update({ where: { id }, data })
      return this.toVo(updated)
    } catch (e) {
      this.translatePrismaError(e)
      throw e
    }
  }

  /**
   * 删除原型图片
   * @param id 图片 ID
   */
  async deleteImage(id: number): Promise<void> {
    try {
      await this.prisma.prototypeImage.delete({ where: { id } })
    } catch (e) {
      this.translatePrismaError(e)
      throw e
    }
  }

  /**
   * Prisma 错误转中文提示：P2025 不存在
   * @param e 捕获到的异常
   */
  private translatePrismaError(e: unknown): void {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2025') {
      throw new BadRequestException('原型图片不存在或已被删除')
    }
  }

  /**
   * 拼装图片响应 VO（排除 tenantId/updateTime）
   * @param entity 图片实体
   */
  private toVo(entity: {
    id: number
    versionId: number
    url: string
    caption: string | null
    sort: number | null
    createTime: Date
  }): PrototypeImageVo {
    return {
      id: entity.id,
      versionId: entity.versionId,
      url: entity.url,
      caption: entity.caption,
      sort: entity.sort,
      createTime: entity.createTime.toISOString()
    }
  }
}
