import { Module } from '@nestjs/common';
import { TrademarkController } from './trademark.controller';
import { TrademarkService } from './trademark.service';

@Module({
  controllers: [TrademarkController],
  providers: [TrademarkService],
})
export class TrademarkModule {}
