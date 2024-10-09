import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { AttrService } from './attr.service';
import { CreateOrUpdateAttr, ICreateOrUpdateAttr } from './attr.dto';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('属性管理')
@ApiBearerAuth()
@Controller('')
export class AttrController {
  constructor(private readonly attrService: AttrService) {}

  @Get('attrInfoList/:categoryFirstId/:categorySecondId/:categoryThirdId')
  attrInfoList(@Param('categoryFirstId') categoryFirstId: number, @Param('categorySecondId') categorySecondId: number, @Param('categoryThirdId') categoryThirdId: number) {
    return this.attrService.attrInfoList(categoryFirstId, categorySecondId, categoryThirdId);
  }

  @ApiBody({type:CreateOrUpdateAttr})
  @ApiOperation({summary:'新增或修改属性'})
  @Post('saveAttrInfo')
  saveAttrInfo(@Body() body: ICreateOrUpdateAttr) {
    return this.attrService.saveAttrInfo(body);
  }

  // 删除属性
  @Delete('deleteAttr/:id')
  deleteAttr(@Param('id') id: number) {
    return this.attrService.deleteAttr(id);
  }
}