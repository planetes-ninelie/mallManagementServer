import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { CreateRoleDto, ICreateRoleDto, IQueryRoleDto, IUpdateRoleDto, UpdateRoleDto } from './role.dto';
import { RoleService } from './role.service';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';

@ApiBearerAuth()
@ApiTags('角色管理')
@Controller('role')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @ApiOperation({summary:'查询角色列表'})
  @ApiParam({ name: 'pageNum', required: true, type: Number, description: '当前页数', example: 1 })
  @ApiParam({ name: 'pageSize', required: true, type: Number, description: '页面显示最大的数据量', example: 5 })
  @ApiQuery({ name: 'roleName', required: false, type: String, description: '用户名称(如果为空勾选"Send empty value")', allowEmptyValue: true})
  @Get(':pageNum/:pageSize')
  findAll(@Param('pageNum') pageNum: number, @Param('pageSize') pageSize: number, @Query() query: IQueryRoleDto) {
    return this.roleService.findAll(pageNum, pageSize, query.roleName);
  }

  @ApiOperation({summary:'创建新的角色'})
  @ApiBody({ type:CreateRoleDto })
  @Post('save')
  create(@Body() body: ICreateRoleDto) {
    return this.roleService.create(body);
  }

  @ApiOperation({summary:'修改角色'})
  @ApiBody({ type: UpdateRoleDto })
  @Put('update')
  update(@Body() body: IUpdateRoleDto) {
    return this.roleService.update(body);
  }

  @ApiOperation({summary:'根据id删除角色'})
  @Delete('remove/:id')
  remove(@Param('id') id: number) {
    return this.roleService.remove(id);
  }

  @ApiOperation({summary:'根据id数组删除多个角色'})
  @ApiBody({ type: [Number] })
  @Delete('batchRemove')
  batchRemove(@Body() body: number[]) {
    return this.roleService.batchRemove(body);
  }
}
