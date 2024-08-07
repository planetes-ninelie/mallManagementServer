import { Body, Controller, Delete, Get, Param, Post, Query } from '@nestjs/common';
import { CategoryLevel } from './enum';
import { ICreateCategory, ICreateOrUpdateAttr, SkuInfo, SpuInfo } from './interface';
import { ProductService } from './product.service';

@Controller('')
export class ProductController {
  constructor(private readonly productService: ProductService) { }

  /* 分类相关接口 */
  // 获取一级分类
  @Get('getCategory1')
  getCategory1() {
    return this.productService.getCategory(CategoryLevel.FIRST);
  }

  // 获取2级分类
  @Get('getCategory2/:id')
  getCategory2(@Param('id') id: number) {
    return this.productService.getCategory(CategoryLevel.SECOND, id);
  }

  // 获取3级分类
  @Get('getCategory3/:id')
  getCategory3(@Param('id') id: number) {
    return this.productService.getCategory(CategoryLevel.THIRD, id);
  }

  // 创建分类，用于postman测试
  @Post('category')
  createCategory(@Body() body: ICreateCategory) {
    return this.productService.createCategory(body);
  }

  /* 平台属性相关接口！！！！！！！！！！！！！！！！！！！ */
  // 属性列表
  @Get('attrInfoList/:categoryFirstId/:categorySecondId/:categoryThirdId')
  attrInfoList(@Param('categoryFirstId') categoryFirstId: number, @Param('categorySecondId') categorySecondId: number, @Param('categoryThirdId') categoryThirdId: number) {
    return this.productService.attrInfoList(categoryFirstId, categorySecondId, categoryThirdId);
  }

  // 创建或更新属性
  @Post('saveAttrInfo')
  saveAttrInfo(@Body() body: ICreateOrUpdateAttr) {
    return this.productService.saveAttrInfo(body);
  }

  // 删除属性
  @Delete('deleteAttr/:id')
  deleteAttr(@Param('id') id: number) {
    return this.productService.deleteAttr(id);
  }

  /* spu相关接口！！！！！！！！！！！！！！！！！！！！！！！！！！！！！ */


  // 查找spu图片列表
  @Get('spuImageList/:id')
  spuImageList(@Param('id') id: number) {
    return this.productService.spuImageList(id);
  }

  // 查询spu属性列表
  @Get('spuSaleAttrList/:id')
  spuSaleAttrList(@Param('id') id: number) {
    return this.productService.spuSaleAttrList(id);
  }

  // 获取基础spu属性
  @Get('/baseSaleAttrList')
  baseSaleAttrList() {
    return this.productService.baseSaleAttrList();
  }

  // 新增spu
  @Post('/saveSpuInfo')
  saveSpuInfo(@Body() spuInfo: SpuInfo) {
    return this.productService.saveSpuInfo(spuInfo);
  }

  // 编辑spu
  @Post('updateSpuInfo')
  updateSpuInfo(@Body() spuInfo: SpuInfo) {
    return this.productService.updateSpuInfo(spuInfo);
  }

  // 查找spu下的sku列表
  @Get('findBySpuId/:id')
  findBySpuId(@Param('id') id: number) {
    return this.productService.findBySpuId(id);
  }

  // 删除spu
  @Delete('deleteSpu/:id')
  deleteSpu(@Param('id') id: number) {
    return this.productService.deleteSpu(id);
  }

  /* sku相关接口！！！！！！！！！！！！！！！！！！！！ */
  // 获取sku列表
  @Get('list/:pageNum/:pageSize')
  findSkuList(@Param('pageNum') pageNum: number, @Param('pageSize') pageSize: number) {
    return this.productService.findSkuList(pageNum, pageSize);
  }

  // 新增sku
  @Post('saveSkuInfo')
  saveSkuInfo(@Body() skuInfo: SkuInfo) {
    return this.productService.saveSkuInfo(skuInfo);
  }

  // 获取sku详情
  @Get('getSkuInfo/:skuId')
  getSkuInfo(@Param('skuId') skuId: number) {
    return this.productService.getSkuInfo(skuId);
  }

  // 上架sku
  @Get('onSale/:skuId')
  onSale(@Param('skuId') skuId: number) {
    return this.productService.onSale(skuId);
  }

  // 下架sku
  @Get('cancelSale/:skuId')
  cancelSale(@Param('skuId') skuId: number) {
    return this.productService.cancelSale(skuId);
  }

  // 删除sku
  @Delete('deleteSku/:skuId')
  deleteSku(@Param('skuId') skuId: number) {
    return this.productService.deleteSku(skuId);
  }

  //获取spu列表，要放最后！！！!!!！
  @Get(':pageNum/:pageSize')
  findAll(@Param('pageNum') pageNum: number, @Param('pageSize') pageSize: number, @Query('category3Id') category3Id: number) {
    return this.productService.findSpuAll(pageNum, pageSize, category3Id);
  }
}
