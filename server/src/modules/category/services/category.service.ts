import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '@/common/prisma.service';
import { BaseService } from '@/common/crud';
import { AddCategoryDto, UpdateCategoryDto } from '../dto/category.dto';
import { CategoryVo } from '../vo/category.vo';

/**
 * 分类管理服务
 * 在基础能力之上提供：名称/唯一标识全局唯一校验、按排序值升序的列表、删除保护。
 * 唯一性冲突依赖数据库唯一约束（P2002）捕获，不预查再写，避免并发下的 TOCTOU 竞争。
 *
 * 注：关联作品数（workCount）与删除保护依赖 Work 表（B05 作品模块，当前未建），
 * 现阶段 workCount 统一返回 0、删除不拦截；待 Work 表建立后接入真实统计与保护逻辑。
 */
@Injectable()
export class CategoryService extends BaseService {
  constructor(protected prisma: PrismaService) {
    super(prisma, 'category');
  }

  /**
   * 查询分类列表（不分页）
   * 按排序值升序、相同时按创建时间升序排列；name 非空时按名称模糊过滤。
   * @param name 名称模糊搜索关键词
   * @returns 分类列表（每项含 workCount）
   */
  async getList(name?: string): Promise<CategoryVo[]> {
    const keyword = name?.trim();
    const list = await this.prisma.category.findMany({
      where: keyword ? { name: { contains: keyword } } : undefined,
      orderBy: [{ sort: 'asc' }, { createTime: 'asc' }],
    });
    // workCount 待 Work 表建立后用关联统计替换，当前统一置 0
    return list.map((item) => this.toVo(item, 0));
  }

  /**
   * 新增分类
   * @param dto 分类名、唯一标识、排序值
   * @returns 新增后的分类
   */
  async addCategory(dto: AddCategoryDto): Promise<CategoryVo> {
    try {
      // 显式列出写入字段，避免 DTO 未来新增非持久化字段时被一并写库
      const created = await this.prisma.category.create({
        data: { name: dto.name, slug: dto.slug, sort: dto.sort },
      });
      return this.toVo(created, 0);
    } catch (e) {
      this.translatePrismaError(e);
      throw e;
    }
  }

  /**
   * 更新分类
   * 仅更新传入字段；名称/唯一标识冲突时给出对应提示。
   * @param dto 分类 ID 及待更新字段
   * @returns 更新后的分类
   */
  async updateCategory(dto: UpdateCategoryDto): Promise<CategoryVo> {
    const { id, ...data } = dto;
    try {
      const updated = await this.prisma.category.update({ where: { id }, data });
      return this.toVo(updated, 0);
    } catch (e) {
      this.translatePrismaError(e);
      throw e;
    }
  }

  /**
   * 删除分类（含删除保护）
   * @param id 分类 ID
   */
  async deleteCategory(id: number): Promise<void> {
    // 删除保护：分类下存在关联作品（含草稿与已发布）时禁止删除。
    // 依赖 Work 表（B05 未建），当前无关联数据可查，暂不拦截；
    // Work 表建立后在此补充 prisma.work.count({ where: { categoryId: id } }) 校验。
    try {
      await this.prisma.category.delete({ where: { id } });
    } catch (e) {
      this.translatePrismaError(e);
      throw e;
    }
  }

  /**
   * 将 Prisma 已知错误转为带业务语义的中文提示
   * - P2002 唯一约束冲突：按冲突字段区分名称 / 唯一标识
   * - P2025 记录不存在：更新 / 删除目标分类已不存在
   * 非上述错误不处理，由调用方原样抛出交全局过滤器兜底。
   * @param e 捕获到的异常
   */
  private translatePrismaError(e: unknown): void {
    if (!(e instanceof Prisma.PrismaClientKnownRequestError)) return;
    if (e.code === 'P2002') {
      const target = (e.meta?.target as string[] | undefined) ?? [];
      if (target.includes('slug')) {
        throw new BadRequestException('唯一标识已存在，请修改后重新提交');
      }
      // 默认按名称冲突处理（name 唯一约束）
      throw new BadRequestException('分类名称已存在，请修改后重新提交');
    }
    if (e.code === 'P2025') {
      throw new BadRequestException('分类不存在或已被删除');
    }
  }

  /**
   * 拼装响应 VO（排除 tenantId/updateTime 等不对外字段）
   * @param entity 分类实体
   * @param workCount 关联作品数
   */
  private toVo(
    entity: { id: number; name: string; slug: string; sort: number; createTime: Date },
    workCount: number,
  ): CategoryVo {
    return {
      id: entity.id,
      name: entity.name,
      slug: entity.slug,
      sort: entity.sort,
      workCount,
      // 转 ISO 字符串，再由全局 TransformInterceptor 统一格式化为东八区 YYYY-MM-DD HH:mm:ss
      createTime: entity.createTime.toISOString(),
    };
  }
}
