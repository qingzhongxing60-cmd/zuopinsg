import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, Query } from '@nestjs/common'
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger'
import { BaseController } from '@/common/crud'
import { ApiArrayResult, ApiResult, ApiOkVoid, Perms } from '@/common/decorators'
import { ImageService } from '../services/image.service'
import { AddImagesDto, UpdateImageDto, ImageListDto } from '../dto/image.dto'
import { PrototypeImageVo } from '../vo/work.vo'

/**
 * 原型图片控制器
 * 提供指定版本下图片的列表、批量新增、更新说明/排序、删除接口，需登录鉴权。
 * 权限点前缀 work:image。
 */
@ApiTags('原型图片')
@Controller('admin/work/image')
export class ImageController extends BaseController {
  constructor(private readonly imageService: ImageService) {
    super()
  }

  /**
   * 获取指定版本的图片列表
   */
  @Get('list')
  @Perms('list')
  @ApiOperation({ summary: '原型图片列表（按 versionId）' })
  @ApiArrayResult(PrototypeImageVo)
  async list(@Query() query: ImageListDto) {
    return this.ok(await this.imageService.getList(Number(query.versionId)))
  }

  /**
   * 批量新增原型图片
   */
  @Post('add')
  @Perms('add')
  @ApiOperation({ summary: '批量新增原型图片' })
  @ApiArrayResult(PrototypeImageVo)
  async add(@Body() dto: AddImagesDto) {
    return this.ok(await this.imageService.addImages(dto))
  }

  /**
   * 更新图片说明与排序
   */
  @Put('update')
  @Perms('update')
  @ApiOperation({ summary: '更新原型图片说明与排序' })
  @ApiResult(PrototypeImageVo)
  async update(@Body() dto: UpdateImageDto) {
    return this.ok(await this.imageService.updateImage(dto))
  }

  /**
   * 删除原型图片
   */
  @Delete('delete/:id')
  @Perms('delete')
  @ApiOperation({ summary: '按 id 删除原型图片' })
  @ApiParam({ name: 'id', description: '图片 ID', type: Number })
  @ApiOkVoid()
  async delete(@Param('id', ParseIntPipe) id: number) {
    await this.imageService.deleteImage(id)
    return this.ok()
  }
}
