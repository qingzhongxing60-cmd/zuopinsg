import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, Query } from '@nestjs/common'
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger'
import { BaseController } from '@/common/crud'
import { ApiArrayResult, ApiResult, ApiOkVoid, Perms } from '@/common/decorators'
import { WorkService } from '../services/work.service'
import { AddWorkDto, UpdateWorkDto, WorkListDto, WorkIdDto } from '../dto/work.dto'
import { WorkVo } from '../vo/work.vo'

/**
 * 作品管理控制器
 * 提供作品的列表、新增、编辑、删除、发布/下架、切换精选接口，均为管理后台（admin）端，需登录鉴权。
 * 列表不分页，按排序值升序（null 排后）、相同按创建时间倒序返回。
 */
@ApiTags('作品管理')
@Controller('admin/work')
export class WorkController extends BaseController {
  constructor(private readonly workService: WorkService) {
    super()
  }

  /**
   * 查询作品列表
   * 支持按标题模糊、分类、发布状态过滤。
   */
  @Get('list')
  @Perms('list')
  @ApiOperation({ summary: '作品列表（不分页，支持标题/分类/状态筛选）' })
  @ApiArrayResult(WorkVo)
  async list(@Query() query: WorkListDto) {
    return this.ok(await this.workService.getList(query))
  }

  /**
   * 新增作品
   */
  @Post('add')
  @Perms('add')
  @ApiOperation({ summary: '新增作品' })
  @ApiResult(WorkVo)
  async add(@Body() dto: AddWorkDto) {
    return this.ok(await this.workService.addWork(dto))
  }

  /**
   * 更新作品
   */
  @Put('update')
  @Perms('update')
  @ApiOperation({ summary: '更新作品' })
  @ApiResult(WorkVo)
  async update(@Body() dto: UpdateWorkDto) {
    return this.ok(await this.workService.updateWork(dto))
  }

  /**
   * 删除作品（级联清除原型版本、图片与拆解文章）
   */
  @Delete('delete/:id')
  @Perms('delete')
  @ApiOperation({ summary: '按 id 删除作品（级联清子资源）' })
  @ApiParam({ name: 'id', description: '作品 ID', type: Number })
  @ApiOkVoid()
  async delete(@Param('id', ParseIntPipe) id: number) {
    await this.workService.deleteWork(id)
    return this.ok()
  }

  /**
   * 发布 / 下架（按当前状态切换）
   */
  @Put('toggle-status')
  @Perms('toggle-status')
  @ApiOperation({ summary: '发布/下架（按当前状态切换）' })
  @ApiResult(WorkVo)
  async toggleStatus(@Body() dto: WorkIdDto) {
    return this.ok(await this.workService.toggleStatus(dto.id))
  }

  /**
   * 设为精选 / 取消精选（按当前标记切换）
   */
  @Put('toggle-featured')
  @Perms('toggle-featured')
  @ApiOperation({ summary: '切换精选标记' })
  @ApiResult(WorkVo)
  async toggleFeatured(@Body() dto: WorkIdDto) {
    return this.ok(await this.workService.toggleFeatured(dto.id))
  }
}
