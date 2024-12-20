import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CategoryLevel } from './enum';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateCategoryDto, ICreateCategoryDto, IUpdateCategoryDto, UpdateCategoryDto } from './category.dto';

@ApiBearerAuth()
@ApiTags('分类管理')
@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @ApiOperation({summary:'查询一级分类'})
  @Get('getCategory1')
  getCategory1() {
    return this.categoryService.getCategory(CategoryLevel.FIRST);
  }

  @ApiOperation({summary:'根据一级id查询二级分类'})
  @Get('getCategory2/:id')
  getCategory2(@Param('id') id: number) {
    return this.categoryService.getCategory(CategoryLevel.SECOND, id);
  }

  @ApiOperation({summary:'根据二级id查询三级分类'})
  @Get('getCategory3/:id')
  getCategory3(@Param('id') id: number) {
    return this.categoryService.getCategory(CategoryLevel.THIRD, id);
  }

  @ApiOperation({summary:'创建分类'})
  @ApiBody({type:CreateCategoryDto})
  @Post('create')
  createCategory(@Body() body: ICreateCategoryDto) {
    return this.categoryService.createCategory(body);
  }

  @ApiOperation({summary:'修改分类名称'})
  @ApiBody({type: UpdateCategoryDto})
  @Put('update')
  updateCategory(@Body() body: IUpdateCategoryDto) {
    return this.categoryService.updateCategory(body)
  }

  @ApiOperation({summary:'根据id删除分类以及子分类'})
  @Delete('delete/:id')
  deleteCategory(@Param('id') id: number) {
    return this.categoryService.deleteCategory(id)
  }

  @ApiOperation({summary:'根据等级查询分类'})
  @Get('getCategoryByLevel/:level')
  getCategoryByLevel(@Param('level') level: number) {
    return this.categoryService.getCategoryByLevel(level);
  }
}