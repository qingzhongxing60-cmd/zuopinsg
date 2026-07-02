import { BadRequestException, Injectable } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { PrismaService } from '@/common/prisma.service'
import { UpdateAboutProfileDto, AddSkillDto, UpdateSkillDto } from '../dto/about.dto'
import { AboutProfileVo, SkillVo } from '../vo/about.vo'

// 个人介绍为全局唯一单条记录，固定主键
const PROFILE_ID = 1

/**
 * 关于我管理服务
 * 个人介绍（AboutMe）：全局唯一单条，覆盖写入（upsert）；首次读取无记录时返回空结构。
 * 技能（Skill）：多条，支持增改删，按排序值升序（相同按录入时间升序）。
 */
@Injectable()
export class AboutService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 获取个人介绍
   * 无记录时返回空结构（首次进入空表单场景），不报错。
   * @returns 个人介绍
   */
  async getProfile(): Promise<AboutProfileVo> {
    const entity = await this.prisma.aboutMe.findUnique({ where: { id: PROFILE_ID } })
    // 首次无记录由 Service 直接返回默认 VO，不依赖数据库默认值
    if (!entity) {
      return { intro: '', avatar: null, resume: null }
    }
    return { intro: entity.intro, avatar: entity.avatar, resume: entity.resume }
  }

  /**
   * 覆盖写入个人介绍（upsert 保证全局唯一）
   * @param dto 简介、头像、简历
   * @returns 更新后的个人介绍
   */
  async upsertProfile(dto: UpdateAboutProfileDto): Promise<AboutProfileVo> {
    const data = {
      intro: dto.intro,
      avatar: dto.avatar ?? null,
      resume: dto.resume ?? null
    }
    const entity = await this.prisma.aboutMe.upsert({
      where: { id: PROFILE_ID },
      create: { id: PROFILE_ID, ...data },
      update: data
    })
    return { intro: entity.intro, avatar: entity.avatar, resume: entity.resume }
  }

  /**
   * 获取技能列表（不分页）
   * 按排序值升序、相同时按录入时间升序排列。
   * @returns 技能列表
   */
  async getSkillList(): Promise<SkillVo[]> {
    const list = await this.prisma.skill.findMany({
      orderBy: [{ sort: 'asc' }, { createTime: 'asc' }]
    })
    return list.map((item) => this.toSkillVo(item))
  }

  /**
   * 新增技能
   * @param dto 技能名称、评分值、排序值
   * @returns 新增后的技能
   */
  async addSkill(dto: AddSkillDto): Promise<SkillVo> {
    const created = await this.prisma.skill.create({
      data: { name: dto.name, score: dto.score, sort: dto.sort }
    })
    return this.toSkillVo(created)
  }

  /**
   * 更新技能
   * 仅更新传入字段；目标不存在时给出友好提示。
   * @param dto 技能 ID 及待更新字段
   * @returns 更新后的技能
   */
  async updateSkill(dto: UpdateSkillDto): Promise<SkillVo> {
    const { id, ...data } = dto
    try {
      const updated = await this.prisma.skill.update({ where: { id }, data })
      return this.toSkillVo(updated)
    } catch (e) {
      this.translateSkillError(e)
      throw e
    }
  }

  /**
   * 删除技能
   * @param id 技能 ID
   */
  async deleteSkill(id: number): Promise<void> {
    try {
      await this.prisma.skill.delete({ where: { id } })
    } catch (e) {
      this.translateSkillError(e)
      throw e
    }
  }

  /**
   * 将 Prisma 已知错误转为带业务语义的中文提示（技能不存在）
   * @param e 捕获到的异常
   */
  private translateSkillError(e: unknown): void {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2025') {
      throw new BadRequestException('技能不存在或已被删除')
    }
  }

  /**
   * 拼装技能响应 VO（排除 tenantId/updateTime）
   * @param entity 技能实体
   */
  private toSkillVo(entity: {
    id: number
    name: string
    score: number
    sort: number
    createTime: Date
  }): SkillVo {
    return {
      id: entity.id,
      name: entity.name,
      score: entity.score,
      sort: entity.sort,
      createTime: entity.createTime.toISOString()
    }
  }
}
