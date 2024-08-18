import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { ICreateUser, IQueryUser, IUpdateUser } from './interface';
import { UserService } from './user.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiBearerAuth()
@ApiTags('用户管理')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) { }

  @Get(':pageNum/:pageSize')
  findAll(@Param('pageNum') pageNum: number, @Param('pageSize') pageSize: number, @Query() query: IQueryUser) {
    return this.userService.findAll(pageNum, pageSize, query.username);
  }

  @Post('save')
  create(@Body() body: ICreateUser) {
    return this.userService.create(body);
  }

  @Put('update')
  update(@Body() body: IUpdateUser) {
    return this.userService.update(body);
  }

  @Post('doAssignRole')
  doAssignRole(@Body() body: { userId: number; roleIdList: number[] }) {
    return this.userService.doAssignRole(body.userId, body.roleIdList);
  }

  @Get('get/:id')
  toAssign(@Param('id') id: number) {
    return this.userService.toAssign(id);
  }

  @Delete('remove/:id')
  remove(@Param('id') id: number) {
    return this.userService.remove(id);
  }

  @Delete('batchRemove')
  batchRemove(@Body() body: number[]) {
    return this.userService.batchRemove(body);
  }
}
