import { Controller, Get, Query } from '@nestjs/common'
import { ApiOperation, ApiQuery, ApiTags, ApiOkResponse } from '@nestjs/swagger'
import { BaseController } from '@/common/crud'
import { Perms } from '@/common/decorators'
import { StatisticsService } from '../services/statistics.service'
import { WorkViewRankDto } from '../dto/statistics.dto'

/**
 * 数据统计控制器
 * 提供作品访问量排行的只读查询接口，需登录鉴权。
 * 排行仅含已发布作品，按访问量降序分页。
 */
@ApiTags('数据统计')
@Controller('admin/statistics')
export class StatisticsController extends BaseController {
  constructor(private readonly statisticsService: StatisticsService) {
    super()
  }

  /**
   * 作品访问量排行（分页，只读）
   */
  @Get('work-views')
  @Perms('work-views')
  @ApiOperation({ summary: '作品访问量排行（仅已发布，按访问量降序，分页）' })
  @ApiQuery({ name: 'page', required: false, description: '页码，从 1 开始' })
  @ApiQuery({ name: 'pageSize', required: false, description: '每页条数（1-100，默认 10）' })
  @ApiOkResponse({
    schema: {
      properties: {
        code: { type: 'number', example: 200 },
        message: { type: 'string', example: 'success' },
        data: {
          type: 'object',
          properties: {
            list: { type: 'array', items: { type: 'object' } },
            pagination: { type: 'object' }
          }
        }
      }
    }
  })
  async workViews(@Query() query: WorkViewRankDto) {
    return this.ok(await this.statisticsService.getWorkViewRank(query))
  }
}
