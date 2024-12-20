import { Module } from '@nestjs/common';
import { AttrController } from './attr.controller';
import { AttrService } from './attr.service';
import { CategoryModule } from '../category/category.module';

@Module({
  controllers: [AttrController],
  providers: [AttrService],
  exports: [AttrService],
  imports:[CategoryModule]
})
export class AttrModule {}