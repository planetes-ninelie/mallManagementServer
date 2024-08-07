import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { TrademarkDto } from './dto';
import { TrademarkService } from './trademark.service';

@Controller('baseTrademark')
export class TrademarkController {
  constructor(private readonly trademarkService: TrademarkService) {}

  @Get(':pageNum/:pageSize')
  findAll(@Param('pageNum') pageNum: number, @Param('pageSize') pageSize: number) {
    return this.trademarkService.findAll(pageNum, pageSize);
  }

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

  @Get('getTrademarkList')
  getTrademarkList() {
    return this.trademarkService.getTrademarkList();
  }
}
