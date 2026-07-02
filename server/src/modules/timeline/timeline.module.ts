import { Module } from '@nestjs/common'
import { TimelineController } from './controllers/timeline.controller'
import { TimelineService } from './services/timeline.service'

/**
 * 时间轴管理模块
 * 聚合时间轴节点的控制器与服务，提供成长轨迹节点的增删改查。
 */
@Module({
  controllers: [TimelineController],
  providers: [TimelineService]
})
export class TimelineModule {}
