import { Controller, Get } from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { Public, ApiResult } from '@/common/decorators'
import { BaseController } from '@/common/crud'
import { SiteAboutService } from '../services/site-about.service'
import { SiteAboutVo } from '../vo/site-about.vo'

/**
 * 展示站点「关于我」控制器
 * 提供公开的关于我聚合 API 端点（无需登录鉴权），供 website 前端调用。
 */
@ApiTags('展示站点')
@Controller('site/about')
export class SiteAboutController extends BaseController {
  constructor(private readonly siteAboutService: SiteAboutService) {
    super()
  }

  /**
   * 获取「关于我」聚合数据
   * 无需登录鉴权，聚合个人名片、自我介绍、专长领域。
   */
  @Public()
  @Get()
  @ApiOperation({ summary: '展示站点「关于我」聚合数据（公开，无需登录）' })
  @ApiResult(SiteAboutVo)
  async getAbout() {
    return this.ok(await this.siteAboutService.getAbout())
  }
}
