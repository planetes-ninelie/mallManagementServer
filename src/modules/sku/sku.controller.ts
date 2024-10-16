import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { SkuService } from './sku.service';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ISkuInfo,SkuInfo } from './sku.dto';

@ApiBearerAuth()
@ApiTags('sku')
@Controller('sku')
export class SkuController {
  constructor(private readonly skuService: SkuService) {}

  @ApiOperation({summary:'分页查询sku'})
  @Get('list/:pageNum/:pageSize')
  findSkuList(@Param('pageNum') pageNum: number, @Param('pageSize') pageSize: number) {
    return this.skuService.findSkuList(pageNum, pageSize);
  }

  @ApiOperation({summary:'新增sku'})
  @ApiBody({type:SkuInfo})
  @Post('saveSkuInfo')
  saveSkuInfo(@Body() skuInfo: ISkuInfo) {
    return this.skuService.saveSkuInfo(skuInfo);
  }

  @ApiOperation({summary:'获取sku详情'})
  @Get('getSkuInfo/:skuId')
  getSkuInfo(@Param('skuId') skuId: number) {
    return this.skuService.getSkuInfo(skuId);
  }

  @ApiOperation({summary:'上架sku'})
  @Get('onSale/:skuId')
  onSale(@Param('skuId') skuId: number) {
    return this.skuService.isSale(skuId,1);
  }

  @ApiOperation({summary:'下架sku'})
  @Get('cancelSale/:skuId')
  cancelSale(@Param('skuId') skuId: number) {
    return this.skuService.isSale(skuId,0);
  }

  @ApiOperation({summary:'删除sku'})
  @Delete('deleteSku/:skuId')
  deleteSku(@Param('skuId') skuId: number) {
    return this.skuService.deleteSku(skuId);
  }
}