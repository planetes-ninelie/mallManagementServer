import {
  Controller,
  Delete,
  HttpException,
  HttpStatus,
  Param,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadService } from './upload.service';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { UploadEntity } from './upload.entity';

@ApiTags('上传头像')
@ApiBearerAuth()
@Controller('fileUpload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post(':type')
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
  @ApiParam({name:'type',required:true,type:Number,description:'表示图片类型：1为用户头像，2为品牌图标，3为Spu图标',example:1})
  uploadFile(@UploadedFile() file: Express.Multer.File,@Param('type') type:number): Promise<UploadEntity> {
    if (!type) {
      throw new HttpException('请携带参数type，1为用户头像，2为品牌图标，3为Spu图标', HttpStatus.OK);
    }
    return this.uploadService.uploadFile(file,type);
  }

  @ApiOperation({summary:'删除图片'})
  @ApiParam({name:'id',required:true,type:Number,description:'图片id',example:1})
  @Delete(':id')
  deleteFile(@Param('id') id: number) {
    return this.uploadService.deleteFile(id)
  }
}
