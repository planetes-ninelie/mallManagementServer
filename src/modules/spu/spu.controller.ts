import { Body, Controller, Delete, Get, Param, Post, Query } from '@nestjs/common';
import { SpuService } from './spu.service';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { CreateSpuDTO, ICreateSpuDTO } from './spu.dto';
import { AttrService } from '../attr/attr.service';

@ApiBearerAuth()
@ApiTags('spu管理')
@Controller('spu')
export class SpuController {
  constructor(private readonly spuService: SpuService,private readonly attrService: AttrService) {}

  @ApiOperation({summary:'查看sku图片列表'})
  @Get('spuImageList/:id')
  spuImageList(@Param('id') id: number) {
    return this.spuService.spuImageList(id);
  }

  @ApiOperation({summary:'查询spu销售属性列表'})
  @Get('spuSaleAttrList/:id')
  spuSaleAttrList(@Param('id') id: number) {
    return this.spuService.spuSaleAttrList(id);
  }

  @ApiOperation({summary:'获取所有spu销售属性'})
  @Get('baseSaleAttrList')
  baseSaleAttrList() {
    return this.attrService.saleAttrInfoList();
  }

  @ApiOperation({summary:'新增spu'})
  @ApiBody({type:CreateSpuDTO})
  @Post('/saveSpuInfo')
  saveSpuInfo(@Body() createSpuDTO: ICreateSpuDTO) {
    return this.spuService.saveSpuInfo(createSpuDTO);
  }

  // 编辑spu
  @Post('updateSpuInfo')
  updateSpuInfo(@Body() spuInfo: SpuInfo) {
    return this.spuService.updateSpuInfo(spuInfo);
  }

  @ApiOperation({summary:'查找spu下的sku列表'})
  @Get('findBySpuId/:id')
  findBySpuId(@Param('id') id: number) {
    return this.spuService.findBySpuId(id);
  }

  @ApiOperation({summary:'根据spu的id删除spu'})
  @Delete('deleteSpu/:id')
  deleteSpu(@Param('id') id: number) {
    return this.spuService.deleteSpu(id);
  }

  @ApiOperation({summary:'根据三级分类id分页查询spu'})
  @ApiParam({ name: 'pageNum', required: true, type: Number, description: '当前页数', example: 1 })
  @ApiParam({ name: 'pageSize', required: true, type: Number, description: '页面显示最大的数据量', example: 5 })
  @Get(':pageNum/:pageSize')
  findAll(@Param('pageNum') pageNum: number, @Param('pageSize') pageSize: number, @Query('category3Id') category3Id: number) {
    return this.spuService.findSpuAll(pageNum, pageSize, category3Id);
  }
}