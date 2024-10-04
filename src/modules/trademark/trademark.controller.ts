import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { TrademarkDto } from './dto';
import { TrademarkService } from './trademark.service';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';

@ApiBearerAuth()
@ApiTags('品牌管理')
@Controller('baseTrademark')
export class TrademarkController {
  constructor(private readonly trademarkService: TrademarkService) {}

  @ApiOperation({summary:'查询品牌列表'})
  @ApiParam({ name: 'pageNum', required: true, type: Number, description: '当前页数', example: 1 })
  @ApiParam({ name: 'pageSize', required: true, type: Number, description: '页面显示最大的数据量', example: 5 })
  @Get(':pageNum/:pageSize')
  findAll(@Param('pageNum') pageNum: number, @Param('pageSize') pageSize: number) {
    return this.trademarkService.findAll(pageNum, pageSize);
  }

  @ApiOperation({summary:'创建新的品牌'})
  @Post('save')
  create(@Body() body: TrademarkDto) {
    return this.trademarkService.create(body);
  }

  @Put('update')
  update(@Body() body: TrademarkDto) {
    return this.trademarkService.update(body);
  }

  @Delete('remove/:id')
  remove(@Param('id') id: number) {
    return this.trademarkService.remove(id);
  }

  // @Get('getTrademarkList')
  // getTrademarkList() {
  //   return this.trademarkService.getTrademarkList();
  // }
}
