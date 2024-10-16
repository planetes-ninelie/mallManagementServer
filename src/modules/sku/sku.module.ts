import { Module } from '@nestjs/common';
import { SkuService } from './sku.service';
import { SkuController } from './sku.controller';

@Module({
  providers: [SkuService],
  controllers: [SkuController],
  exports: [SkuService]
})
export class SkuModule {}