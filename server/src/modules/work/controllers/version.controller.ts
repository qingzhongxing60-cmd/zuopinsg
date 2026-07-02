import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, Query } from '@nestjs/common'
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger'
import { BaseController } from '@/common/crud'
import { ApiArrayResult, ApiResult, ApiOkVoid, Perms } from '@/common/decorators'
import { VersionService } from '../services/version.service'
import { AddVersionDto, UpdateVersionDto, VersionListDto } from '../dto/version.dto'
import { PrototypeVersionVo } from '../vo/work.vo'

/**
 * 原型版本控制器
 * 提供指定作品下原型版本的列表、新增、编辑、删除接口，需登录鉴权。
 * 权限点前缀 work:version。
 */
@ApiTags('原型版本')
@Controller('admin/work/version')
export class VersionController extends BaseController {
  constructor(private readonly versionService: VersionService) {
    super()
  }

  /**
   * 获取指定作品的版本列表
   */
  @Get('list')
  @Perms('list')
  @ApiOperation({ summary: '原型版本列表（按 workId）' })
  @ApiArrayResult(PrototypeVersionVo)
  async list(@Query() query: VersionListDto) {
    return this.ok(await this.versionService.getList(Number(query.workId)))
  }

  /**
   * 新增原型版本
   */
  @Post('add')
  @Perms('add')
  @ApiOperation({ summary: '新增原型版本' })
  @ApiResult(PrototypeVersionVo)
  async add(@Body() dto: AddVersionDto) {
    return this.ok(await this.versionService.addVersion(dto))
  }

  /**
   * 更新原型版本
   */
  @Put('update')
  @Perms('update')
  @ApiOperation({ summary: '更新原型版本' })
  @ApiResult(PrototypeVersionVo)
  async update(@Body() dto: UpdateVersionDto) {
    return this.ok(await this.versionService.updateVersion(dto))
  }

  /**
   * 删除原型版本（级联清除该版本下图片）
   */
  @Delete('delete/:id')
  @Perms('delete')
  @ApiOperation({ summary: '按 id 删除原型版本（级联清图片）' })
  @ApiParam({ name: 'id', description: '版本 ID', type: Number })
  @ApiOkVoid()
  async delete(@Param('id', ParseIntPipe) id: number) {
    await this.versionService.deleteVersion(id)
    return this.ok()
  }
}
