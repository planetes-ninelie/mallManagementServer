import { Module } from '@nestjs/common';
import { TrademarkController } from './trademark.controller';
import { TrademarkService } from './trademark.service';
import { FileModule } from '../file/file.module';
import { SpuModule } from '../spu/spu.module';

@Module({
  controllers: [TrademarkController],
  providers: [TrademarkService],
  imports:[FileModule,SpuModule]
})
export class TrademarkModule {}
