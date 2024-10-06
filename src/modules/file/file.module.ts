import { Module } from '@nestjs/common';
import { FileController } from './file.controller';
import { FileService } from './file.service';
import { UploadModule } from '../upload/upload.module';

@Module({
  controllers: [FileController],
  providers: [FileService],
  exports: [FileService],
  imports:[UploadModule]
})
export class FileModule {}