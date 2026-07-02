import { Module } from '@nestjs/common'
import { AboutController } from './controllers/about.controller'
import { AboutService } from './services/about.service'

/**
 * 关于我管理模块
 * 聚合个人介绍与技能管理的控制器与服务。
 */
@Module({
  controllers: [AboutController],
  providers: [AboutService]
})
export class AboutModule {}
