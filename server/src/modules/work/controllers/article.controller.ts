import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, Query } from '@nestjs/common'
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger'
import { BaseController } from '@/common/crud'
import { ApiArrayResult, ApiResult, ApiOkVoid, Perms } from '@/common/decorators'
import { ArticleService } from '../services/article.service'
import { AddArticleDto, UpdateArticleDto, ArticleListDto, ArticleIdDto } from '../dto/article.dto'
import { BreakdownArticleVo } from '../vo/work.vo'

/**
 * 拆解文章控制器
 * 提供指定作品下拆解文章的列表、新增、编辑、删除、发布/下架接口，需登录鉴权。
 * 权限点前缀 work:article。
 */
@ApiTags('拆解文章')
@Controller('admin/work/article')
export class ArticleController extends BaseController {
  constructor(private readonly articleService: ArticleService) {
    super()
  }

  /**
   * 获取指定作品的拆解文章列表
   */
  @Get('list')
  @Perms('list')
  @ApiOperation({ summary: '拆解文章列表（按 workId）' })
  @ApiArrayResult(BreakdownArticleVo)
  async list(@Query() query: ArticleListDto) {
    return this.ok(await this.articleService.getList(Number(query.workId)))
  }

  /**
   * 新增拆解文章
   */
  @Post('add')
  @Perms('add')
  @ApiOperation({ summary: '新增拆解文章' })
  @ApiResult(BreakdownArticleVo)
  async add(@Body() dto: AddArticleDto) {
    return this.ok(await this.articleService.addArticle(dto))
  }

  /**
   * 更新拆解文章
   */
  @Put('update')
  @Perms('update')
  @ApiOperation({ summary: '更新拆解文章' })
  @ApiResult(BreakdownArticleVo)
  async update(@Body() dto: UpdateArticleDto) {
    return this.ok(await this.articleService.updateArticle(dto))
  }

  /**
   * 删除拆解文章
   */
  @Delete('delete/:id')
  @Perms('delete')
  @ApiOperation({ summary: '按 id 删除拆解文章' })
  @ApiParam({ name: 'id', description: '文章 ID', type: Number })
  @ApiOkVoid()
  async delete(@Param('id', ParseIntPipe) id: number) {
    await this.articleService.deleteArticle(id)
    return this.ok()
  }

  /**
   * 发布 / 下架（按当前状态切换）
   */
  @Put('toggle-status')
  @Perms('toggle-status')
  @ApiOperation({ summary: '拆解文章发布/下架（按当前状态切换）' })
  @ApiResult(BreakdownArticleVo)
  async toggleStatus(@Body() dto: ArticleIdDto) {
    return this.ok(await this.articleService.toggleStatus(dto.id))
  }
}
