import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { ICreateRole, IQueryRole, IUpdateRole } from './interface';
import { RoleService } from './role.service';

@Controller('role')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Get(':pageNum/:pageSize')
  findAll(@Param('pageNum') pageNum: number, @Param('pageSize') pageSize: number, @Query() query: IQueryRole) {
    return this.roleService.findAll(pageNum, pageSize, query.roleName);
  }

  @Post('save')
  create(@Body() body: ICreateRole) {
    return this.roleService.create(body);
  }

  @Put('update')
  update(@Body() body: IUpdateRole) {
    return this.roleService.update(body);
  }

  @Delete('remove/:id')
  remove(@Param('id') id: number) {
    return this.roleService.remove(id);
  }

  @Delete('batchRemove')
  batchRemove(@Body() body: Record<string, number[]>) {
    const { data: ids } = body;
    return this.roleService.batchRemove(ids);
  }
}
