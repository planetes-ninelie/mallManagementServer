import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { MenuService } from './menu.service';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateMenuDto, doAssignDto, ICreateMenuDto, IDoAssignDto, IUpdateMenuDto, UpdateMenuDto } from './menu.dto';

@ApiBearerAuth()
@ApiTags('菜单管理')
@Controller('permission')
export class MenuController {
  constructor(private readonly menuService: MenuService) { }

  @ApiOperation({summary:'查询菜单列表'})
  @Get('')
  findAll() {
    return this.menuService.findAll();
  }

  @ApiOperation({summary:'根据角色id查询菜单权限列表'})
  @Get('toAssign/:id')
  toAssign(@Param('id') id: number) {
    return this.menuService.toAssign(id);
  }

  @ApiOperation({summary:'根据角色id分配菜单权限'})
  @ApiBody({ type: doAssignDto })
  @Post('doAssignAcl')
  doAssign(@Body() body: IDoAssignDto) {
    return this.menuService.doAssign(body.roleId, body.permissionIdList);
  }

  @ApiOperation({summary:'创建新菜单或权限'})
  @ApiBody({ type:CreateMenuDto })
  @Post('save')
  create(@Body() body: ICreateMenuDto) {
    if (body.type === undefined) {
      body.type = 1
    }
    return this.menuService.create(body);
  }

  @ApiOperation({summary:'删除新菜单或权限'})
  @Delete('remove/:id')
  remove(@Param('id') id: number) {
    return this.menuService.remove(id);
  }

  @ApiOperation({summary:'更新菜单或权限'})
  @ApiBody({ type:UpdateMenuDto })
  @Put('update')
  update(@Body() body: IUpdateMenuDto) {
    return this.menuService.update(body);
  }
}
