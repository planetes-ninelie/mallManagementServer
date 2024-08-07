import { Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Public } from '../auth/public.decorator';
import { UploadService } from './upload.service';

@Controller('fileUpload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Public()
  @Post('')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File): Promise<string> {
    return this.uploadService.uploadFile(file);
  }
}
