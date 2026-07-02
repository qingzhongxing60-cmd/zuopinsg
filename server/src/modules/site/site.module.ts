import { Module } from '@nestjs/common'
import { SiteTimelineController } from './controllers/site-timeline.controller'
import { SiteTimelineService } from './services/site-timeline.service'
import { SiteHomeController } from './controllers/site-home.controller'
import { SiteHomeService } from './services/site-home.service'
import { SiteWorkController } from './controllers/site-work.controller'
import { SiteWorkService } from './services/site-work.service'
import { SiteAboutController } from './controllers/site-about.controller'
import { SiteAboutService } from './services/site-about.service'
import { SiteCategoryController } from './controllers/site-category.controller'
import { SiteCategoryService } from './services/site-category.service'

/**
 * 展示站点模块
 * 提供公开的展示站点 API 端点（无需登录鉴权），供 website 前端调用。
 * 覆盖首页聚合、成长历程、作品列表/详情、分类列表、关于我。
 */
@Module({
  controllers: [
    SiteTimelineController,
    SiteHomeController,
    SiteWorkController,
    SiteAboutController,
    SiteCategoryController,
  ],
  providers: [SiteTimelineService, SiteHomeService, SiteWorkService, SiteAboutService, SiteCategoryService],
})
export class SiteModule {}
