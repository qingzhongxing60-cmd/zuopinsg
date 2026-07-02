import { Module } from '@nestjs/common'
import { WorkController } from './controllers/work.controller'
import { VersionController } from './controllers/version.controller'
import { ImageController } from './controllers/image.controller'
import { ArticleController } from './controllers/article.controller'
import { WorkService } from './services/work.service'
import { VersionService } from './services/version.service'
import { ImageService } from './services/image.service'
import { ArticleService } from './services/article.service'

/**
 * 作品管理模块
 * 聚合作品、原型版本、原型图片、拆解文章四组控制器与服务。
 * 导出 WorkService 供首页配置（B06）与数据统计（B07）注入查询作品数据。
 */
@Module({
  controllers: [WorkController, VersionController, ImageController, ArticleController],
  providers: [WorkService, VersionService, ImageService, ArticleService],
  exports: [WorkService]
})
export class WorkModule {}
