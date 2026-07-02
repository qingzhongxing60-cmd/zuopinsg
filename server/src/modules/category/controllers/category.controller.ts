import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { BaseController } from '@/common/crud';
import { ApiArrayResult, ApiResult, ApiOkVoid, Perms } from '@/common/decorators';
import { CategoryService } from '../services/category.service';
import { AddCategoryDto, CategoryListDto, UpdateCategoryDto } from '../dto/category.dto';
import { CategoryVo } from '../vo/category.vo';

/**
 * 分类管理控制器
 * 提供作品分类的列表查询、新增、编辑、删除接口，均为管理后台（admin）端，需登录鉴权。
 * 列表不分页、按排序值升序返回数组，支持按名称模糊搜索；新增/编辑校验名称与唯一标识全局唯一。
 */
@ApiTags('分类管理')
@Controller('admin/category')
export class CategoryController extends BaseController {
  constructor(private readonly categoryService: CategoryService) {
    super();
  }

  /**
   * 查询分类列表
   * 不分页，按排序值升序（相同按创建时间升序）返回，支持按名称模糊搜索。
   */
  @Get('list')
  @Perms('list')
  @ApiOperation({ summary: '分类列表（不分页，按排序值升序，支持名称模糊搜索）' })
  @ApiArrayResult(CategoryVo)
  async list(@Query() query: CategoryListDto) {
    return this.ok(await this.categoryService.getList(query.name));
  }

  /**
   * 新增分类
   * 名称与唯一标识全局唯一，唯一标识需符合 slug 格式。
   */
  @Post('add')
  @Perms('add')
  @ApiOperation({ summary: '新增分类' })
  @ApiResult(CategoryVo)
  async add(@Body() dto: AddCategoryDto) {
    return this.ok(await this.categoryService.addCategory(dto));
  }

  /**
   * 更新分类
   * 通过 id 定位，仅更新传入字段；名称/唯一标识冲突时返回对应提示。
   */
  @Put('update')
  @Perms('update')
  @ApiOperation({ summary: '更新分类' })
  @ApiResult(CategoryVo)
  async update(@Body() dto: UpdateCategoryDto) {
    return this.ok(await this.categoryService.updateCategory(dto));
  }

  /**
   * 删除分类
   * 受删除保护约束：分类下存在关联作品时禁止删除（依赖 Work 表，当前阶段不拦截）。
   */
  @Delete('delete/:id')
  @Perms('delete')
  @ApiOperation({ summary: '按 id 删除分类' })
  @ApiParam({ name: 'id', description: '分类 ID', type: Number })
  @ApiOkVoid()
  async delete(@Param('id', ParseIntPipe) id: number) {
    await this.categoryService.deleteCategory(id);
    return this.ok();
  }
}
