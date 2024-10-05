import { Module } from '@nestjs/common';
import { TrademarkController } from './trademark.controller';
import { TrademarkService } from './trademark.service';
import { FileModule } from '../file/file.module';

@Module({
  controllers: [TrademarkController],
  providers: [TrademarkService],
  imports:[FileModule]
})
export class TrademarkModule {}
