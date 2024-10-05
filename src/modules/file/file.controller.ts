import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Post
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody,ApiOperation, ApiTags } from '@nestjs/swagger';
import { IUpdateTidDto, updateTidDto } from './file.dto';
import { FileService } from './file.service';


@ApiTags('图片管理')
@ApiBearerAuth()
@Controller('file')
export class FileController {
  constructor(private readonly fileService: FileService) {}

  @ApiOperation({summary:'新增图片关系表'})
  @ApiBody({type:updateTidDto})
  @Post('addImageRelation')
  addImageRelation(@Body() body:IUpdateTidDto){
    if (!body.type) {
      throw new HttpException('请携带参数type，1为用户头像，2为品牌图标，3为Spu图标，4为sku图标', HttpStatus.OK);
    }
    return this.fileService.addImageRelation(body)
  }
}