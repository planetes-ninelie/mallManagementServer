import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { AttrService } from './attr.service';
import { CreateOrUpdateAttr, ICreateOrUpdateAttr } from './attr.dto';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('属性管理')
@ApiBearerAuth()
@Controller('')
export class AttrController {
  constructor(private readonly attrService: AttrService) {}

  @ApiOperation({summary:'根据三级id查平台属性'})
  @Get('attrInfoList/:categoryFirstId/:categorySecondId/:categoryThirdId')
  attrInfoList(@Param('categoryFirstId') categoryFirstId: number, @Param('categorySecondId') categorySecondId: number, @Param('categoryThirdId') categoryThirdId: number) {
    return this.attrService.attrInfoList(categoryFirstId, categorySecondId, categoryThirdId);
  }

  @ApiOperation({summary:'获取所有spu销售属性，与baseSaleAttrList相同'})
  @Get('saleAttrInfoList')
  saleAttrInfoList() {
    return this.attrService.saleAttrInfoList();
  }

  @ApiBody({type:CreateOrUpdateAttr})
  @ApiOperation({summary:'新增或修改平台属性'})
  @Post('saveAttrInfo')
  saveAttrInfo(@Body() body: ICreateOrUpdateAttr) {
    return this.attrService.saveAttrInfo(body,1)
  }

  @ApiBody({type:CreateOrUpdateAttr})
  @ApiOperation({summary:'新增或修改销售属性'})
  @Post('saveSaleAttrInfo')
  saveSaleAttrInfo(@Body() body: ICreateOrUpdateAttr) {
    return this.attrService.saveAttrInfo(body,2)
  }

  @ApiOperation({summary:'删除属性'})
  @Delete('deleteAttr/:id')
  deleteAttr(@Param('id') id: number) {
    return this.attrService.deleteAttr(id);
  }
}