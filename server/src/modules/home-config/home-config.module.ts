import { Module } from '@nestjs/common'
import { HomeConfigController } from './controllers/home-config.controller'
import { HomeConfigService } from './services/home-config.service'

/**
 * 首页配置模块
 * 聚合首页配置的控制器与服务；通过 PrismaService 直接查询作品，避免与作品模块循环依赖。
 */
@Module({
  controllers: [HomeConfigController],
  providers: [HomeConfigService]
})
export class HomeConfigModule {}
