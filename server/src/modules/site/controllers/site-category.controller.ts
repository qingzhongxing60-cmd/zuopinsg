import { Controller, Get } from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { Public, ApiArrayResult } from '@/common/decorators'
import { BaseController } from '@/common/crud'
import { SiteCategoryService } from '../services/site-category.service'
import { SiteCategoryVo } from '../vo/site-category.vo'

/**
 * 展示站点分类控制器
 * 提供公开的分类列表 API 端点（无需登录鉴权），供 website 前端调用。
 */
@ApiTags('展示站点')
@Controller('site/categories')
export class SiteCategoryController extends BaseController {
  constructor(private readonly siteCategoryService: SiteCategoryService) {
    super()
  }

  /**
   * 获取全部分类列表
   * 无需登录鉴权，按排序值升序返回。
   */
  @Public()
  @Get()
  @ApiOperation({ summary: '展示站点分类列表（公开，无需登录）' })
  @ApiArrayResult(SiteCategoryVo)
  async getCategories() {
    return this.ok(await this.siteCategoryService.getCategories())
  }
}
