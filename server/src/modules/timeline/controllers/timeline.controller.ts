import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put } from '@nestjs/common'
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger'
import { BaseController } from '@/common/crud'
import { ApiArrayResult, ApiResult, ApiOkVoid, Perms } from '@/common/decorators'
import { TimelineService } from '../services/timeline.service'
import { AddTimelineDto, UpdateTimelineDto } from '../dto/timeline.dto'
import { TimelineNodeVo } from '../vo/timeline.vo'

/**
 * 时间轴管理控制器
 * 提供成长轨迹时间轴节点的列表查询、新增、编辑、删除接口，均为管理后台（admin）端，需登录鉴权。
 * 列表不分页、按排序值升序（相同按年份升序）返回数组。
 */
@ApiTags('时间轴管理')
@Controller('admin/timeline')
export class TimelineController extends BaseController {
  constructor(private readonly timelineService: TimelineService) {
    super()
  }

  /**
   * 查询时间轴节点列表
   * 不分页，按排序值升序（相同按年份升序）返回。
   */
  @Get('list')
  @Perms('list')
  @ApiOperation({ summary: '时间轴节点列表（不分页，按排序值升序）' })
  @ApiArrayResult(TimelineNodeVo)
  async list() {
    return this.ok(await this.timelineService.getList())
  }

  /**
   * 新增时间轴节点
   */
  @Post('add')
  @Perms('add')
  @ApiOperation({ summary: '新增时间轴节点' })
  @ApiResult(TimelineNodeVo)
  async add(@Body() dto: AddTimelineDto) {
    return this.ok(await this.timelineService.addNode(dto))
  }

  /**
   * 更新时间轴节点
   * 通过 id 定位，仅更新传入字段。
   */
  @Put('update')
  @Perms('update')
  @ApiOperation({ summary: '更新时间轴节点' })
  @ApiResult(TimelineNodeVo)
  async update(@Body() dto: UpdateTimelineDto) {
    return this.ok(await this.timelineService.updateNode(dto))
  }

  /**
   * 删除时间轴节点
   */
  @Delete('delete/:id')
  @Perms('delete')
  @ApiOperation({ summary: '按 id 删除时间轴节点' })
  @ApiParam({ name: 'id', description: '节点 ID', type: Number })
  @ApiOkVoid()
  async delete(@Param('id', ParseIntPipe) id: number) {
    await this.timelineService.deleteNode(id)
    return this.ok()
  }
}
