import { Body, Controller, Delete, Get, Param, Post, Query } from '@nestjs/common';
import { SkuInfo, SpuInfo } from './interface';
import { ProductService } from './product.service';

@Controller('')
export class ProductController {
  constructor(private readonly productService: ProductService) { }
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
