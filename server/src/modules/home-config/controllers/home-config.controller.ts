import { Body, Controller, Get, Put } from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { BaseController } from '@/common/crud'
import { ApiArrayResult, ApiResult, Perms } from '@/common/decorators'
import { HomeConfigService } from '../services/home-config.service'
import { UpdateHomeConfigDto } from '../dto/home-config.dto'
import { HomeConfigVo, FeaturedWorkOptionVo } from '../vo/home-config.vo'

/**
 * 首页配置控制器
 * 提供首页配置的读取、覆盖写入，以及精选作品候选池查询，需登录鉴权。
 * 配置读取仅需登录（后台编辑页回显）；写操作与候选池声明权限点。
 */
@ApiTags('首页配置')
@Controller('admin/home-config')
export class HomeConfigController extends BaseController {
  constructor(private readonly homeConfigService: HomeConfigService) {
    super()
  }

  /**
   * 获取首页配置（单条固定记录）
   */
  @Get()
  @ApiOperation({ summary: '获取首页配置' })
  @ApiResult(HomeConfigVo)
  async getConfig() {
    return this.ok(await this.homeConfigService.getConfig())
  }

  /**
   * 更新首页配置（覆盖写入）
   */
  @Put()
  @Perms('update')
  @ApiOperation({ summary: '更新首页配置（覆盖写入）' })
  @ApiResult(HomeConfigVo)
  async updateConfig(@Body() dto: UpdateHomeConfigDto) {
    return this.ok(await this.homeConfigService.upsertConfig(dto))
  }

  /**
   * 获取精选作品候选池（已发布且精选）
   */
  @Get('featured-options')
  @Perms('featured-options')
  @ApiOperation({ summary: '精选作品候选池（已发布且精选）' })
  @ApiArrayResult(FeaturedWorkOptionVo)
  async getFeaturedOptions() {
    return this.ok(await this.homeConfigService.getFeaturedOptions())
  }
}
