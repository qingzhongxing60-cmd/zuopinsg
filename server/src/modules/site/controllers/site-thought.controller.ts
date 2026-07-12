import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common'
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger'
import { Public, ApiResult, ApiArrayResult } from '@/common/decorators'
import { BaseController } from '@/common/crud'
import { SiteThoughtService } from '../services/site-thought.service'
import { SiteThoughtItemVo, SiteThoughtDetailVo } from '../vo/site-thought.vo'

/**
 * 展示站点「最新思考」控制器
 * 提供公开的思考文章列表与详情 API 端点（无需登录鉴权），供 website 前端调用。
 * 数据源为已发布的作品拆解文章（草稿隔离）。
 */
@ApiTags('展示站点')
@Controller('site/thoughts')
export class SiteThoughtController extends BaseController {
  constructor(private readonly siteThoughtService: SiteThoughtService) {
    super()
  }

  /**
   * 获取全部已发布思考文章列表
   * 无需登录鉴权，草稿隔离，按创建时间倒序。
   */
  @Public()
  @Get()
  @ApiOperation({ summary: '展示站点思考列表（公开，无需登录）' })
  @ApiArrayResult(SiteThoughtItemVo)
  async getThoughts() {
    return this.ok(await this.siteThoughtService.getThoughts())
  }

  /**
   * 按 ID 获取思考文章详情
   * 无需登录鉴权；ID 不存在或指向草稿时返回 code=404（前端展示未找到态）。
   */
  @Public()
  @Get(':id')
  @ApiOperation({ summary: '展示站点思考详情（公开，无需登录）' })
  @ApiParam({ name: 'id', description: '思考文章 ID' })
  @ApiResult(SiteThoughtDetailVo)
  async getThoughtDetail(@Param('id', ParseIntPipe) id: number) {
    const detail = await this.siteThoughtService.getThoughtDetail(id)
    if (!detail) {
      return this.fail('文章不存在或已下架', 404)
    }
    return this.ok(detail)
  }
}
