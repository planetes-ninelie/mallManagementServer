import {
  Body,
  Controller,
  Delete,
  Param,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadService } from './upload.service';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { UploadDto } from './upload.dto';

@ApiTags('上传文件')
@ApiBearerAuth()
@Controller('fileUpload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('')
  @ApiOperation({summary:'上传图片'})
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
      required: ['file'],
    },
  })
  uploadFile(@UploadedFile() file: Express.Multer.File): Promise<string> {
    return this.uploadService.uploadFile(file);
  }

  @ApiOperation({summary:'根据id删除图片'})
  @ApiParam({name:'id',required:true,type:Number,description:'图片id',example:1})
  @Delete('/delete/:id')
  deleteFile(@Param('id') id: number) {
    return this.uploadService.deleteFile("",id)
  }

  @ApiOperation({summary:'根据url删除图片'})
  @ApiBody({type: UploadDto})
  @Post('/delete')
  deleteFileByUrl(@Body('url') url: string) {
    return this.uploadService.deleteFile(url)
  }
}
