import { ApiProperty } from '@nestjs/swagger';

export class CreateRoleDto {
  @ApiProperty({ type: Number, description: '角色名称', default: 'cv工程师', required: true })
  roleName: string;
}

export class UpdateRoleDto extends CreateRoleDto {
  @ApiProperty({ type: Number, description: '角色id', default: 16, required: true })
  id: number;
  createTime?: string;
  updateTime?: string;
}

export interface ICreateRoleDto extends CreateRoleDto {}

export interface IUpdateRoleDto extends UpdateRoleDto {}

export interface IQueryRoleDto extends CreateRoleDto {}
