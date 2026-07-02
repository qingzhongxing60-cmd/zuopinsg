import { Controller, Get, Param } from '@nestjs/common'
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger'
import { Public, ApiResult, ApiArrayResult } from '@/common/decorators'
import { BaseController } from '@/common/crud'
import { SiteWorkService } from '../services/site-work.service'
import { SiteWorkItemVo, SiteWorkDetailVo } from '../vo/site-work.vo'

/**
 * 展示站点作品控制器
 * 提供公开的作品列表与详情 API 端点（无需登录鉴权），供 website 前端调用。
 * 均为已发布作品（草稿隔离）。
 */
@ApiTags('展示站点')
@Controller('site/works')
export class SiteWorkController extends BaseController {
  constructor(private readonly siteWorkService: SiteWorkService) {
    super()
  }

  /**
   * 获取全部已发布作品列表
   * 无需登录鉴权，草稿隔离，按发布日期倒序。
   */
  @Public()
  @Get()
  @ApiOperation({ summary: '展示站点作品列表（公开，无需登录）' })
  @ApiArrayResult(SiteWorkItemVo)
  async getWorks() {
    return this.ok(await this.siteWorkService.getWorks())
  }

  /**
   * 按 slug 获取作品详情
   * 无需登录鉴权；slug 不存在或指向草稿时返回 code=404（前端展示未找到态）。
   */
  @Public()
  @Get(':slug')
  @ApiOperation({ summary: '展示站点作品详情（公开，无需登录）' })
  @ApiParam({ name: 'slug', description: '作品唯一标识' })
  @ApiResult(SiteWorkDetailVo)
  async getWorkDetail(@Param('slug') slug: string) {
    const detail = await this.siteWorkService.getWorkDetail(slug)
    if (!detail) {
      return this.fail('作品不存在或已下架', 404)
    }
    return this.ok(detail)
  }
}
