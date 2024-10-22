import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import {
  CreateUserDto,
  ICreateUserDto,
  IQueryUserDto,
  IToAssignRoleDto, IUpdateAvatarDto,
  IUpdateUserDto,
  ToAssignRoleDto, UpdateAvatarDto,
  UpdateUserDto,
} from './user.dto';
import { UserService } from './user.service';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';

@ApiBearerAuth()
@ApiTags('用户管理')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) { }

  @ApiOperation({summary:'查询用户列表'})
  @ApiParam({ name: 'pageNum', required: true, type: Number, description: '当前页数', example: 1 })
  @ApiParam({ name: 'pageSize', required: true, type: Number, description: '页面显示最大的数据量', example: 5 })
  @ApiQuery({ name: 'username', required: false, type: String, description: '用户昵称(如果为空勾选"Send empty value")', allowEmptyValue: true})
  @ApiQuery({ name: 'name', required: false, type: String, description: '用户姓名(如果为空勾选"Send empty value")', allowEmptyValue: true})
  @Get(':pageNum/:pageSize')
  findAll(@Param('pageNum') pageNum: number, @Param('pageSize') pageSize: number, @Query() query: IQueryUserDto) {
    return this.userService.findAll(pageNum, pageSize, query.username, query.name);
  }

  @ApiOperation({summary:'创建新的用户'})
  @ApiBody({ type: CreateUserDto })
  @Post('save')
  create(@Body() body: ICreateUserDto) {
    return this.userService.create(body);
  }

  @ApiOperation({summary:'修改用户'})
  @ApiBody({ type: UpdateUserDto })
  @Put('update')
  update(@Body() body: IUpdateUserDto) {
    return this.userService.update(body);
  }

  @ApiOperation({summary:'给用户分配角色'})
  @ApiBody({ type: ToAssignRoleDto })
  @Post('doAssignRole')
  doAssignRole(@Body() body: IToAssignRoleDto) {
    return this.userService.doAssignRole(body.userId, body.roleIdList);
  }

  // 用不上暂时不写
  // @Get('get/:id')
  // toAssign(@Param('id') id: number) {
  //   return this.userService.toAssign(id);
  // }

  @ApiOperation({summary:'根据id删除用户'})
  @Delete('remove/:id')
  remove(@Param('id') id: number) {
    return this.userService.remove(id);
  }

  @ApiOperation({summary:'根据id数组删除多个用户'})
  @ApiBody({ type: [Number] })
  @Delete('batchRemove')
  batchRemove(@Body() body: number[]) {
    return this.userService.batchRemove(body);
  }

  @ApiOperation({summary:"修改用户的头像"})
  @ApiBody({ type: UpdateAvatarDto })
  @Put('updateAvatar')
  updateAvatar(@Body() body: IUpdateAvatarDto) {
    return this.userService.updateAvatar(body)
  }
}
