import { Controller, Get } from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { Public } from '@/common/decorators'
import { ApiArrayResult } from '@/common/decorators'
import { BaseController } from '@/common/crud'
import { SiteTimelineService } from '../services/site-timeline.service'
import { SiteTimelineNodeVo } from '../vo/site-timeline.vo'

/**
 * 展示站点时间轴控制器
 * 提供公开的时间轴 API 端点（无需登录鉴权），供 website 前端调用。
 */
@ApiTags('展示站点')
@Controller('site/timeline')
export class SiteTimelineController extends BaseController {
  constructor(private readonly siteTimelineService: SiteTimelineService) {
    super()
  }

  /**
   * 获取展示站点时间轴节点列表
   * 无需登录鉴权，按年份升序返回。
   */
  @Public()
  @Get()
  @ApiOperation({ summary: '展示站点时间轴节点列表（公开，无需登录）' })
  @ApiArrayResult(SiteTimelineNodeVo)
  async getTimeline() {
    return this.ok(await this.siteTimelineService.getTimeline())
  }
}
