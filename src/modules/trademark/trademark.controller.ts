import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { TrademarkDto,ITrademarkDto } from './trademark.dto';
import { TrademarkService } from './trademark.service';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';

@ApiBearerAuth()
@ApiTags('品牌管理')
@Controller('baseTrademark')
export class TrademarkController {
  constructor(private readonly trademarkService: TrademarkService) {}

  @ApiOperation({summary:'分页查询品牌列表'})
  @ApiParam({ name: 'pageNum', required: true, type: Number, description: '当前页数', example: 1 })
  @ApiParam({ name: 'pageSize', required: true, type: Number, description: '页面显示最大的数据量', example: 5 })
  @Get(':pageNum/:pageSize')
  findAll(@Param('pageNum') pageNum: number, @Param('pageSize') pageSize: number) {
    return this.trademarkService.findAll(pageNum, pageSize);
  }

  @ApiOperation({summary:'查询所有品牌列表'})
  @Get('getTrademarkList')
  findNameList() {
    return this.trademarkService.findNameList()
  }

  @ApiOperation({summary:'创建新的品牌'})
  @ApiBody({type: TrademarkDto})
  @Post('save')
  create(@Body() body: ITrademarkDto) {
    return this.trademarkService.create(body);
  }

  @ApiOperation({summary:'修改品牌'})
  @ApiBody({type: TrademarkDto})
  @Put('update')
  update(@Body() body: ITrademarkDto) {
    return this.trademarkService.update(body);
  }

  @ApiOperation({summary:'删除品牌（删除指定ID的品牌。同时删除与之关联的spu，以及spu和属性、属性值、图片和sku的关系）'})
  @Delete('remove/:id')
  remove(@Param('id') id: number) {
    return this.trademarkService.remove(id);
  }

}
