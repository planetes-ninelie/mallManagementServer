import { Module } from '@nestjs/common';
import { SpuService } from './spu.service';
import { SpuController } from './spu.controller';
import { AttrModule } from '../attr/attr.module';
import { FileModule } from '../file/file.module';
import { SkuModule } from '../sku/sku.module';

@Module({
  providers: [SpuService],
  controllers: [SpuController],
  exports: [SpuService],
  imports: [AttrModule,FileModule,SkuModule]
})
export class SpuModule {

}