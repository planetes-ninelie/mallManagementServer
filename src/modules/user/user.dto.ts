import { ApiProperty } from '@nestjs/swagger';

export class QueryUserDto {
  @ApiProperty({ type: String, description: '用户昵称', default: '', required: false })
  username?: string;
  @ApiProperty({ type: String, description: '用户姓名', default: '', required: false })
  name?: string;
}

export class CreateUserDto {
  @ApiProperty({ type: String, description: '用户昵称',default: 'example', required: true })
  username: string;
  @ApiProperty({ type: String, description: '用户姓名', default: 'example', required: true })
  name: string;
  @ApiProperty({ type: String, description: '用户密码', default: '123456', required: true })
  password: string;
}

export class UpdateUserDto extends CreateUserDto{
  @ApiProperty({ type: Number, description: '用户id',default: 0, required: true })
  id: number;
  createTime?: string;
  updateTime?: string;
  @ApiProperty({ type: String, description: '用户电话',default: '13523458907', required: false })
  phone?: string;
}

export class ToAssignRoleDto {
  @ApiProperty({ type: [Number], description: '角色id列表',default: [0], required: true })
  roleIdList: number[];
  @ApiProperty({ type: Number, description: '用户id',default: 0, required: true })
  userId: number
}

export interface IQueryUserDto extends QueryUserDto{}
export interface ICreateUserDto extends UpdateUserDto{}
export interface IUpdateUserDto extends UpdateUserDto{}
export interface IToAssignRoleDto extends ToAssignRoleDto {}