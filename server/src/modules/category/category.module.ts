import { Module } from '@nestjs/common';
import { CategoryController } from './controllers/category.controller';
import { CategoryService } from './services/category.service';

/**
 * 分类管理模块
 * 聚合分类管理的控制器与服务，并导出 CategoryService 供作品模块（B05）注入做删除保护与归属校验。
 */
@Module({
  controllers: [CategoryController],
  providers: [CategoryService],
  exports: [CategoryService],
})
export class CategoryModule {}
