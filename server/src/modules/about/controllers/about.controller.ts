import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put } from '@nestjs/common'
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger'
import { BaseController } from '@/common/crud'
import { ApiArrayResult, ApiResult, ApiOkVoid, Perms } from '@/common/decorators'
import { AboutService } from '../services/about.service'
import { UpdateAboutProfileDto, AddSkillDto, UpdateSkillDto } from '../dto/about.dto'
import { AboutProfileVo, SkillVo } from '../vo/about.vo'

/**
 * 关于我管理控制器
 * 提供个人介绍（单条覆盖写入）与技能（多条 CRUD）的管理接口，均为管理后台（admin）端，需登录鉴权。
 * 个人介绍读取仅需登录、无独立权限点（后台编辑页数据回显）；写操作与技能操作声明权限点。
 */
@ApiTags('关于我管理')
@Controller('admin/about')
export class AboutController extends BaseController {
  constructor(private readonly aboutService: AboutService) {
    super()
  }

  /**
   * 获取个人介绍
   * 仅需登录；无记录时返回空结构。
   */
  @Get('profile')
  @ApiOperation({ summary: '获取个人介绍（单条全局记录）' })
  @ApiResult(AboutProfileVo)
  async getProfile() {
    return this.ok(await this.aboutService.getProfile())
  }

  /**
   * 更新个人介绍（覆盖写入）
   */
  @Put('profile')
  @Perms('profile-update')
  @ApiOperation({ summary: '更新个人介绍（覆盖写入）' })
  @ApiResult(AboutProfileVo)
  async updateProfile(@Body() dto: UpdateAboutProfileDto) {
    return this.ok(await this.aboutService.upsertProfile(dto))
  }

  /**
   * 获取技能列表
   * 不分页，按排序值升序（相同按录入时间升序）返回。
   */
  @Get('skill/list')
  @Perms('skill-list')
  @ApiOperation({ summary: '技能列表（不分页，按排序值升序）' })
  @ApiArrayResult(SkillVo)
  async skillList() {
    return this.ok(await this.aboutService.getSkillList())
  }

  /**
   * 新增技能
   */
  @Post('skill/add')
  @Perms('skill-add')
  @ApiOperation({ summary: '新增技能' })
  @ApiResult(SkillVo)
  async addSkill(@Body() dto: AddSkillDto) {
    return this.ok(await this.aboutService.addSkill(dto))
  }

  /**
   * 更新技能
   * 通过 id 定位，仅更新传入字段。
   */
  @Put('skill/update')
  @Perms('skill-update')
  @ApiOperation({ summary: '更新技能' })
  @ApiResult(SkillVo)
  async updateSkill(@Body() dto: UpdateSkillDto) {
    return this.ok(await this.aboutService.updateSkill(dto))
  }

  /**
   * 删除技能
   */
  @Delete('skill/delete/:id')
  @Perms('skill-delete')
  @ApiOperation({ summary: '按 id 删除技能' })
  @ApiParam({ name: 'id', description: '技能 ID', type: Number })
  @ApiOkVoid()
  async deleteSkill(@Param('id', ParseIntPipe) id: number) {
    await this.aboutService.deleteSkill(id)
    return this.ok()
  }
}
