import { Module } from '@nestjs/common'
import { StatisticsController } from './controllers/statistics.controller'
import { StatisticsService } from './services/statistics.service'

/**
 * 数据统计模块
 * 聚合数据统计的控制器与服务；通过 PrismaService 直接查询作品访问量。
 */
@Module({
  controllers: [StatisticsController],
  providers: [StatisticsService]
})
export class StatisticsModule {}
