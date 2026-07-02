import { Controller, Get } from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { Public, ApiResult } from '@/common/decorators'
import { BaseController } from '@/common/crud'
import { SiteHomeService } from '../services/site-home.service'
import { SiteHomeVo } from '../vo/site-home.vo'

/**
 * 展示站点首页控制器
 * 提供公开的首页聚合 API 端点（无需登录鉴权），供 website 前端调用。
 */
@ApiTags('展示站点')
@Controller('site/home')
export class SiteHomeController extends BaseController {
  constructor(private readonly siteHomeService: SiteHomeService) {
    super()
  }

  /**
   * 获取展示站点首页聚合数据
   * 无需登录鉴权，聚合标语、精选作品、能力、思考、关于我、成长历程。
   */
  @Public()
  @Get()
  @ApiOperation({ summary: '展示站点首页聚合数据（公开，无需登录）' })
  @ApiResult(SiteHomeVo)
  async getHome() {
    return this.ok(await this.siteHomeService.getHome())
  }
}
