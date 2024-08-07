import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { ICreateAndUpdateMenu } from './interface';
import { MenuService } from './menu.service';

@Controller('permission')
export class MenuController {
  constructor(private readonly menuService: MenuService) { }

  @Get('')
  findAll() {
    return this.menuService.findAll();
  }

  @Get('toAssign/:id')
  toAssign(@Param('id') id: number) {
    return this.menuService.toAssign(id);
  }

  @Post('doAssignAcl')
  doAssign(@Query() query: { roleId: string; permissionId: string }) {
    return this.menuService.doAssign(query.roleId, query.permissionId);
  }

  // @Post('save')
  // create(@Body() body: ICreateAndUpdateMenu) {
  //   return this.menuService.create(body);
  // }

  @Delete('remove/:id')
  remove(@Param('id') id: number) {
    return this.menuService.remove(id);
  }

  @Put('update')
  update(@Body() body: ICreateAndUpdateMenu) {
    return this.menuService.update(body);
  }
}
